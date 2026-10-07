import type { AssetRole } from '../assets/types';
import type { CanonicalLanguage } from '../canonical/types';

export type CarderComposition = 'STANDARD' | 'OVERFRAME';

export type PrepareWorkingCardRequest = {
    cardId: string;
    variantId: string;
    composition: CarderComposition;
    contentLanguage: CanonicalLanguage;
    expectedRevision: string;
};

export type PrepareArtworkAssetDto = {
    role: AssetRole;
    asset_id: string;
    hash: string;
    content_url: string;
};

export type PrepareWorkingCardDto = {
    identity: {
        card_id: string;
        revision: string;
        variant_id: string;
        composition: CarderComposition;
        content_language: CanonicalLanguage;
    };
    localized: {
        name: string | null;
        card_text: string | null;
        pendulum_text: string | null;
    };
    structure: {
        family: 'MONSTER' | 'SPELL' | 'TRAP' | 'TOKEN';
        summon_kind: string | null;
        attribute_code: string | null;
        race_code: string | null;
        level: number | null;
        rank: number | null;
        atk: number | '?' | null;
        def: number | '?' | null;
        pendulum_scale: number | null;
        abilities: string[];
        link_markers: string[];
        link_rating: number | null;
        subtype_code: string | null;
        password: string | null;
    };
    artwork: {
        composition: CarderComposition;
        sources: AssetRole[];
        assets: PrepareArtworkAssetDto[];
    };
};

/**
 * QA-009-08: content URLs carry an opaque prepared-composition grant. The URL stays
 * relative and path-free (asset_id + hash + random token only).
 */
export const buildAssetContentUrl = (assetId: string, hash: string, grant: string) =>
    `/api/v1/carder/assets/${encodeURIComponent(assetId)}/content?hash=${encodeURIComponent(hash)}&grant=${encodeURIComponent(grant)}`;

export type PrepareWorkingCardHttpBody = {
    card_id: string;
    variant_id: string;
    composition: CarderComposition;
    content_language: CanonicalLanguage;
    expected_revision: string;
};

export const toPrepareWorkingCardRequest = (
    body: PrepareWorkingCardHttpBody,
): PrepareWorkingCardRequest => ({
    cardId: body.card_id,
    variantId: body.variant_id,
    composition: body.composition,
    contentLanguage: body.content_language,
    expectedRevision: body.expected_revision,
});
