import { create } from 'zustand';

export type SerialState = {
    serialEnabled: boolean,
    serialNumber: number,
    serialTotal: number,
};

export const DEFAULT_SERIAL_STATE: SerialState = {
    serialEnabled: false,
    serialNumber: 1,
    serialTotal: 16,
};

const normalizePositiveInteger = (value: number, fallback: number) => {
    if (!Number.isFinite(value)) return fallback;
    return Math.max(1, Math.trunc(value));
};

export const formatSerial = (serialNumber: number, serialTotal: number) => {
    const normalizedTotal = normalizePositiveInteger(serialTotal, DEFAULT_SERIAL_STATE.serialTotal);
    const normalizedNumber = Math.min(
        normalizePositiveInteger(serialNumber, DEFAULT_SERIAL_STATE.serialNumber),
        normalizedTotal,
    );
    const pad = (value: number) => `${value}`.padStart(3, '0');

    return `${pad(normalizedNumber)}/${pad(normalizedTotal)}`;
};

export type SerialStore = SerialState & {
    setSerialEnabled: (serialEnabled: boolean) => void,
    setSerialNumber: (serialNumber: number) => void,
    setSerialTotal: (serialTotal: number) => void,
    resetSerial: () => void,
};

export const useSerial = create<SerialStore>((set) => ({
    ...DEFAULT_SERIAL_STATE,
    setSerialEnabled: serialEnabled => set({ serialEnabled }),
    setSerialNumber: serialNumber => set(current => ({
        serialNumber: Math.min(
            normalizePositiveInteger(serialNumber, current.serialNumber),
            current.serialTotal,
        ),
    })),
    setSerialTotal: serialTotal => set(current => {
        const normalizedTotal = normalizePositiveInteger(serialTotal, current.serialTotal);
        return {
            serialTotal: normalizedTotal,
            serialNumber: Math.min(current.serialNumber, normalizedTotal),
        };
    }),
    resetSerial: () => set(DEFAULT_SERIAL_STATE),
}));
