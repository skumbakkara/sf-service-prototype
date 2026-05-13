import { LightningElement, api } from 'lwc';

const DEFAULT_HEIGHT = 144;
const VB = 100;

/**
 * SVG line chart with optional shaded range band, configurable Y/X axis
 * labels, and a U-shape axis baseline. Mirrors the architecture of
 * `ui-chart-donut`: pure SVG, every input is `@api`, all colors flow
 * through CSS custom properties so the consumer can theme any instance.
 *
 * `series`     [{ x, y }]                       — required, assumed sorted by x
 * `band`       [{ x, upper, lower }]            — optional shaded envelope
 * `yLabels`    [string, …]                       — top→bottom display order
 * `xLabels`    [string, …]                       — left→right display order
 * `lineColorVar`  CSS var name for line stroke   (default --slds-g-color-accent-2)
 * `bandColorVar`  CSS var name for band fill     (default --slds-g-color-accent-2)
 * `chartHeight`   px, used to size the SVG       (default 144 per Figma 19734:27995)
 *
 * Coordinates are normalized into a 0–100 viewBox with
 * `preserveAspectRatio="none"`; every drawn stroke uses
 * `vector-effect="non-scaling-stroke"` so the visual stroke width stays
 * pixel-perfect regardless of the chart's actual rendered width.
 */
export default class ChartLine extends LightningElement {
    @api series = [];
    @api band = [];
    @api yLabels = [];
    @api xLabels = [];
    @api lineColorVar = '--slds-g-color-accent-2';
    @api bandColorVar = '--slds-g-color-accent-2';
    @api chartHeight = DEFAULT_HEIGHT;
    @api ariaLabel = '';

    get chartAreaStyle() {
        const h = Number(this.chartHeight) || DEFAULT_HEIGHT;
        return `height: ${h}px;`;
    }

    get hasYLabels() {
        return Array.isArray(this.yLabels) && this.yLabels.length > 0;
    }

    get hasXLabels() {
        return Array.isArray(this.xLabels) && this.xLabels.length > 0;
    }

    get yAxisLabels() {
        return (this.yLabels || []).map((text, i) => ({ id: `y-${i}`, text }));
    }

    get xAxisLabels() {
        return (this.xLabels || []).map((text, i) => ({ id: `x-${i}`, text }));
    }

    get lineColorStyle() {
        return `--cl-line-color: var(${this.lineColorVar});`;
    }

    get bandColorStyle() {
        return `--cl-band-color: var(${this.bandColorVar});`;
    }

    /** Combined x/y domain across `series` + `band`, so the line and the
        band share a single coordinate space. Returns null when there is
        nothing to draw, which all path getters short-circuit on. */
    _domain() {
        const pts = Array.isArray(this.series) ? this.series : [];
        const bandPts = Array.isArray(this.band) ? this.band : [];
        if (pts.length === 0 && bandPts.length === 0) return null;
        let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
        for (const p of pts) {
            const x = Number(p.x), y = Number(p.y);
            if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
            if (x < xMin) xMin = x;
            if (x > xMax) xMax = x;
            if (y < yMin) yMin = y;
            if (y > yMax) yMax = y;
        }
        for (const p of bandPts) {
            const x = Number(p.x), u = Number(p.upper), l = Number(p.lower);
            if (!Number.isFinite(x)) continue;
            if (x < xMin) xMin = x;
            if (x > xMax) xMax = x;
            if (Number.isFinite(u)) {
                if (u < yMin) yMin = u;
                if (u > yMax) yMax = u;
            }
            if (Number.isFinite(l)) {
                if (l < yMin) yMin = l;
                if (l > yMax) yMax = l;
            }
        }
        if (!Number.isFinite(xMin) || !Number.isFinite(yMin)) return null;
        if (xMax === xMin) xMax = xMin + 1;
        if (yMax === yMin) yMax = yMin + 1;
        return { xMin, xMax, yMin, yMax };
    }

    _project(x, y, dom) {
        const px = ((x - dom.xMin) / (dom.xMax - dom.xMin)) * VB;
        const py = VB - ((y - dom.yMin) / (dom.yMax - dom.yMin)) * VB;
        return { px, py };
    }

    get hasLine() {
        return Array.isArray(this.series) && this.series.length > 1;
    }

    get linePath() {
        const dom = this._domain();
        if (!dom) return '';
        const pts = (this.series || [])
            .map(p => ({ x: Number(p.x), y: Number(p.y) }))
            .filter(p => Number.isFinite(p.x) && Number.isFinite(p.y));
        if (pts.length < 2) return '';
        const cmds = pts.map((p, i) => {
            const { px, py } = this._project(p.x, p.y, dom);
            return `${i === 0 ? 'M' : 'L'}${px.toFixed(3)},${py.toFixed(3)}`;
        });
        return cmds.join(' ');
    }

    get hasBand() {
        const b = Array.isArray(this.band) ? this.band : [];
        return b.length > 1;
    }

    get bandPath() {
        const dom = this._domain();
        if (!dom) return '';
        const b = (this.band || [])
            .map(p => ({ x: Number(p.x), upper: Number(p.upper), lower: Number(p.lower) }))
            .filter(p => Number.isFinite(p.x) && Number.isFinite(p.upper) && Number.isFinite(p.lower));
        if (b.length < 2) return '';
        const upper = b.map((p, i) => {
            const { px, py } = this._project(p.x, p.upper, dom);
            return `${i === 0 ? 'M' : 'L'}${px.toFixed(3)},${py.toFixed(3)}`;
        });
        const lower = [...b].reverse().map(p => {
            const { px, py } = this._project(p.x, p.lower, dom);
            return `L${px.toFixed(3)},${py.toFixed(3)}`;
        });
        return `${upper.join(' ')} ${lower.join(' ')} Z`;
    }

    /** A small filled circle drawn at the last `series` point, mirroring the
        Figma trend dot. We render this as an absolutely-positioned HTML span
        (rather than an SVG <circle>) so `preserveAspectRatio="none"` on the
        chart SVG can't squash it into an ellipse. */
    get hasEndpoint() {
        return this.hasLine;
    }

    get dotStyle() {
        const dom = this._domain();
        if (!dom) return 'display: none;';
        const last = (this.series || []).slice(-1)[0];
        if (!last) return 'display: none;';
        const { px, py } = this._project(Number(last.x), Number(last.y), dom);
        return `left: ${px.toFixed(3)}%; top: ${py.toFixed(3)}%; --cl-line-color: var(${this.lineColorVar});`;
    }
}
