import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { inflateSync } from 'node:zlib';
import { decode as decodeJpeg } from 'jpeg-js';
import type { AssetRole, ImageInspection } from './types';

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const crcTable = (() => {
    const table = new Uint32Array(256);
    for (let index = 0; index < 256; index += 1) {
        let value = index;
        for (let bit = 0; bit < 8; bit += 1) {
            value = (value & 1) ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
        }
        table[index] = value >>> 0;
    }
    return table;
})();

const crc32 = (buffer: Buffer) => {
    let crc = 0xffffffff;
    for (const byte of buffer) crc = (crcTable[(crc ^ byte) & 0xff] ?? 0) ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
};

const supportedByRole: Record<AssetRole, ReadonlySet<string>> = {
    BS: new Set(['png', 'jpg', 'jpeg', 'bmp']),
    BG: new Set(['png', 'jpg', 'jpeg', 'bmp']),
    OF: new Set(['png']),
};

export const isSupportedAssetFormat = (role: AssetRole, extension: string) =>
    supportedByRole[role].has(extension.toLowerCase());

const paeth = (left: number, up: number, upperLeft: number) => {
    const prediction = left + up - upperLeft;
    const leftDistance = Math.abs(prediction - left);
    const upDistance = Math.abs(prediction - up);
    const upperLeftDistance = Math.abs(prediction - upperLeft);
    if (leftDistance <= upDistance && leftDistance <= upperLeftDistance) return left;
    if (upDistance <= upperLeftDistance) return up;
    return upperLeft;
};

const unfilterRows = (
    inflated: Buffer,
    offset: number,
    rowCount: number,
    rowBytes: number,
    bytesPerPixel: number,
) => {
    const rows: Buffer[] = [];
    let cursor = offset;
    let previous = Buffer.alloc(rowBytes);
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
        if (cursor + 1 + rowBytes > inflated.length) {
            throw new Error('PNG decompressed data ended unexpectedly.');
        }
        const filter = inflated[cursor] ?? 255;
        cursor += 1;
        const encoded = inflated.subarray(cursor, cursor + rowBytes);
        cursor += rowBytes;
        const decoded = Buffer.alloc(rowBytes);
        for (let index = 0; index < rowBytes; index += 1) {
            const raw = encoded[index] ?? 0;
            const left = index >= bytesPerPixel ? decoded[index - bytesPerPixel] ?? 0 : 0;
            const up = previous[index] ?? 0;
            const upperLeft = index >= bytesPerPixel ? previous[index - bytesPerPixel] ?? 0 : 0;
            let value: number;
            if (filter === 0) value = raw;
            else if (filter === 1) value = raw + left;
            else if (filter === 2) value = raw + up;
            else if (filter === 3) value = raw + Math.floor((left + up) / 2);
            else if (filter === 4) value = raw + paeth(left, up, upperLeft);
            else throw new Error(`Unsupported PNG filter type ${filter}.`);
            decoded[index] = value & 0xff;
        }
        rows.push(decoded);
        previous = decoded;
    }
    return { rows, nextOffset: cursor };
};

const readSample = (
    row: Buffer,
    pixelIndex: number,
    sampleIndex: number,
    channels: number,
    bitDepth: number,
) => {
    const sampleNumber = pixelIndex * channels + sampleIndex;
    if (bitDepth === 16) return row.readUInt16BE(sampleNumber * 2);
    if (bitDepth === 8) return row[sampleNumber] ?? 0;
    if (channels !== 1) throw new Error('Packed PNG samples are only valid for single-channel data here.');
    const bitOffset = sampleNumber * bitDepth;
    const byte = row[Math.floor(bitOffset / 8)] ?? 0;
    const shift = 8 - bitDepth - (bitOffset % 8);
    return (byte >> shift) & ((1 << bitDepth) - 1);
};

const hasTransparentPixel = (
    rows: Buffer[],
    width: number,
    colorType: number,
    bitDepth: number,
    transparency: Buffer | null,
) => {
    const channelsByColorType: Record<number, number> = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };
    const channels = channelsByColorType[colorType];
    if (!channels) throw new Error(`Unsupported PNG color type ${colorType}.`);
    const maxSample = bitDepth === 16 ? 65535 : (1 << bitDepth) - 1;

    for (const row of rows) {
        for (let pixel = 0; pixel < width; pixel += 1) {
            if (colorType === 4) {
                if (readSample(row, pixel, 1, channels, bitDepth) < maxSample) return true;
            } else if (colorType === 6) {
                if (readSample(row, pixel, 3, channels, bitDepth) < maxSample) return true;
            } else if (colorType === 3 && transparency) {
                const paletteIndex = readSample(row, pixel, 0, channels, bitDepth);
                if ((transparency[paletteIndex] ?? 255) < 255) return true;
            } else if (colorType === 0 && transparency?.length === 2) {
                const transparentGray = transparency.readUInt16BE(0);
                if (readSample(row, pixel, 0, channels, bitDepth) === transparentGray) return true;
            } else if (colorType === 2 && transparency?.length === 6) {
                const r = transparency.readUInt16BE(0);
                const g = transparency.readUInt16BE(2);
                const b = transparency.readUInt16BE(4);
                if (
                    readSample(row, pixel, 0, channels, bitDepth) === r
                    && readSample(row, pixel, 1, channels, bitDepth) === g
                    && readSample(row, pixel, 2, channels, bitDepth) === b
                ) return true;
            }
        }
    }
    return false;
};

const inspectPng = (contents: Buffer) => {
    if (contents.length < 33 || !contents.subarray(0, 8).equals(PNG_SIGNATURE)) {
        throw new Error('Invalid PNG signature.');
    }

    let cursor = 8;
    let width = 0;
    let height = 0;
    let bitDepth = 0;
    let colorType = -1;
    let interlace = -1;
    let transparency: Buffer | null = null;
    const idat: Buffer[] = [];
    let sawHeader = false;
    let sawPalette = false;
    let paletteEntries = 0;
    let sawTransparency = false;
    let sawIdat = false;
    let idatEnded = false;
    let sawEnd = false;
    let chunkIndex = 0;

    while (cursor + 12 <= contents.length) {
        const length = contents.readUInt32BE(cursor);
        const type = contents.toString('ascii', cursor + 4, cursor + 8);
        if (!/^[A-Za-z]{4}$/.test(type)) throw new Error('PNG chunk type is invalid.');
        const dataStart = cursor + 8;
        const dataEnd = dataStart + length;
        const chunkEnd = dataEnd + 4;
        if (chunkEnd > contents.length) throw new Error('PNG chunk exceeds file length.');
        const data = contents.subarray(dataStart, dataEnd);
        const storedCrc = contents.readUInt32BE(dataEnd);
        const calculatedCrc = crc32(contents.subarray(cursor + 4, dataEnd));
        if (storedCrc !== calculatedCrc) throw new Error(`PNG chunk ${type} CRC mismatch.`);

        if (chunkIndex === 0 && type !== 'IHDR') throw new Error('PNG IHDR must be the first chunk.');
        if (type !== 'IHDR' && !sawHeader) throw new Error('PNG data appeared before IHDR.');

        if (type === 'IHDR') {
            if (sawHeader || chunkIndex !== 0 || length !== 13) throw new Error('Invalid PNG IHDR.');
            sawHeader = true;
            width = data.readUInt32BE(0);
            height = data.readUInt32BE(4);
            bitDepth = data[8] ?? 0;
            colorType = data[9] ?? -1;
            const compression = data[10] ?? -1;
            const filterMethod = data[11] ?? -1;
            interlace = data[12] ?? -1;
            if (width <= 0 || height <= 0 || compression !== 0 || filterMethod !== 0 || ![0, 1].includes(interlace)) {
                throw new Error('Unsupported or invalid PNG header.');
            }
        } else if (type === 'PLTE') {
            if (sawPalette || sawIdat) throw new Error('PNG PLTE is duplicated or appears after IDAT.');
            if ([0, 4].includes(colorType)) throw new Error('PNG PLTE is not valid for grayscale color types.');
            if (length === 0 || length % 3 !== 0 || length > 768) throw new Error('PNG PLTE length is invalid.');
            paletteEntries = length / 3;
            if (colorType === 3 && paletteEntries > (1 << bitDepth)) {
                throw new Error('PNG PLTE has more entries than indexed bit depth permits.');
            }
            sawPalette = true;
        } else if (type === 'tRNS') {
            if (sawTransparency || sawIdat) throw new Error('PNG tRNS is duplicated or appears after IDAT.');
            if (colorType === 0) {
                if (length !== 2) throw new Error('PNG grayscale tRNS length is invalid.');
            } else if (colorType === 2) {
                if (length !== 6) throw new Error('PNG truecolor tRNS length is invalid.');
            } else if (colorType === 3) {
                if (!sawPalette || length === 0 || length > paletteEntries) {
                    throw new Error('PNG indexed tRNS requires a valid preceding PLTE.');
                }
            } else {
                throw new Error('PNG tRNS is not valid for alpha-bearing color types.');
            }
            sawTransparency = true;
            transparency = Buffer.from(data);
        } else if (type === 'IDAT') {
            if (idatEnded) throw new Error('PNG IDAT chunks must be consecutive.');
            sawIdat = true;
            idat.push(Buffer.from(data));
        } else if (type === 'IEND') {
            if (length !== 0 || !sawIdat) throw new Error('PNG IEND is invalid or appears before image data.');
            sawEnd = true;
            cursor = chunkEnd;
            if (cursor !== contents.length) throw new Error('PNG contains trailing data after IEND.');
            break;
        } else {
            if (sawIdat) idatEnded = true;
            const firstTypeByte = type.charCodeAt(0);
            const critical = firstTypeByte >= 65 && firstTypeByte <= 90;
            if (critical) throw new Error(`Unsupported PNG critical chunk ${type}.`);
        }

        cursor = chunkEnd;
        chunkIndex += 1;
    }

    if (!sawHeader || !sawEnd || !sawIdat || idat.length === 0) {
        throw new Error('PNG is missing required chunks.');
    }

    const validDepths: Record<number, number[]> = {
        0: [1, 2, 4, 8, 16],
        2: [8, 16],
        3: [1, 2, 4, 8],
        4: [8, 16],
        6: [8, 16],
    };
    if (!validDepths[colorType]?.includes(bitDepth)) throw new Error('Unsupported PNG bit depth/color type combination.');
    if (colorType === 3 && !sawPalette) throw new Error('Indexed PNG is missing required PLTE.');

    const channelsByColorType: Record<number, number> = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };
    const channels = channelsByColorType[colorType] ?? 0;
    const bitsPerPixel = channels * bitDepth;
    const bytesPerPixel = Math.max(1, Math.ceil(bitsPerPixel / 8));
    const inflated = inflateSync(Buffer.concat(idat));
    let dataOffset = 0;
    let hasTransparency = false;

    if (interlace === 0) {
        const rowBytes = Math.ceil(width * bitsPerPixel / 8);
        const decoded = unfilterRows(inflated, dataOffset, height, rowBytes, bytesPerPixel);
        dataOffset = decoded.nextOffset;
        hasTransparency = hasTransparentPixel(decoded.rows, width, colorType, bitDepth, transparency);
    } else {
        const passes = [
            [0, 0, 8, 8], [4, 0, 8, 8], [0, 4, 4, 8], [2, 0, 4, 4],
            [0, 2, 2, 4], [1, 0, 2, 2], [0, 1, 1, 2],
        ] as const;
        for (const [xStart, yStart, xStep, yStep] of passes) {
            const passWidth = width <= xStart ? 0 : Math.ceil((width - xStart) / xStep);
            const passHeight = height <= yStart ? 0 : Math.ceil((height - yStart) / yStep);
            if (passWidth === 0 || passHeight === 0) continue;
            const rowBytes = Math.ceil(passWidth * bitsPerPixel / 8);
            const decoded = unfilterRows(inflated, dataOffset, passHeight, rowBytes, bytesPerPixel);
            dataOffset = decoded.nextOffset;
            if (hasTransparentPixel(decoded.rows, passWidth, colorType, bitDepth, transparency)) {
                hasTransparency = true;
            }
        }
    }

    if (dataOffset !== inflated.length) throw new Error('PNG decompressed payload has unexpected trailing data.');
    return { width, height, hasTransparency };
};

const inspectJpeg = (contents: Buffer) => {
    if (
        contents.length < 8
        || contents[0] !== 0xff
        || contents[1] !== 0xd8
        || contents[contents.length - 2] !== 0xff
        || contents[contents.length - 1] !== 0xd9
    ) {
        throw new Error('Invalid JPEG SOI/EOI framing.');
    }

    const decoded = decodeJpeg(contents, {
        useTArray: true,
        formatAsRGBA: false,
        tolerantDecoding: false,
        maxResolutionInMP: 100,
        maxMemoryUsageInMB: 256,
    });
    if (decoded.width <= 0 || decoded.height <= 0 || decoded.data.length === 0) {
        throw new Error('JPEG decoder produced no usable image payload.');
    }
    return { width: decoded.width, height: decoded.height, hasTransparency: false };
};

const inspectBmp = (contents: Buffer) => {
    if (contents.length < 54 || contents.toString('ascii', 0, 2) !== 'BM') {
        throw new Error('Invalid BMP signature/header.');
    }
    const declaredSize = contents.readUInt32LE(2);
    const pixelOffset = contents.readUInt32LE(10);
    const dibSize = contents.readUInt32LE(14);
    if (declaredSize !== contents.length) throw new Error('BMP declared file size does not match payload length.');
    if (dibSize < 40 || 14 + dibSize > contents.length) throw new Error('Unsupported or truncated BMP DIB header.');

    const width = contents.readInt32LE(18);
    const rawHeight = contents.readInt32LE(22);
    const planes = contents.readUInt16LE(26);
    const bitsPerPixel = contents.readUInt16LE(28);
    const compression = contents.readUInt32LE(30);
    if (
        width <= 0
        || rawHeight === 0
        || planes !== 1
        || ![1, 4, 8, 16, 24, 32].includes(bitsPerPixel)
        || pixelOffset < 14 + dibSize
        || pixelOffset > contents.length
    ) {
        throw new Error('Invalid BMP dimensions or pixel metadata.');
    }

    // RUN 004 deliberately supports only BI_RGB. RLE/bitfield/JPEG/PNG-compressed
    // BMP payloads are rejected until a decoder for those encodings exists.
    if (compression !== 0) {
        throw new Error(`Unsupported BMP compression mode ${compression}; only uncompressed BI_RGB is validated.`);
    }

    if (bitsPerPixel <= 8) {
        const colorsUsed = contents.readUInt32LE(46);
        const maximumPaletteEntries = 1 << bitsPerPixel;
        if (colorsUsed > maximumPaletteEntries) throw new Error('BMP palette size exceeds bit depth.');
        const paletteEntries = colorsUsed === 0 ? maximumPaletteEntries : colorsUsed;
        const paletteEnd = 14 + dibSize + paletteEntries * 4;
        if (pixelOffset < paletteEnd) throw new Error('BMP indexed-color palette is truncated.');
    }

    const rowStride = Math.floor((bitsPerPixel * width + 31) / 32) * 4;
    const requiredBytes = rowStride * Math.abs(rawHeight);
    if (!Number.isSafeInteger(requiredBytes) || pixelOffset + requiredBytes > contents.length) {
        throw new Error('BMP pixel data is truncated.');
    }
    return { width, height: Math.abs(rawHeight), hasTransparency: false };
};

export const inspectAssetImage = async (
    filePath: string,
    role: AssetRole,
    extension: string,
): Promise<ImageInspection> => {
    const normalizedExtension = extension.toLowerCase();
    if (!isSupportedAssetFormat(role, normalizedExtension)) {
        throw new Error(`Unsupported ${role} format: ${normalizedExtension}.`);
    }

    const contents = await readFile(filePath);
    let decoded: { width: number; height: number; hasTransparency: boolean };
    if (normalizedExtension === 'png') decoded = inspectPng(contents);
    else if (normalizedExtension === 'jpg' || normalizedExtension === 'jpeg') decoded = inspectJpeg(contents);
    else if (normalizedExtension === 'bmp') decoded = inspectBmp(contents);
    else throw new Error(`Unsupported image extension: ${normalizedExtension}.`);

    return {
        ...decoded,
        contentHash: createHash('sha256').update(contents).digest('hex'),
    };
};
