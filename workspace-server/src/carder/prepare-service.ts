import type { AssetIndexerService } from '../assets/indexer';
import type { ArtVariantSnapshot, AssetRole } from '../assets/types';
import type { CanonicalDomainService } from '../canonical/service';
import type { CanonicalCardSnapshot, CanonicalLanguage } from '../canonical/types';
import type { CarderAssetGrantRegistry } from './asset-grants';
import { CarderPrepareError } from './errors';
import { assertStructureMappable } from './mapping-precheck';
import {
    buildAssetContentUrl,
    type PrepareWorkingCardDto,
    type PrepareWorkingCardRequest,
} from './prepare-dto';

const textBlock = (language: CanonicalLanguage) => `TEXT:${language}` as const;

const confirmationState = (card: CanonicalCardSnapshot, block: string) =>
    card.confirmations.find(item => item.block === block)?.state ?? 'DRAFT';

const requireConfirmed = (card: CanonicalCardSnapshot, block: string) => {
    if (confirmationState(card, block) !== 'CONFIRMED') {
        throw new CarderPrepareError(
            'CARDER_PREPARATION_NOT_READY',
            `Block ${block} must be CONFIRMED before Carder prepare.`,
        );
    }
};

const findVariant = (variants: ArtVariantSnapshot[], variantId: string, cardId: string) => {
    const variant = variants.find(item => item.variantId === variantId);
    if (!variant || variant.cardId !== cardId) {
        throw new CarderPrepareError(
            'NOT_FOUND',
            `Art variant ${variantId} was not found for card ${cardId}.`,
        );
    }
    return variant;
};

const compositionReadiness = (
    variant: ArtVariantSnapshot,
    composition: PrepareWorkingCardRequest['composition'],
) => (composition === 'STANDARD' ? variant.standard : variant.overframe);

// Validates and selects the emitted assets; URLs (with grants) are composed only
// after every prepare gate has passed (QA-009-08, Design D-5).
const selectArtworkAssets = (
    variant: ArtVariantSnapshot,
    sources: AssetRole[],
) => sources.map(role => {
    const asset = variant.roles[role];
    if (!asset || !asset.contentHash) {
        throw new CarderPrepareError(
            'CARDER_PREPARATION_NOT_READY',
            `Composition READY sources require bound asset with hash for role ${role}.`,
        );
    }
    if (!asset.present || !asset.validAsset) {
        throw new CarderPrepareError(
            'CARDER_PREPARATION_NOT_READY',
            `Composition READY sources require present valid asset for role ${role}.`,
        );
    }
    return {
        role,
        asset_id: asset.assetId,
        hash: asset.contentHash,
    };
});

const toStructureDto = (card: CanonicalCardSnapshot): PrepareWorkingCardDto['structure'] => {
    const structure = card.structure;
    if (!structure) {
        throw new CarderPrepareError(
            'CARDER_PREPARATION_NOT_READY',
            'STRUCTURE is CONFIRMED but structure snapshot is missing.',
        );
    }

    if (structure.kind === 'MONSTER') {
        return {
            family: 'MONSTER',
            summon_kind: structure.summonKind,
            attribute_code: structure.attributeCode,
            race_code: structure.raceCode,
            level: structure.level,
            rank: structure.rank,
            atk: structure.atk,
            def: structure.def,
            pendulum_scale: structure.pendulumScale,
            abilities: [...structure.abilities],
            link_markers: [...structure.linkMarkers],
            link_rating: structure.linkRating,
            subtype_code: null,
            password: card.password,
        };
    }

    if (structure.kind === 'TOKEN') {
        return {
            family: 'TOKEN',
            summon_kind: null,
            attribute_code: structure.attributeCode,
            race_code: structure.raceCode,
            level: structure.level,
            rank: null,
            atk: structure.atk,
            def: structure.def,
            pendulum_scale: null,
            abilities: [],
            link_markers: [],
            link_rating: null,
            subtype_code: null,
            password: card.password,
        };
    }

    if (structure.kind === 'SPELL') {
        return {
            family: 'SPELL',
            summon_kind: null,
            attribute_code: null,
            race_code: null,
            level: null,
            rank: null,
            atk: null,
            def: null,
            pendulum_scale: null,
            abilities: [],
            link_markers: [],
            link_rating: null,
            subtype_code: structure.subtypeCode,
            password: card.password,
        };
    }

    return {
        family: 'TRAP',
        summon_kind: null,
        attribute_code: null,
        race_code: null,
        level: null,
        rank: null,
        atk: null,
        def: null,
        pendulum_scale: null,
        abilities: [],
        link_markers: [],
        link_rating: null,
        subtype_code: structure.subtypeCode,
        password: card.password,
    };
};

export class CarderPrepareService {
    constructor(
        private readonly canonical: CanonicalDomainService,
        private readonly assets: AssetIndexerService,
        private readonly grants: CarderAssetGrantRegistry,
    ) {}

    prepareWorkingCard(input: PrepareWorkingCardRequest): PrepareWorkingCardDto {
        const card = this.canonical.getCard(input.cardId);
        if (!card) {
            throw new CarderPrepareError(
                'NOT_FOUND',
                `Canonical card ${input.cardId} was not found.`,
            );
        }

        requireConfirmed(card, 'STRUCTURE');
        requireConfirmed(card, textBlock(input.contentLanguage));

        if (String(card.revision) !== input.expectedRevision) {
            throw new CarderPrepareError(
                'REVISION_CONFLICT',
                `Canonical card ${input.cardId} revision does not match expected_revision.`,
            );
        }

        const variants = this.assets.listVariants(input.cardId);
        const variant = findVariant(variants, input.variantId, input.cardId);
        const readiness = compositionReadiness(variant, input.composition);
        if (readiness.state !== 'READY' || readiness.sources.length === 0) {
            throw new CarderPrepareError(
                'CARDER_PREPARATION_NOT_READY',
                `${input.composition} composition is not READY for variant ${input.variantId}.`,
            );
        }

        assertStructureMappable(card.family, card.structure);

        const localization = card.localizations.find(
            item => item.language === input.contentLanguage,
        );
        if (!localization) {
            throw new CarderPrepareError(
                'CARDER_PREPARATION_NOT_READY',
                `Confirmed TEXT:${input.contentLanguage} localization row is missing.`,
            );
        }

        const selectedAssets = selectArtworkAssets(variant, readiness.sources);
        const structure = toStructureDto(card);
        const revision = String(card.revision);

        // QA-009-08: issue grants only at the very end of a successful prepare, one per
        // emitted asset, scoped to {card, variant, composition, revision, asset, hash}.
        // In-memory only — prepare stays read-only (no DB/domain/index/FS writes, no scan).
        const artworkAssets = selectedAssets.map(asset => ({
            ...asset,
            content_url: buildAssetContentUrl(
                asset.asset_id,
                asset.hash,
                this.grants.issue({
                    cardId: card.cardId,
                    variantId: variant.variantId,
                    composition: input.composition,
                    revision,
                    assetId: asset.asset_id,
                    hash: asset.hash,
                    role: asset.role,
                }),
            ),
        }));

        return {
            identity: {
                card_id: card.cardId,
                revision,
                variant_id: variant.variantId,
                composition: input.composition,
                content_language: input.contentLanguage,
            },
            localized: {
                name: localization.name,
                card_text: localization.cardText,
                pendulum_text: localization.pendulumText,
            },
            structure,
            artwork: {
                composition: input.composition,
                sources: [...readiness.sources],
                assets: artworkAssets,
            },
        };
    }
}
