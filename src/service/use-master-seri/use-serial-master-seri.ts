import { useEffect } from 'react';
import { useSerial } from '../use-serial';
import { useMasterSeriDrawer } from './use-master-seri';

/**
 * YU3DOH wrapper around the upstream drawer.
 *
 * Serial data intentionally lives outside Card. Serial number/total changes only
 * require the `otherText` layer. Enabling/disabling Serial also reruns `creator`
 * because Limited Edition lives on that separate footer layer.
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

    useEffect(() => {
        drawer.drawingPipeline.current.creator.rerun += 1;
    }, [
        drawer.drawingPipeline,
        serialEnabled,
    ]);

    return drawer;
};
