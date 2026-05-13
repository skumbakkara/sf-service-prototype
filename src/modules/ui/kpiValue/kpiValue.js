import { LightningElement, api } from 'lwc';

/**
 * Big-number value display with optional delta pill and footer line.
 *
 * `delta` colour is driven by the leading sign character:
 *   '+' → green (up), '-' or '−' → red (down), otherwise neutral.
 *
 * The footer can be supplied either as the `footer` plain-text @api prop or
 * as slotted markup (slot name="footer"). Slotted content takes precedence
 * via standard slot fallback behaviour.
 */
export default class KpiValue extends LightningElement {
    @api value = '';
    @api delta = '';
    @api footer = '';

    get hasDelta() {
        return typeof this.delta === 'string' && this.delta.trim().length > 0;
    }

    get deltaClass() {
        const raw = (this.delta ?? '').trim();
        if (raw.startsWith('+')) return 'kv-delta kv-delta-up';
        if (raw.startsWith('-') || raw.startsWith('\u2212')) return 'kv-delta kv-delta-down';
        return 'kv-delta kv-delta-neutral';
    }
}
