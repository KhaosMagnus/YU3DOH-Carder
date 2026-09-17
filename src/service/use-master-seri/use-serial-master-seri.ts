import { useEffect } from 'react';
import { useSerial } from '../use-serial';
import { useMasterSeriDrawer } from './use-master-seri';

/**
 * YU3DOH wrapper around the upstream drawer.
 *
 * Serial data intentionally lives outside Card. When the transient serial state
 * changes, bump the existing `otherText` pipeline revision so the password/footer
 * layer is redrawn and the normal export pipeline picks up the new output.
 */
export const useSerialMasterSeriDrawer = (...args: Parameters<typeof useMasterSeriDrawer>) => {
    const drawer = useMasterSeriDrawer(...args);
    const {
        serialEnabled,
        serialNumber,
        serialTotal,
    } = useSerial();

    useEffect(() => {
        drawer.drawingPipeline.current.otherText.rerun += 1;
    }, [
        drawer.drawingPipeline,
        serialEnabled,
        serialNumber,
        serialTotal,
    ]);

    return drawer;
};
