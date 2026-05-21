import { LightningElement, api } from 'lwc';

const VB = 100;

/**
 * Multi-series SVG line chart with a categorical legend.
 *
 * `series`: [{ id, label, colorVar, points: [{ x, y }] }]
 *   Each entry renders one polyline. `colorVar` is a CSS variable name.
 *
 * `yLabels`     — top→bottom axis labels
 * `xLabels`     — left→right axis labels
 * `yAxisTitle`  — rotated label beside the Y axis (reads bottom→top)
 * `xAxisTitle`  — label below the X axis
 * `chartHeight` — accepted for backward compatibility; layout uses flex now
 *                 so the SVG absorbs whatever vertical space remains inside
 *                 the card body, ensuring axis labels/titles stay in-bounds.
 */
export default class ChartMultiLine extends LightningElement {
    @api series = [];
    @api yLabels = [];
    @api xLabels = [];
    @api yAxisTitle = '';
    @api xAxisTitle = '';
    @api chartHeight;
    @api ariaLabel = '';

    get yAxisLabels() {
        return (this.yLabels || []).map((text, i) => ({ id: `y-${i}`, text }));
    }

    get xAxisLabels() {
        return (this.xLabels || []).map((text, i) => ({ id: `x-${i}`, text }));
    }

    _domain() {
        const all = Array.isArray(this.series) ? this.series : [];
        let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
        for (const s of all) {
            for (const p of (s.points || [])) {
                const x = Number(p.x), y = Number(p.y);
                if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
                if (x < xMin) xMin = x;
                if (x > xMax) xMax = x;
                if (y < yMin) yMin = y;
                if (y > yMax) yMax = y;
            }
        }
        if (!Number.isFinite(xMin)) return null;
        if (xMax === xMin) xMax = xMin + 1;
        if (yMax === yMin) yMax = yMin + 1;
        return { xMin, xMax, yMin, yMax };
    }

    _project(x, y, dom) {
        const px = ((x - dom.xMin) / (dom.xMax - dom.xMin)) * VB;
        const py = VB - ((y - dom.yMin) / (dom.yMax - dom.yMin)) * VB;
        return { px, py };
    }

    get seriesPaths() {
        const dom = this._domain();
        if (!dom) return [];
        return (this.series || []).map((s, si) => {
            const pts = (s.points || [])
                .map(p => ({ x: Number(p.x), y: Number(p.y) }))
                .filter(p => Number.isFinite(p.x) && Number.isFinite(p.y));
            const path = pts.map((p, i) => {
                const { px, py } = this._project(p.x, p.y, dom);
                return `${i === 0 ? 'M' : 'L'}${px.toFixed(3)},${py.toFixed(3)}`;
            }).join(' ');
            return {
                id: s.id ?? `series-${si}`,
                path,
                colorStyle: `--cml-line-color: var(${s.colorVar});`,
            };
        });
    }

    get legendItems() {
        return (this.series || []).map((s, i) => ({
            id: s.id ?? `leg-${i}`,
            label: s.label,
            dotStyle: `background-color: var(${s.colorVar});`,
        }));
    }
}
