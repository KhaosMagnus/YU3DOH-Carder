import { useEffect, useRef, useState } from 'react';
import WebFont from 'webfontloader';
import { useCard } from './use-card';
import { useShallow } from 'zustand/react/shallow';
import { getCardFormatMode, PUBLIC_PATH } from 'src/model';
import { useSerial } from './use-serial';

export type UseOCGFont = {
    isLanguageInitiating: boolean,
    onBeforeLoad: () => void,
    onActive: () => void,
    onInactive: () => void,
    onFontInactive: (familyName: string, fvd: string) => void,
}
export const useOCGFont = ({
    isLanguageInitiating,
    onActive,
    onBeforeLoad,
    onFontInactive,
    onInactive,
}: UseOCGFont) => {
    const {
        font,
        format,
        region,
    } = useCard(useShallow(state => ({
        format: state.card.format,
        font: state.card.nameStyle.font,
        region: state.card.region,
    })));
    const serialEnabled = useSerial(state => state.serialEnabled);
    const [styleContent, setStyleContent] = useState('');

    const readyMap = useRef<Record<'ocg' | 'sc', boolean>>({ ocg: false, sc: false });
    const [serialFontReady, setSerialFontReady] = useState(false);
    const loadAttemptMap = useRef<Record<'ocg' | 'sc', number>>({ ocg: 0, sc: 0 });
    useEffect(() => {
        const cardMode = getCardFormatMode(format, region);
        const mode = font === 'SC' || cardMode === 'sc' ? 'sc' : 'ocg';
        /** Serial uses Simplified Chinese DFKai regardless of the card format. */
        const shouldLoad = format === 'ocg' || font === 'OCG' || font === 'SC' || serialEnabled;
        const shouldLoadSerialFont = serialEnabled && serialFontReady === false;
        if (
            shouldLoad
            && (readyMap.current[mode] === false || shouldLoadSerialFont)
            && loadAttemptMap.current[mode] <= 3
            && isLanguageInitiating === false
        ) {
            loadAttemptMap.current[mode] += 1;
            setStyleContent(`${PUBLIC_PATH}/asset/ocg-font.css`);
            onBeforeLoad();

            /** @todo Once these fonts are loaded, some letters previously appear ugly will inherit the font and looks much better, for example OCG-style ordinal number ① ② But right now it may not worth the trade off of including large fonts by default. */
            WebFont.load({
                custom: {
                    families: [
                        'DFHSGothic-W3-WIN-RKSJ-H',
                        'DFKakuTaiHiStd-W4',
                        'FOT-Rodin Pro M',
                        'Yu-Gi-Oh! DF Leisho 3',
                        ...(mode === 'sc' || serialEnabled ? ['Yu-Gi-Oh! DFKaiW5-A'] : []),
                    ],
                    urls: [`${PUBLIC_PATH}/asset/ocg-font.css`],
                },
                active: () => {
                    readyMap.current[mode] = true;
                    onActive();
                },
                inactive: () => {
                    readyMap.current[mode] = true;
                    onInactive();
                },
                fontactive: familyName => {
                    if (familyName === 'Yu-Gi-Oh! DFKaiW5-A') setSerialFontReady(true);
                },
                fontinactive: onFontInactive,
            });
        }
    }, [format, font, region, serialEnabled, serialFontReady, isLanguageInitiating, onActive, onBeforeLoad, onFontInactive, onInactive]);

    return {
        styleContent,
        isSerialFontPending: serialEnabled && serialFontReady === false,
    };
};
