import { LightningElement, api } from 'lwc';

// Stroke width matches the Figma donut at the default size; we scale it
// linearly with `size` so smaller donuts still look like rings, not pies.
const DEFAULT_SIZE = 156;
const DEFAULT_STROKE = 24;

/**
 * SVG donut chart with a categorical legend on the right.
 *
 * `segments`: [{ id, label, value, colorVar }]
 *   `colorVar` is a CSS variable name (e.g. '--slds-g-color-palette-blue-40').
 *
 * The stroke colour for each segment is applied via a per-segment custom
 * property `--cd-segment-color` set through a bound `style` expression (the
 * same pattern serviceRepsTable uses to set column widths). The CSS rule
 * `stroke: var(--cd-segment-color, ...)` consumes it.
 */
export default class ChartDonut extends LightningElement {
    @api segments = [];
    @api size = DEFAULT_SIZE;
    @api ariaLabel = '';
    @api legendTitle = '';
    // Visual gap between adjacent segments, in SVG user units (≈px at default
    // size). 0 keeps segments touching; positive values shave that many units
    // off each segment's stroke so a sliver of background shows through.
    @api segmentGap = 0;

    get hasLegendTitle() {
        return typeof this.legendTitle === 'string' && this.legendTitle.trim().length > 0;
    }

    get strokeWidth() {
        const s = Number(this.size) || DEFAULT_SIZE;
        return (DEFAULT_STROKE * s) / DEFAULT_SIZE;
    }

    get radius() {
        return (Number(this.size) - this.strokeWidth) / 2;
    }

    get center() {
        return Number(this.size) / 2;
    }

    get viewBox() {
        const s = Number(this.size) || DEFAULT_SIZE;
        return `0 0 ${s} ${s}`;
    }

    // Rotate -90deg around the centre so segments start at 12 o'clock.
    get rotateAttr() {
        const c = this.center;
        return `rotate(-90 ${c} ${c})`;
    }

    get circumference() {
        return 2 * Math.PI * this.radius;
    }

    get totalValue() {
        const segs = Array.isArray(this.segments) ? this.segments : [];
        return segs.reduce((acc, s) => acc + (Number(s.value) || 0), 0);
    }

    get segmentArcs() {
        const segs = Array.isArray(this.segments) ? this.segments : [];
        const total = this.totalValue || 1;
        const C = this.circumference;
        const rawGap = Math.max(0, Number(this.segmentGap) || 0);
        const gap = segs.length > 1 ? rawGap : 0;
        let cumulative = 0;
        return segs.map((s, idx) => {
            const value = Number(s.value) || 0;
            const fullArcLen = (value / total) * C;
            const visibleArcLen = Math.max(0.5, fullArcLen - gap);
            const dashGap = C - visibleArcLen;
            const offset = -cumulative;
            cumulative += fullArcLen;
            const delayS = (idx * 0.15).toFixed(2);
            return {
                id: s.id ?? `seg-${idx}`,
                dashArray: `${visibleArcLen} ${dashGap}`,
                dashOffset: `${offset}`,
                colorStyle: `--cd-segment-color: var(${s.colorVar}); animation-delay: ${delayS}s;`,
            };
        });
    }

    get legendItems() {
        const segs = Array.isArray(this.segments) ? this.segments : [];
        return segs.map((s, idx) => ({
            id: s.id ?? `leg-${idx}`,
            label: s.label,
            value: s.value,
            dotStyle: `background-color: var(${s.colorVar});`,
        }));
    }

    get svgStyle() {
        const s = Number(this.size) || DEFAULT_SIZE;
        return `width: ${s}px; height: ${s}px;`;
    }
}
