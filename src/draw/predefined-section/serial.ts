export type DrawFooterSerialProps = {
    ctx?: CanvasRenderingContext2D | null,
    globalScale: number,
    value: string,
};

/**
 * Draw the YU3DOH serial treatment in the lower-left footer.
 *
 * Base geometry is calibrated from the provided 480x700 visual reference and
 * converted to YGO Carder's 813x1185 master canvas. The right edge expands for
 * serials wider than the normal 3-digit/3-digit form while preserving the
 * reference's slanted end cap.
 */
export const drawFooterSerial = ({
    ctx,
    globalScale,
    value,
}: DrawFooterSerialProps) => {
    if (!ctx) return { rightEdge: 0 };

    const plateLeft = 30.5;
    const plateTop = 1114;
    const plateBottom = 1153;
    const minimumPlateTopRight = 191.4;
    const slantWidth = 16.9;

    const textLeft = 52.5;
    const textBaseline = 1147;
    const textRightPadding = 13.5;
    const fontSize = 31;

    ctx.save();
    ctx.scale(globalScale, globalScale);

    ctx.font = `${fontSize}px YuGiOhITCStoneSerifBSc, stone-serif-regular, serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    const measuredTextWidth = ctx.measureText(value).width;
    const plateTopRight = Math.max(
        minimumPlateTopRight,
        textLeft + measuredTextWidth + textRightPadding,
    );
    const plateBottomRight = plateTopRight + slantWidth;

    ctx.beginPath();
    ctx.moveTo(plateLeft, plateTop);
    ctx.lineTo(plateTopRight, plateTop);
    ctx.lineTo(plateBottomRight, plateBottom);
    ctx.lineTo(plateLeft, plateBottom);
    ctx.closePath();

    ctx.fillStyle = '#000000';
    ctx.fill();

    /** Thin warm outline visible in the supplied reference around the black plate. */
    ctx.strokeStyle = '#d8cbb6';
    ctx.lineWidth = 1.6;
    ctx.lineJoin = 'miter';
    ctx.stroke();

    /** Reference serial uses a warm yellow-gold treatment rather than footer black/white. */
    ctx.fillStyle = '#f0df48';
    ctx.fillText(value, textLeft, textBaseline);

    ctx.restore();

    return {
        rightEdge: plateBottomRight * globalScale,
    };
};
