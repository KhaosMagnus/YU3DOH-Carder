import { defaultCarderVariant } from './variant-lifecycle-state';
import { useMemo, useState } from 'react';
import { Alert, Button, Select } from 'antd';
import { LibraryHttpError, prepareWorkingCardRequest } from './api';
import {
    getConfirmationState,
    type LibraryCardDetail,
    type LibraryLanguage,
    type LibraryVariantDetail,
} from './model';
import { buildCarderLaunchUrl } from '../service/workspace-bridge/intent';
import { PUBLIC_PATH } from '../model/app';

type Composition = 'STANDARD' | 'OVERFRAME';

type Props = {
    detail: LibraryCardDetail;
    variants: LibraryVariantDetail[];
    dirty: boolean;
    preferredVariantId?: string | null;
};

const confirmedLanguages = (detail: LibraryCardDetail): LibraryLanguage[] =>
    (['EN', 'ES', 'JP'] as LibraryLanguage[]).filter(
        language => getConfirmationState(detail, `TEXT:${language}`) === 'CONFIRMED',
    );

export const formatCarderOpenError = (error: unknown): string => {
    if (error instanceof LibraryHttpError) {
        return `${error.code}: ${error.message}`;
    }
    if (error instanceof Error) return error.message;
    return 'Open in Carder failed.';
};

export const canOpenComposition = (
    variant: LibraryVariantDetail | undefined,
    composition: Composition,
): boolean => {
    if (!variant) return false;
    return composition === 'STANDARD'
        ? variant.standard.state === 'READY'
        : variant.overframe.state === 'READY';
};

export const OpenInCarderPanel = ({ detail, variants, dirty, preferredVariantId = null }: Props) => {
    const languages = useMemo(() => confirmedLanguages(detail), [detail]);
    const [language, setLanguage] = useState<LibraryLanguage | ''>(languages[0] ?? '');
    const [choice, setChoice] = useState<{ id: string; card: string; preferred: string | null } | null>(null);
    const fallback = defaultCarderVariant(variants, preferredVariantId);
    const variantId = choice?.card === detail.card_id && choice.preferred === preferredVariantId
        && variants.some(v => v.variant_id === choice.id) ? choice.id : fallback;
    const setVariantId = (id: string) => setChoice({ id, card: detail.card_id, preferred: preferredVariantId });
    const [error, setError] = useState<string | null>(null);
    const [opening, setOpening] = useState(false);
    const [openedNotice, setOpenedNotice] = useState<string | null>(null);

    const selectedVariant = variants.find(item => item.variant_id === variantId);
    const standardReady = canOpenComposition(selectedVariant, 'STANDARD');
    const overframeReady = canOpenComposition(selectedVariant, 'OVERFRAME');
    const languageReady = language !== '' && languages.includes(language);
    const blockedByDirty = dirty;

    const launch = async (composition: Composition) => {
        setError(null);
        setOpenedNotice(null);
        if (blockedByDirty) {
            setError('Save or discard Canonical editor changes before Open in Carder.');
            return;
        }
        if (!languageReady || !selectedVariant) {
            setError('Select a confirmed language and Art Variant before Open in Carder.');
            return;
        }
        if (!canOpenComposition(selectedVariant, composition)) {
            setError(`${composition} composition is not READY for the selected variant.`);
            return;
        }

        setOpening(true);
        try {
            await prepareWorkingCardRequest({
                card_id: detail.card_id,
                variant_id: selectedVariant.variant_id,
                composition,
                content_language: language as LibraryLanguage,
                expected_revision: detail.revision,
            });
            const intentUrl = buildCarderLaunchUrl(`${PUBLIC_PATH}/`, {
                cardId: detail.card_id,
                variantId: selectedVariant.variant_id,
                composition,
                contentLanguage: language as LibraryLanguage,
                revision: detail.revision,
            });
            const tab = window.open(intentUrl, '_blank');
            if (!tab) {
                setError('Carder tab launch was blocked or aborted. Open was not marked successful.');
                return;
            }
            setOpenedNotice(`Launched Carder (${composition}) in a new tab.`);
        } catch (launchError) {
            setError(formatCarderOpenError(launchError));
        } finally {
            setOpening(false);
        }
    };

    return (
        <section className="library-open-carder" aria-label="Open in Carder">
            <h3>Open in Carder</h3>
            <p className="library-muted">
                Prepares a read-only Workspace snapshot and opens Carder working state.
                Working edits are not saved back to Workspace in RUN 009.
            </p>
            {preferredVariantId && selectedVariant?.variant_id === preferredVariantId && <Alert type="info" message={`Preferred Variant selected: ${selectedVariant.display_label}`} />}
            {preferredVariantId && selectedVariant?.variant_id === preferredVariantId && (!standardReady || !overframeReady) && <Alert type="warning" message="Preferred Variant has unavailable composition. It remains selected; choose another variant manually if needed." />}
            {!preferredVariantId && variants.length > 1 && !variantId && <Alert type="info" message="No Preferred Variant. Select a variant explicitly." />}
            {blockedByDirty && (
                <Alert
                    type="warning"
                    showIcon
                    message="Editor has unsaved changes"
                    description="Open in Carder is blocked while the Canonical editor is dirty."
                />
            )}
            {error && (
                <Alert type="error" showIcon message="Open in Carder failed" description={error} />
            )}
            {openedNotice && (
                <Alert type="success" showIcon message={openedNotice} />
            )}
            <div className="library-open-carder__controls">
                <label>
                    Art Variant
                    <Select
                        style={{ width: '100%' }}
                        value={variantId || undefined}
                        placeholder="Select variant"
                        onChange={value => {
                            setVariantId(value);
                            setError(null);
                            setOpenedNotice(null);
                        }}
                        options={variants.map(variant => ({
                            value: variant.variant_id,
                            label: `${variant.display_label} (${variant.variant_key})`,
                        }))}
                    />
                </label>
                <label>
                    Content language
                    <Select
                        style={{ width: '100%' }}
                        value={language || undefined}
                        placeholder={languages.length ? 'Select confirmed language' : 'No confirmed TEXT language'}
                        onChange={value => {
                            setLanguage(value as LibraryLanguage);
                            setError(null);
                            setOpenedNotice(null);
                        }}
                        options={languages.map(item => ({ value: item, label: item }))}
                        disabled={languages.length === 0}
                    />
                </label>
            </div>
            <div className="library-open-carder__actions">
                <Button
                    type="primary"
                    loading={opening}
                    disabled={blockedByDirty || !languageReady || !standardReady || opening}
                    onClick={() => void launch('STANDARD')}
                >
                    Open Standard
                </Button>
                <Button
                    loading={opening}
                    disabled={blockedByDirty || !languageReady || !overframeReady || opening}
                    onClick={() => void launch('OVERFRAME')}
                >
                    Open Overframe
                </Button>
            </div>
        </section>
    );
};
