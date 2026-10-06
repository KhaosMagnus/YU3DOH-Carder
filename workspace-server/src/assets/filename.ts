import path from 'node:path';
import { ASSET_ROLES, type AssetRole, type ParsedAssetFilename } from './types';

const variantPattern = /^[A-Za-z0-9_]+$/;

export const normalizeVariantKey = (value: string) => {
    const normalized = value.normalize('NFKC').trim();
    if (!variantPattern.test(normalized)) {
        throw new Error('Variant key must contain only letters, numbers, and underscore.');
    }
    return normalized.toLowerCase();
};

export const normalizeAssociationName = (value: string) =>
    value
        .normalize('NFKC')
        .replace(/_/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLocaleLowerCase('en-US');

const asRole = (value: string): AssetRole | null => {
    const normalized = value.toUpperCase();
    return ASSET_ROLES.includes(normalized as AssetRole) ? normalized as AssetRole : null;
};

export const parseAssetFilename = (fileName: string): ParsedAssetFilename => {
    const extensionWithDot = path.extname(fileName);
    if (!extensionWithDot || extensionWithDot === fileName) {
        throw new Error('Asset filename must include an extension.');
    }
    const extension = extensionWithDot.slice(1).toLowerCase();
    const stem = fileName.slice(0, -extensionWithDot.length);
    const parts = stem.split('-');
    if (parts.length < 3) {
        throw new Error('Asset filename does not match the expected identity-role-variant grammar.');
    }

    const variantLabel = parts.at(-1)?.trim() ?? '';
    const roleText = parts.at(-2)?.trim() ?? '';
    const identityParts = parts.slice(0, -2);
    const role = asRole(roleText);
    if (!role) throw new Error(`Unsupported asset role: ${roleText || '(empty)'}.`);
    const variantKey = normalizeVariantKey(variantLabel);

    let password: string | null = null;
    let cardNameParts = identityParts;
    const first = identityParts[0] ?? '';
    if (/^\d+$/.test(first) && identityParts.length >= 2) {
        password = first;
        cardNameParts = identityParts.slice(1);
    }

    const cardName = cardNameParts.join('-').trim();
    if (!cardName) throw new Error('Asset filename must include a card-name association hint.');

    return {
        fileName,
        extension,
        password,
        cardName,
        role,
        variantLabel,
        variantKey,
    };
};
