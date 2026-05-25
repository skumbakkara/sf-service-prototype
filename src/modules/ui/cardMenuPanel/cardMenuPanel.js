import { LightningElement, api, track } from 'lwc';

/**
 * Card settings panel with two sections:
 *   1. Timeframe — a pill button-group (5m / 15m / 1h / 8h / 24h)
 *   2. Filters   — grouped combobox: group selector + search,
 *                  scrollable value list with multi-select, active pills
 *
 * @api activeTimeframe  — initially active timeframe value (default '1h')
 * @api filterGroups     — [{ value, label, options: [{ id, label }] }]
 * @api selectedFilters  — pre-selected items [{ id, label }]
 *
 * Fires:
 *   `close`  — user cancelled or clicked backdrop
 *   `apply`  — detail: { timeframe, filters: [{ id, label }] }
 */
export default class CardMenuPanel extends LightningElement {
    @api activeTimeframe = '1h';
    @api filterGroups = [];
    @api selectedFilters = [];
    @api panelStyle = '';
    @api showTimeframe = false;

    @track _activeTimeframe = '1h';
    @track _selectedGroup = '';
    @track _pendingFilters = [];
    @track _searchText = '';
    @track _groupOpen = false;

    connectedCallback() {
        this._activeTimeframe = this.activeTimeframe || '1h';
        this._pendingFilters = Array.isArray(this.selectedFilters)
            ? [...this.selectedFilters]
            : [];
        // No group pre-selected — user must pick one from the dropdown
        this._selectedGroup = '';
    }

    // ── Timeframe ──────────────────────────────────────────────────────────

    get timeframeOptions() {
        return ['5m', '15m', '1h', '8h', '24h'].map(val => ({
            value: val,
            label: val,
            variant: val === this._activeTimeframe ? 'brand' : 'neutral',
        }));
    }

    handleTimeframeClick(evt) {
        this._activeTimeframe = evt.currentTarget.dataset.value;
    }

    // ── Filter group picker ────────────────────────────────────────────────

    get selectedGroup() {
        return this._selectedGroup;
    }

    get selectedGroupLabel() {
        if (!this._selectedGroup) return 'Select';
        const groups = Array.isArray(this.filterGroups) ? this.filterGroups : [];
        const found = groups.find(g => g.value === this._selectedGroup);
        return found ? found.label : 'Select';
    }

    get hasSelectedGroup() {
        return !!this._selectedGroup;
    }

    get groupOpen() {
        return this._groupOpen;
    }

    get computedFilterGroups() {
        return (Array.isArray(this.filterGroups) ? this.filterGroups : []).map(g => ({
            value: g.value,
            label: g.label,
            checked: g.value === this._selectedGroup,
            optionClass: 'cmp-group-option'
                + (g.value === this._selectedGroup ? ' cmp-group-option--active' : ''),
        }));
    }

    toggleGroupPicker() {
        this._groupOpen = !this._groupOpen;
    }

    handleGroupSelect(evt) {
        this._selectedGroup = evt.currentTarget.dataset.value;
        this._groupOpen = false;
        this._searchText = '';
    }

    // ── Filter values ──────────────────────────────────────────────────────

    get searchText() {
        return this._searchText;
    }

    get _currentGroupOptions() {
        const groups = Array.isArray(this.filterGroups) ? this.filterGroups : [];
        const group = groups.find(g => g.value === this.selectedGroup);
        return group ? (group.options || []) : [];
    }

    get filteredValues() {
        const q = (this._searchText || '').toLowerCase();
        return this._currentGroupOptions
            .filter(opt => !q || opt.label.toLowerCase().includes(q))
            .map(opt => {
                const selected = this._pendingFilters.some(f => f.id === opt.id);
                return {
                    id: opt.id,
                    label: opt.label,
                    selected,
                    itemClass: 'cmp-filter-item'
                        + (selected ? ' cmp-filter-item--selected' : ''),
                };
            });
    }

    handleSearch(evt) {
        this._searchText = evt.target.value;
    }

    handleValueToggle(evt) {
        const id = evt.currentTarget.dataset.id;
        const opt = this._currentGroupOptions.find(o => o.id === id);
        if (!opt) return;
        const already = this._pendingFilters.findIndex(f => f.id === id);
        if (already >= 0) {
            this._pendingFilters = this._pendingFilters.filter(f => f.id !== id);
        } else {
            const groups = Array.isArray(this.filterGroups) ? this.filterGroups : [];
            const grp = groups.find(g => g.value === this._selectedGroup);
            this._pendingFilters = [
                ...this._pendingFilters,
                { id: opt.id, label: opt.label, group: this._selectedGroup, groupLabel: grp ? grp.label : this._selectedGroup },
            ];
        }
    }

    // ── Pills ──────────────────────────────────────────────────────────────

    // One pill per filter group — label: "GroupName: Val1, Val2, +N"
    _allPills() {
        const map = new Map();
        for (const f of this._pendingFilters) {
            const key = f.group || f.id;
            if (!map.has(key)) {
                map.set(key, { id: key, groupLabel: f.groupLabel || key, items: [] });
            }
            map.get(key).items.push(f.label);
        }
        return Array.from(map.values()).map(g => {
            const shown = g.items.slice(0, 2);
            const hidden = g.items.length - shown.length;
            const values = shown.join(', ') + (hidden > 0 ? `, +${hidden}` : '');
            return { id: g.id, label: `${g.groupLabel}: ${values}` };
        });
    }

    get activePills() {
        return this._allPills().slice(0, 2);
    }

    get hasActivePills() {
        return this._pendingFilters.length > 0;
    }

    get hiddenPillCount() {
        return Math.max(0, this._allPills().length - 2);
    }

    get hasHiddenPills() {
        return this.hiddenPillCount > 0;
    }

    get hiddenPillLabel() {
        return `+${this.hiddenPillCount} more`;
    }

    handlePillRemove(evt) {
        const groupId = evt.currentTarget.dataset.id;
        this._pendingFilters = this._pendingFilters.filter(f => (f.group || f.id) !== groupId);
    }

    handleClearAll() {
        this._pendingFilters = [];
    }

    // ── Footer ─────────────────────────────────────────────────────────────

    handleCancel() {
        this.dispatchEvent(new CustomEvent('close'));
    }

    handleBackdropClick() {
        this.dispatchEvent(new CustomEvent('close'));
    }

    handleApply() {
        this.dispatchEvent(new CustomEvent('apply', {
            detail: {
                timeframe: this._activeTimeframe,
                filters: [...this._pendingFilters],
            },
        }));
        this.dispatchEvent(new CustomEvent('close'));
    }
}
