import { LightningElement, api, track } from 'lwc';

/**
 * Big-number value display with optional delta pill and footer line.
 *
 * `delta` colour is driven by the leading sign character:
 *   '+' → green (up), '-' or '−' → red (down), otherwise neutral.
 *
 * `pulse(dir)` — call from a parent card to trigger a brief color flash.
 * `dir` is 'up' (green) or 'down' (red). Resets automatically after 800ms.
 */
export default class KpiValue extends LightningElement {
    @api value = '';
    @api delta = '';
    @api footer = '';

    @track _pulseDir = null;
    _pulseTimer = null;

    @api
    pulse(dir) {
        if (this._pulseTimer) clearTimeout(this._pulseTimer);
        this._pulseDir = dir === 'down' ? 'down' : 'up';
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this._pulseTimer = setTimeout(() => { this._pulseDir = null; }, 800);
    }

    disconnectedCallback() {
        if (this._pulseTimer) clearTimeout(this._pulseTimer);
    }

    get hasDelta() {
        return typeof this.delta === 'string' && this.delta.trim().length > 0;
    }

    get deltaClass() {
        const raw = (this.delta ?? '').trim();
        if (raw.startsWith('+')) return 'kv-delta kv-delta-up';
        if (raw.startsWith('-') || raw.startsWith('−')) return 'kv-delta kv-delta-down';
        return 'kv-delta kv-delta-neutral';
    }

    get valueClass() {
        if (this._pulseDir === 'up') return 'kv-value kv-value--pulse-up';
        if (this._pulseDir === 'down') return 'kv-value kv-value--pulse-down';
        return 'kv-value';
    }
}
