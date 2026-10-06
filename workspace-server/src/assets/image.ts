import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { inflateSync } from 'node:zlib';
import type { AssetRole, ImageInspection } from './types';

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

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
    let sawEnd = false;

    while (cursor + 12 <= contents.length) {
        const length = contents.readUInt32BE(cursor);
        const type = contents.toString('ascii', cursor + 4, cursor + 8);
        const dataStart = cursor + 8;
        const dataEnd = dataStart + length;
        const chunkEnd = dataEnd + 4;
        if (chunkEnd > contents.length) throw new Error('PNG chunk exceeds file length.');
        const data = contents.subarray(dataStart, dataEnd);

        if (type === 'IHDR') {
            if (sawHeader || length !== 13) throw new Error('Invalid PNG IHDR.');
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
        } else if (type === 'tRNS') {
            transparency = Buffer.from(data);
        } else if (type === 'IDAT') {
            idat.push(Buffer.from(data));
        } else if (type === 'IEND') {
            sawEnd = true;
            break;
        }
        cursor = chunkEnd;
    }

    if (!sawHeader || !sawEnd || idat.length === 0) throw new Error('PNG is missing required chunks.');

    const validDepths: Record<number, number[]> = {
        0: [1, 2, 4, 8, 16],
        2: [8, 16],
        3: [1, 2, 4, 8],
        4: [8, 16],
        6: [8, 16],
    };
    if (!validDepths[colorType]?.includes(bitDepth)) throw new Error('Unsupported PNG bit depth/color type combination.');

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
    if (contents.length < 4 || contents[0] !== 0xff || contents[1] !== 0xd8) {
        throw new Error('Invalid JPEG SOI marker.');
    }
    let width = 0;
    let height = 0;
    let cursor = 2;
    while (cursor + 1 < contents.length) {
        if (contents[cursor] !== 0xff) {
            cursor += 1;
            continue;
        }
        while (contents[cursor] === 0xff) cursor += 1;
        const marker = contents[cursor] ?? -1;
        cursor += 1;
        if (marker === 0xd9) break;
        if (marker === 0x00 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
        if (cursor + 2 > contents.length) throw new Error('Truncated JPEG marker.');
        const length = contents.readUInt16BE(cursor);
        if (length < 2 || cursor + length > contents.length) throw new Error('Invalid JPEG marker length.');
        const isSof = [0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker);
        if (isSof) {
            if (length < 7) throw new Error('Invalid JPEG SOF marker.');
            height = contents.readUInt16BE(cursor + 3);
            width = contents.readUInt16BE(cursor + 5);
        }
        if (marker === 0xda) break;
        cursor += length;
    }
    if (width <= 0 || height <= 0) throw new Error('JPEG dimensions could not be decoded.');
    if (contents.indexOf(Buffer.from([0xff, 0xd9])) < 0) throw new Error('JPEG EOI marker is missing.');
    return { width, height, hasTransparency: false };
};

const inspectBmp = (contents: Buffer) => {
    if (contents.length < 54 || contents.toString('ascii', 0, 2) !== 'BM') {
        throw new Error('Invalid BMP signature/header.');
    }
    const dibSize = contents.readUInt32LE(14);
    if (dibSize < 40) throw new Error('Unsupported BMP DIB header.');
    const width = contents.readInt32LE(18);
    const rawHeight = contents.readInt32LE(22);
    const planes = contents.readUInt16LE(26);
    const bitsPerPixel = contents.readUInt16LE(28);
    const pixelOffset = contents.readUInt32LE(10);
    if (width <= 0 || rawHeight === 0 || planes !== 1 || bitsPerPixel === 0 || pixelOffset > contents.length) {
        throw new Error('Invalid BMP dimensions or pixel metadata.');
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
