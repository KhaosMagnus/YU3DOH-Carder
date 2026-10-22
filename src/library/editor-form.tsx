import { useState } from 'react';
import { Checkbox, Input, InputNumber, Modal, Select, Switch } from 'antd';
import type {
    LibraryCardDetail,
    LibraryEditorMetadata,
    LibraryLanguage,
} from './model';
import type { WorkingCardForm } from './editor-state';
import {
    emptyStructureForFamily,
    levelRankErrors,
    monsterApplicability,
    proposeMonsterApplicability,
} from './editor-state';

const { Option } = Select;
const { TextArea } = Input;

type Props = {
    family: LibraryCardDetail['family'];
    working: WorkingCardForm;
    metadata: LibraryEditorMetadata | null;
    onChange: (next: WorkingCardForm) => void;
};

const upsertLocalization = (
    working: WorkingCardForm,
    language: LibraryLanguage,
    patch: Partial<WorkingCardForm['localizations'][number]>,
): WorkingCardForm => {
    const existing = working.localizations.find(
        (item) => item.language === language,
    );
    if (!existing) {
        return {
            ...working,
            localizations: [
                ...working.localizations,
                {
                    language,
                    name: null,
                    card_text: null,
                    pendulum_text: null,
                    ...patch,
                },
            ],
        };
    }
    return {
        ...working,
        localizations: working.localizations.map((item) =>
            item.language === language ? { ...item, ...patch } : item,
        ),
    };
};

export const EditorForm = ({ family, working, metadata, onChange }: Props) => {
    const structure = working.structure ?? emptyStructureForFamily(family);
    const applicability = monsterApplicability(structure);
    const [pending, setPending] = useState<ReturnType<
        typeof proposeMonsterApplicability
    > | null>(null);
    const proposeApplicability = (patch: Record<string, unknown>) => {
        const proposal = proposeMonsterApplicability(working, patch);
        if (proposal.clearings.length > 0) setPending(proposal);
        else onChange(proposal.next);
    };

    const setStructure = (patch: Record<string, unknown>) => {
        onChange({
            ...working,
            structure: {
                ...(structure ?? {}),
                ...patch,
                kind:
                    family === 'MONSTER' ||
                    family === 'TOKEN' ||
                    family === 'SPELL' ||
                    family === 'TRAP'
                        ? (structure?.kind ?? family)
                        : family,
            },
        });
    };

    return (
        <div className="library-editor-form">
            <Modal
                title="Confirm structural clearing"
                visible={pending !== null}
                okText="Apply change and clear"
                cancelText="Cancel"
                onCancel={() => setPending(null)}
                onOk={() => {
                    if (pending) onChange(pending.next);
                    setPending(null);
                }}
            >
                <p>This applicability change clears these structural values:</p>
                <ul>
                    {pending?.clearings.map((item) => (
                        <li key={item.field}>
                            {item.field}: {JSON.stringify(item.value)}
                        </li>
                    ))}
                </ul>
                <p>
                    Pendulum text is preserved. This does not acknowledge moving
                    a confirmed block to Draft.
                </p>
            </Modal>
            <section>
                <h3>Identity</h3>
                <div className="library-field-grid">
                    <label>
                        Family
                        <Input value={family} disabled />
                    </label>
                    <label>
                        Password
                        <Input
                            value={working.password ?? ''}
                            disabled={family === 'TOKEN'}
                            placeholder={
                                family === 'TOKEN'
                                    ? 'Absent for Token'
                                    : 'Optional for Draft'
                            }
                            onChange={(event) =>
                                onChange({
                                    ...working,
                                    password: event.target.value.trim()
                                        ? event.target.value
                                        : null,
                                })
                            }
                        />
                    </label>
                </div>
            </section>

            <section>
                <h3>Structure</h3>
                {levelRankErrors(structure).map(error => (
                    <p role="alert" key={error.field} id={`library-${error.field}-error`}>
                        {error.message}
                    </p>
                ))}
                {(family === 'MONSTER' || family === 'TOKEN') && (
                    <div className="library-field-grid">
                        {family === 'MONSTER' && (
                            <label>
                                Summon kind
                                <Select
                                    allowClear
                                    value={
                                        (structure?.summon_kind as
                                            | string
                                            | null) ?? undefined
                                    }
                                    onChange={(value) =>
                                        proposeApplicability({
                                            summon_kind: value ?? null,
                                        })
                                    }
                                    style={{ width: '100%' }}
                                >
                                    {(metadata?.summon_kinds ?? []).map(
                                        (code) => (
                                            <Option key={code} value={code}>
                                                {code}
                                            </Option>
                                        ),
                                    )}
                                </Select>
                            </label>
                        )}
                        <label>
                            Attribute
                            <Select
                                allowClear
                                value={
                                    (structure?.attribute_code as
                                        | string
                                        | null) ?? undefined
                                }
                                onChange={(value) =>
                                    setStructure({
                                        attribute_code: value ?? null,
                                    })
                                }
                                style={{ width: '100%' }}
                            >
                                {(metadata?.attributes ?? []).map((code) => (
                                    <Option key={code} value={code}>
                                        {code}
                                    </Option>
                                ))}
                            </Select>
                        </label>
                        <label>
                            Race
                            <Select
                                allowClear
                                value={
                                    (structure?.race_code as string | null) ??
                                    undefined
                                }
                                onChange={(value) =>
                                    setStructure({ race_code: value ?? null })
                                }
                                style={{ width: '100%' }}
                            >
                                {(metadata?.races ?? []).map((code) => (
                                    <Option key={code} value={code}>
                                        {code}
                                    </Option>
                                ))}
                            </Select>
                        </label>
                        {(family === 'TOKEN' || applicability.level) && (
                            <label>
                                Level
                                <Input
                                    type="number"
                                    min={0}
                                    max={12}
                                    step={1}
                                    aria-label="Level"
                                    aria-invalid={levelRankErrors(structure).some(error => error.field === 'level')}
                                    aria-describedby="library-level-error"
                                    style={{ width: '100%' }}
                                    value={(structure?.level as number | null) ?? ''}
                                    onChange={event => setStructure({
                                        level: event.target.value === '' ? null : Number(event.target.value),
                                    })}
                                />
                            </label>
                        )}
                        {family === 'MONSTER' && applicability.rank && (
                            <label>
                                Rank
                                <Input
                                    type="number"
                                    min={0}
                                    max={13}
                                    step={1}
                                    aria-label="Rank"
                                    aria-invalid={levelRankErrors(structure).some(error => error.field === 'rank')}
                                    aria-describedby="library-rank-error"
                                    style={{ width: '100%' }}
                                    value={(structure?.rank as number | null) ?? ''}
                                    onChange={event => setStructure({
                                        rank: event.target.value === '' ? null : Number(event.target.value),
                                    })}
                                />
                            </label>
                        )}
                        <label>
                            ATK
                            <Input
                                value={
                                    structure?.atk === null ||
                                    structure?.atk === undefined
                                        ? ''
                                        : String(structure.atk)
                                }
                                onChange={(event) => {
                                    const raw = event.target.value.trim();
                                    if (!raw)
                                        return setStructure({ atk: null });
                                    if (raw === '?')
                                        return setStructure({ atk: '?' });
                                    const parsed = Number(raw);
                                    setStructure({
                                        atk: Number.isInteger(parsed)
                                            ? parsed
                                            : null,
                                    });
                                }}
                            />
                        </label>
                        {(family === 'TOKEN' || !applicability.link) && (
                            <label>
                                DEF
                                <Input
                                    value={
                                        structure?.def === null ||
                                        structure?.def === undefined
                                            ? ''
                                            : String(structure.def)
                                    }
                                    onChange={(event) => {
                                        const raw = event.target.value.trim();
                                        if (!raw)
                                            return setStructure({ def: null });
                                        if (raw === '?')
                                            return setStructure({ def: '?' });
                                        const parsed = Number(raw);
                                        setStructure({
                                            def: Number.isInteger(parsed)
                                                ? parsed
                                                : null,
                                        });
                                    }}
                                />
                            </label>
                        )}
                        {family === 'MONSTER' && (
                            <>
                                {!applicability.link && (
                                    <label className="library-inline">
                                        Pendulum
                                        <Switch
                                            aria-label="Pendulum"
                                            checked={applicability.pendulum}
                                            onChange={(checked) =>
                                                proposeApplicability({
                                                    abilities: checked
                                                        ? [
                                                              ...(
                                                                  (structure?.abilities as string[]) ??
                                                                  []
                                                              ).filter(
                                                                  (code) =>
                                                                      code !==
                                                                      'PENDULUM',
                                                              ),
                                                              'PENDULUM',
                                                          ]
                                                        : (
                                                              (structure?.abilities as string[]) ??
                                                              []
                                                          ).filter(
                                                              (code) =>
                                                                  code !==
                                                                  'PENDULUM',
                                                          ),
                                                })
                                            }
                                        />
                                    </label>
                                )}
                                {applicability.pendulum && (
                                    <label>
                                        Pendulum Scale
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            value={
                                                (structure?.pendulum_scale as
                                                    | number
                                                    | null) ?? undefined
                                            }
                                            onChange={(value) =>
                                                setStructure({
                                                    pendulum_scale:
                                                        value ?? null,
                                                })
                                            }
                                        />
                                    </label>
                                )}
                                <label>
                                    Abilities
                                    <Select
                                        mode="multiple"
                                        value={(
                                            (structure?.abilities as string[]) ??
                                            []
                                        ).filter((code) => code !== 'PENDULUM')}
                                        onChange={(value) =>
                                            setStructure({
                                                abilities: [
                                                    ...value.filter(
                                                        (code: string) =>
                                                            code !== 'PENDULUM',
                                                    ),
                                                    ...((
                                                        (structure?.abilities as string[]) ??
                                                        []
                                                    ).includes('PENDULUM')
                                                        ? ['PENDULUM']
                                                        : []),
                                                ],
                                            })
                                        }
                                        style={{ width: '100%' }}
                                    >
                                        {(metadata?.abilities ?? [])
                                            .filter(
                                                (code) => code !== 'PENDULUM',
                                            )
                                            .map((code) => (
                                                <Option key={code} value={code}>
                                                    {code}
                                                </Option>
                                            ))}
                                    </Select>
                                </label>
                                {applicability.link && (
                                    <label>
                                        Link Markers
                                        <Select
                                            mode="multiple"
                                            value={
                                                (structure?.link_markers as string[]) ??
                                                []
                                            }
                                            onChange={(value) =>
                                                setStructure({
                                                    link_markers: value,
                                                })
                                            }
                                            style={{ width: '100%' }}
                                        >
                                            {(metadata?.link_markers ?? []).map(
                                                (code) => (
                                                    <Option
                                                        key={code}
                                                        value={code}
                                                    >
                                                        {code}
                                                    </Option>
                                                ),
                                            )}
                                        </Select>
                                    </label>
                                )}
                                {applicability.link && (
                                    <label>
                                        Link Rating (derived)
                                        <Input
                                            disabled
                                            value={
                                                structure?.summon_kind ===
                                                'LINK'
                                                    ? String(
                                                          (
                                                              (structure?.link_markers as string[]) ??
                                                              []
                                                          ).length,
                                                      )
                                                    : ''
                                            }
                                        />
                                    </label>
                                )}
                            </>
                        )}
                    </div>
                )}
                {family === 'SPELL' && (
                    <label>
                        Spell subtype
                        <Select
                            allowClear
                            value={
                                (structure?.subtype_code as string | null) ??
                                undefined
                            }
                            onChange={(value) =>
                                setStructure({ subtype_code: value ?? null })
                            }
                            style={{ width: '100%' }}
                        >
                            {(metadata?.spell_subtypes ?? []).map((code) => (
                                <Option key={code} value={code}>
                                    {code}
                                </Option>
                            ))}
                        </Select>
                    </label>
                )}
                {family === 'TRAP' && (
                    <label>
                        Trap subtype
                        <Select
                            allowClear
                            value={
                                (structure?.subtype_code as string | null) ??
                                undefined
                            }
                            onChange={(value) =>
                                setStructure({ subtype_code: value ?? null })
                            }
                            style={{ width: '100%' }}
                        >
                            {(metadata?.trap_subtypes ?? []).map((code) => (
                                <Option key={code} value={code}>
                                    {code}
                                </Option>
                            ))}
                        </Select>
                    </label>
                )}
            </section>

            <section>
                <h3>Localized text</h3>
                {(['EN', 'ES', 'JP'] as LibraryLanguage[]).map((language) => {
                    const localization = working.localizations.find(
                        (item) => item.language === language,
                    );
                    return (
                        <div className="library-localization" key={language}>
                            <h4>{language}</h4>
                            <label>
                                Name
                                <Input
                                    value={localization?.name ?? ''}
                                    onChange={(event) =>
                                        onChange(
                                            upsertLocalization(
                                                working,
                                                language,
                                                {
                                                    name: event.target.value.trim()
                                                        ? event.target.value
                                                        : null,
                                                },
                                            ),
                                        )
                                    }
                                />
                            </label>
                            <label>
                                Card text
                                <TextArea
                                    rows={3}
                                    value={localization?.card_text ?? ''}
                                    onChange={(event) =>
                                        onChange(
                                            upsertLocalization(
                                                working,
                                                language,
                                                {
                                                    card_text:
                                                        event.target.value.trim()
                                                            ? event.target.value
                                                            : null,
                                                },
                                            ),
                                        )
                                    }
                                />
                            </label>
                            {family === 'MONSTER' && applicability.pendulum && (
                                <label>
                                    Pendulum text
                                    <TextArea
                                        rows={2}
                                        value={
                                            localization?.pendulum_text ?? ''
                                        }
                                        onChange={(event) =>
                                            onChange(
                                                upsertLocalization(
                                                    working,
                                                    language,
                                                    {
                                                        pendulum_text:
                                                            event.target.value.trim()
                                                                ? event.target
                                                                      .value
                                                                : null,
                                                    },
                                                ),
                                            )
                                        }
                                    />
                                </label>
                            )}
                        </div>
                    );
                })}
            </section>

            <section>
                <h3>Classification</h3>
                <label className="library-inline">
                    Effect reviewed
                    <Switch
                        checked={working.classification.effect_reviewed}
                        onChange={(checked) =>
                            onChange({
                                ...working,
                                classification: {
                                    ...working.classification,
                                    effect_reviewed: checked,
                                },
                            })
                        }
                    />
                </label>
                <label>
                    Archetypes
                    <Select
                        mode="multiple"
                        value={working.classification.archetype_ids}
                        onChange={(value) =>
                            onChange({
                                ...working,
                                classification: {
                                    ...working.classification,
                                    archetype_ids: value,
                                },
                            })
                        }
                        style={{ width: '100%' }}
                    >
                        {(metadata?.archetypes ?? []).map((item) => (
                            <Option key={item.id} value={item.id}>
                                {item.code}
                            </Option>
                        ))}
                    </Select>
                </label>
                <label>
                    Effect Classifiers
                    <Select
                        mode="multiple"
                        value={working.classification.effect_classifier_ids}
                        onChange={(value) =>
                            onChange({
                                ...working,
                                classification: {
                                    ...working.classification,
                                    effect_classifier_ids: value,
                                },
                            })
                        }
                        style={{ width: '100%' }}
                    >
                        {(metadata?.effect_classifiers ?? []).map((item) => (
                            <Option key={item.id} value={item.id}>
                                {item.code}
                            </Option>
                        ))}
                    </Select>
                </label>
                <label>
                    Functional Tags
                    <Select
                        mode="multiple"
                        value={working.classification.functional_tag_ids}
                        onChange={(value) =>
                            onChange({
                                ...working,
                                classification: {
                                    ...working.classification,
                                    functional_tag_ids: value,
                                },
                            })
                        }
                        style={{ width: '100%' }}
                    >
                        {(metadata?.functional_tags ?? []).map((item) => (
                            <Option key={item.id} value={item.id}>
                                {item.code}
                            </Option>
                        ))}
                    </Select>
                </label>
            </section>

            <section>
                <h3>Relations</h3>
                <p className="library-muted">
                    Positive relations by internal card ID only.
                </p>
                {working.relations.length === 0 && (
                    <div className="library-muted">No relations.</div>
                )}
                {working.relations.map((relation, index) => (
                    <div
                        className="library-relation-row"
                        key={`${relation.target_card_id}-${index}`}
                    >
                        <Input
                            placeholder="Target card_id"
                            value={relation.target_card_id}
                            onChange={(event) => {
                                const relations = working.relations.slice();
                                relations[index] = {
                                    ...relation,
                                    target_card_id: event.target.value,
                                };
                                onChange({ ...working, relations });
                            }}
                        />
                        <Select
                            value={relation.relation_type_code || undefined}
                            placeholder="Relation type"
                            onChange={(value) => {
                                const relations = working.relations.slice();
                                relations[index] = {
                                    ...relation,
                                    relation_type_code: value,
                                };
                                onChange({ ...working, relations });
                            }}
                            style={{ minWidth: 180 }}
                        >
                            {(metadata?.relation_types ?? []).map((code) => (
                                <Option key={code} value={code}>
                                    {code}
                                </Option>
                            ))}
                        </Select>
                        <Input
                            placeholder="Note"
                            value={relation.note ?? ''}
                            onChange={(event) => {
                                const relations = working.relations.slice();
                                relations[index] = {
                                    ...relation,
                                    note: event.target.value.trim()
                                        ? event.target.value
                                        : null,
                                };
                                onChange({ ...working, relations });
                            }}
                        />
                        <Checkbox
                            checked={false}
                            onChange={() =>
                                onChange({
                                    ...working,
                                    relations: working.relations.filter(
                                        (_, itemIndex) => itemIndex !== index,
                                    ),
                                })
                            }
                        >
                            Remove
                        </Checkbox>
                    </div>
                ))}
                <button
                    type="button"
                    className="library-link-button"
                    onClick={() =>
                        onChange({
                            ...working,
                            relations: [
                                ...working.relations,
                                {
                                    target_card_id: '',
                                    relation_type_code:
                                        metadata?.relation_types[0] ?? '',
                                    note: null,
                                },
                            ],
                        })
                    }
                >
                    Add relation
                </button>
            </section>
        </div>
    );
};
