import { LightningElement, api, track } from 'lwc';

export default class KpiCard extends LightningElement {
    @api title = '';
    @api caption = '';
    @api filterChips = [];
    @api filterGroups = [];
    @api activeTimeframe = '1h';
    @api selectedFilters = [];
    @api showTimeframe = false;
    @api metricOnly = false;

    get cardClass() {
        return `kc-card${this.metricOnly ? ' kc-card_metric-only' : ''}`;
    }

    @track menuOpen = false;
    @track _panelTop = 0;
    @track _panelLeft = 0;
    @track _activeTimeframe = '1h';
    @track _selectedFilters = [];
    @track _hoveredBadgeId = null;
    @track _popoverTop = 0;
    @track _popoverLeft = 0;

    connectedCallback() {
        this._activeTimeframe = this.activeTimeframe || '1h';
        this._selectedFilters = Array.isArray(this.selectedFilters)
            ? [...this.selectedFilters]
            : [];
    }

    get hasChips() {
        return Array.isArray(this.filterChips) && this.filterChips.length > 0;
    }

    // Expose tracked filters so the menu panel reopens with current selections
    get currentSelectedFilters() {
        return this._selectedFilters;
    }

    // Group applied filters into one badge per group
    _groupedBadges() {
        const filters = Array.isArray(this._selectedFilters) ? this._selectedFilters : [];
        const map = new Map();
        for (const f of filters) {
            const key = f.group || f.id;
            if (!map.has(key)) {
                map.set(key, { groupLabel: f.groupLabel || key, items: [] });
            }
            map.get(key).items.push(f.label);
        }
        return Array.from(map.entries()).map(([key, g]) => {
            const shown = g.items.slice(0, 2);
            const hidden = g.items.length - shown.length;
            return {
                id: key,
                groupLabel: g.groupLabel,
                values: shown.join(', ') + (hidden > 0 ? `, +${hidden}` : ''),
                allItems: g.items.map((label, i) => ({ id: `${key}-i${i}`, label })),
            };
        });
    }

    get hasAppliedFilters() {
        return this._groupedBadges().length > 0;
    }

    get captionText() {
        return this.hasAppliedFilters ? `${this.caption},` : this.caption;
    }

    // Max 2 badges shown inline; rest collapsed into "+N more"
    get appliedFilterBadges() {
        return this._groupedBadges().slice(0, 2);
    }

    get appliedFilterOverflowCount() {
        return Math.max(0, this._groupedBadges().length - 2);
    }

    get hasAppliedFilterOverflow() {
        return this.appliedFilterOverflowCount > 0;
    }

    get appliedFilterOverflowLabel() {
        return `+${this.appliedFilterOverflowCount} more`;
    }

    handleBadgeRemove(evt) {
        evt.stopPropagation();
        const groupId = evt.currentTarget.dataset.group;
        this._selectedFilters = this._selectedFilters.filter(
            f => (f.group || f.id) !== groupId
        );
        this._hoveredBadgeId = null;
    }

    handleBadgeMouseEnter(evt) {
        const badgeId = evt.currentTarget.dataset.badgeId;
        const rect = evt.currentTarget.getBoundingClientRect();
        this._popoverTop = rect.bottom + 6;
        this._popoverLeft = rect.left;
        this._hoveredBadgeId = badgeId;
    }

    handleBadgeMouseLeave() {
        this._hoveredBadgeId = null;
    }

    get popoverStyle() {
        return `top: ${this._popoverTop}px; left: ${this._popoverLeft}px;`;
    }

    get hoveredBadge() {
        if (!this._hoveredBadgeId) return null;
        return this._groupedBadges().find(b => b.id === this._hoveredBadgeId) || null;
    }

    get showPopover() {
        return !!this.hoveredBadge;
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
