import { LightningElement, api } from 'lwc';

/**
 * Horizontal bar chart for categorical data.
 *
 * `rows`: [{ id, label, value, colorVar }]
 *   Each row renders one horizontal bar. Bar width is proportional to the
 *   row's value relative to the max across all rows (or `maxValue` if given).
 *   `colorVar` is a CSS variable name for the bar fill color.
 *
 * `tickLabels`   — left→right numeric tick labels beneath the chart
 * `rowAxisLabel` — column header above row labels (e.g. "Status ↓")
 * `colAxisLabel` — label beneath the bar axis (e.g. "No of reps ↓")
 * `maxValue`     — optional explicit maximum for the bar scale
 * `barColorVar`  — fallback CSS var when a row has no colorVar
 */
export default class ChartBar extends LightningElement {
    @api rows = [];
    @api tickLabels = [];
    @api rowAxisLabel = '';
    @api colAxisLabel = '';
    @api maxValue = 0;
    @api barColorVar = '--ccs-g-color-chart-category-light-color-1';
    @api ariaLabel = '';

    get _max() {
        const rows = Array.isArray(this.rows) ? this.rows : [];
        const explicit = Number(this.maxValue) || 0;
        if (explicit > 0) return explicit;
        return Math.max(...rows.map(r => Number(r.value) || 0), 1);
    }

    get computedRows() {
        const rows = Array.isArray(this.rows) ? this.rows : [];
        const max = this._max;
        return rows.map((r, idx) => {
            const pct = ((Number(r.value) || 0) / max) * 100;
            const colorVar = r.colorVar || this.barColorVar;
            return {
                id: r.id ?? `row-${idx}`,
                label: r.label,
                barStyle: `width: ${pct.toFixed(2)}%; background-color: var(${colorVar}); animation-delay: ${(idx * 0.12).toFixed(2)}s;`,
            };
        });
    }

    get gridStyle() {
        const count = Array.isArray(this.rows) ? this.rows.length : 0;
        return `--cb-row-count: ${count};`;
    }

    get computedTicks() {
        const ticks = Array.isArray(this.tickLabels) ? this.tickLabels : [];
        return ticks.map((t, i) => ({ id: `xt-${i}`, label: t }));
    }

    get hasColAxisLabel() {
        return typeof this.colAxisLabel === 'string' && this.colAxisLabel.length > 0;
    }
}
