import { useState } from 'react';
import { Input, Modal, Select } from 'antd';
import type { LibraryFamily } from './model';
import { LIBRARY_FAMILIES } from './model';

const { Option } = Select;

type Props = {
    open: boolean;
    confirming: boolean;
    onCancel: () => void;
    onCreate: (input: { family: LibraryFamily; password?: string | null }) => void;
};

export const NewDraftModal = ({ open, confirming, onCancel, onCreate }: Props) => {
    const [family, setFamily] = useState<LibraryFamily>('MONSTER');
    const [password, setPassword] = useState('');

    return (
        <Modal
            title="New Draft Canonical Card"
            visible={open}
            confirmLoading={confirming}
            okText="Create Draft"
            onCancel={onCancel}
            onOk={() => {
                if (family === 'TOKEN') {
                    onCreate({ family });
                    return;
                }
                onCreate({
                    family,
                    password: password.trim() ? password.trim() : null,
                });
            }}
            destroyOnClose
        >
            <div className="library-new-draft">
                <label>
                    Family
                    <Select
                        value={family}
                        onChange={value => setFamily(value as LibraryFamily)}
                        style={{ width: '100%' }}
                    >
                        {LIBRARY_FAMILIES.map(value => (
                            <Option key={value} value={value}>{value}</Option>
                        ))}
                    </Select>
                </label>
                {family !== 'TOKEN' && (
                    <label>
                        Password (optional for Draft)
                        <Input
                            value={password}
                            onChange={event => setPassword(event.target.value)}
                            placeholder="Leave blank to omit"
                        />
                    </label>
                )}
                {family === 'TOKEN' && (
                    <p className="library-muted">Token password must remain absent.</p>
                )}
            </div>
        </Modal>
    );
};
