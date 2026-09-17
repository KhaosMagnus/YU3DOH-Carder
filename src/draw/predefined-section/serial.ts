export type DrawFooterSerialProps = {
    ctx?: CanvasRenderingContext2D | null,
    globalScale: number,
    value: string,
};

/**
 * Draw the YU3DOH serial treatment in the lower-left footer.
 *
 * The serial is treated as a structural part of the frame rather than a floating
 * label. Geometry is calibrated from the supplied reference and deliberately
 * overlaps the footer frame. The right edge expands for serials wider than the
 * normal 3-digit/3-digit form while preserving the slanted end cap.
 */
export const drawFooterSerial = ({
    ctx,
    globalScale,
    value,
}: DrawFooterSerialProps) => {
    if (!ctx) return { rightEdge: 0 };

    /**
     * Reference-matched plate. Compared with the first pass, the plate grows in
     * every direction so its top/bottom edges visually merge into the card frame.
     */
    const plateLeft = 27;
    const plateTop = 1109;
    const plateBottom = 1157;
    const minimumPlateTopRight = 198;
    const slantWidth = 18;

    const textLeft = 50;
    const textBaseline = 1148;
    const textRightPadding = 14;
    const fontSize = 31;

    ctx.save();
    ctx.scale(globalScale, globalScale);

    /**
     * Rodin is already bundled by YGO Carder for OCG creator text. Its numerals
     * have a substantially more uniform stroke than the high-contrast serif used
     * in the first serial pass, while retaining the requested text height.
     */
    ctx.font = `${fontSize}px "FOT-Rodin Pro M", MatrixBook, sans-serif`;
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

    /** Warm frame seam visible around the black insert in the supplied reference. */
    ctx.strokeStyle = '#d8cbb6';
    ctx.lineWidth = 1.2;
    ctx.lineJoin = 'miter';
    ctx.stroke();

    ctx.fillStyle = '#f0df48';
    ctx.fillText(value, textLeft, textBaseline);

    ctx.restore();

    return {
        rightEdge: plateBottomRight * globalScale,
    };
};
