import { LightningElement, api } from 'lwc';

/**
 * Shared SLDS card chrome used by every wallboard KPI card.
 *
 * Slots in:
 *   - title (h3)
 *   - caption (time / filter line beneath the title)
 *   - optional row of filter chips with X buttons (Phase 1: visual only)
 *   - overflow `lightning-button-menu` driven by `menuItems`
 *   - default <slot> for the card body (value display or chart)
 */
export default class KpiCard extends LightningElement {
    @api title = '';
    @api caption = '';
    @api filterChips = [];
    @api menuItems = [];

    get hasChips() {
        return Array.isArray(this.filterChips) && this.filterChips.length > 0;
    }

    get hasMenu() {
        return Array.isArray(this.menuItems) && this.menuItems.length > 0;
    }
}
