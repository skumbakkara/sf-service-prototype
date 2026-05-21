import { LightningElement, api, track } from 'lwc';

export default class KpiCard extends LightningElement {
    @api title = '';
    @api caption = '';
    @api filterChips = [];
    @api filterGroups = [];
    @api activeTimeframe = '1h';
    @api selectedFilters = [];
    @api showTimeframe = false;

    @track menuOpen = false;
    @track _panelTop = 0;
    @track _panelLeft = 0;
    @track _activeTimeframe = '1h';
    @track _selectedFilters = [];

    connectedCallback() {
        this._activeTimeframe = this.activeTimeframe || '1h';
        this._selectedFilters = Array.isArray(this.selectedFilters)
            ? [...this.selectedFilters]
            : [];
    }

    get hasChips() {
        return Array.isArray(this.filterChips) && this.filterChips.length > 0;
    }

    get hasMenu() {
        return Array.isArray(this.filterGroups) && this.filterGroups.length > 0;
    }

    // Panel width matches cardMenuPanel.css (.cmp-panel width: 297px)
    static PANEL_WIDTH = 297;

    get panelStyle() {
        return `top: ${this._panelTop}px; left: ${this._panelLeft}px;`;
    }

    toggleMenu(evt) {
        if (this.menuOpen) {
            this.menuOpen = false;
            return;
        }
        const btn = evt.currentTarget;
        const rect = btn.getBoundingClientRect();
        // Panel drops below the button, left edge at the button's right edge
        this._panelTop = rect.bottom + 4;
        this._panelLeft = rect.right - 12;
        this.menuOpen = true;
    }

    closeMenu() {
        this.menuOpen = false;
    }

    handleApply(evt) {
        const { timeframe, filters } = evt.detail;
        this._activeTimeframe = timeframe;
        this._selectedFilters = filters;
        this.menuOpen = false;
        this.dispatchEvent(new CustomEvent('menuapply', { detail: evt.detail, bubbles: true }));
    }
}
