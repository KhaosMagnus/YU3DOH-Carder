import { useMemo, useState } from 'react';
import { Alert, Button, Input, Select } from 'antd';
import { ingestManagedLibraryAsset } from './api';
import { formatIngestError } from './asset-channels';
import { createIngestKeyCycle } from './asset-state';
import { ASSET_ROLES, type AssetRole } from './model';

const { Option } = Select;

type Props = {
    cardId: string;
    knownVariantKeys: string[];
    onSuccess: () => void;
    error: string | null;
    onError: (message: string | null) => void;
};

export const IngestForm = ({
    cardId,
    knownVariantKeys,
    onSuccess,
    error,
    onError,
}: Props) => {
    const keyCycle = useMemo(() => createIngestKeyCycle(), []);
    const [variantKey, setVariantKey] = useState('Default');
    const [role, setRole] = useState<AssetRole>('BS');
    const [sourceFile, setSourceFile] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const submit = async () => {
        onError(null);
        setSubmitting(true);
        const idempotencyKey = keyCycle.current();
        try {
            await ingestManagedLibraryAsset(cardId, {
                variant_key: variantKey.trim(),
                role,
                source_file: sourceFile,
                idempotency_key: idempotencyKey,
            });
            setSourceFile('');
            keyCycle.refresh();
            onSuccess();
        } catch (err) {
            // Preserve form inputs on failure; reuse same idempotency key on retry.
            onError(formatIngestError(err));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="library-ingest" aria-label="Managed asset ingest">
            <h4>Ingest managed asset</h4>
            <p className="library-muted">
                <code>source_file</code> is a local filesystem path readable by the Workspace Service
                (for example <code>C:\Users\...\artwork.png</code>). Browser file pickers are not used.
            </p>
            <div className="library-field-grid">
                <label>
                    Variant key
                    <Input
                        list="library-known-variants"
                        value={variantKey}
                        onChange={event => setVariantKey(event.target.value)}
                        disabled={submitting}
                    />
                    <datalist id="library-known-variants">
                        {knownVariantKeys.map(key => <option key={key} value={key} />)}
                    </datalist>
                </label>
                <label>
                    Role
                    <Select
                        value={role}
                        onChange={value => setRole(value as AssetRole)}
                        disabled={submitting}
                        style={{ width: '100%' }}
                    >
                        {ASSET_ROLES.map(value => <Option key={value} value={value}>{value}</Option>)}
                    </Select>
                </label>
                <label className="library-ingest__path">
                    Local source path
                    <Input
                        value={sourceFile}
                        onChange={event => setSourceFile(event.target.value)}
                        placeholder="Absolute path with spaces/Unicode supported"
                        disabled={submitting}
                    />
                </label>
            </div>
            {error && <Alert type="error" showIcon message="Managed ingest failed" description={error} />}
            <Button
                type="primary"
                loading={submitting}
                disabled={!variantKey.trim() || !sourceFile.trim() || submitting}
                onClick={() => { void submit(); }}
            >
                Ingest managed asset
            </Button>
        </section>
    );
};
