import type { Foil } from 'src/model';

export type FooterSerialLayoutProfile = {
    offsetX: number,
    offsetY: number,
};

export const DEFAULT_FOOTER_SERIAL_LAYOUT_PROFILE: FooterSerialLayoutProfile = {
    offsetX: 2,
    offsetY: 0,
};

const FooterSerialLayoutProfileOverrideMap: Partial<Record<Foil, FooterSerialLayoutProfile>> = {
    'grand-master-rare': {
        offsetX: 3,
        offsetY: -3,
    },
};

export const resolveFooterSerialLayoutProfile = (foil: Foil): FooterSerialLayoutProfile =>
    FooterSerialLayoutProfileOverrideMap[foil] ?? DEFAULT_FOOTER_SERIAL_LAYOUT_PROFILE;

export type DrawFooterSerialProps = {
    ctx?: CanvasRenderingContext2D | null,
    globalScale: number,
    value: string,
    layoutProfile?: FooterSerialLayoutProfile,
};

/**
 * Base geometry for the serial plate.
 */
export const FooterSerialGeometry = {
    plateLeft: 27,
    plateTop: 1109,
    plateBottom: 1157,
    minimumPlateTopRight: 198,
    slantWidth: 18,
} as const;


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
    layoutProfile = DEFAULT_FOOTER_SERIAL_LAYOUT_PROFILE,
}: DrawFooterSerialProps) => {
    if (!ctx) return { rightEdge: 0 };

    /**
     * Reference-matched plate. Compared with the first pass, the plate grows in
     * every direction so its top/bottom edges visually merge into the card frame.
     */
    const {
        plateLeft,
        plateTop,
        plateBottom,
        minimumPlateTopRight,
        slantWidth,
    } = FooterSerialGeometry;

    const textLeft = 50;
    const textBaseline = 1146;
    const textRightPadding = 14;
    const fontSize = 31;
    const {
        offsetX: finalOffsetX,
        offsetY: finalOffsetY,
    } = layoutProfile;
    const internalOffsetX = finalOffsetX / globalScale;
    const internalOffsetY = finalOffsetY / globalScale;

    ctx.save();
    ctx.scale(globalScale, globalScale);
    ctx.translate(internalOffsetX, internalOffsetY);

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

    /**
     * The supplied reference has no dedicated serial outline. The light edge
     * touching the insert belongs to the surrounding card frame itself.
     */
    ctx.fillStyle = '#f0df48';
    ctx.fillText(value, textLeft, textBaseline);

    ctx.restore();

    return {
        rightEdge: plateBottomRight * globalScale + finalOffsetX,
    };
};
