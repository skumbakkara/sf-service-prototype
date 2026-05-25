import { LightningElement, api, track } from 'lwc';

const SENTIMENT_BUCKETS = [
    { value: 'positive', label: 'Positive', values: ['excellent', 'good']    },
    { value: 'neutral',  label: 'Neutral',  values: ['neutral']              },
    { value: 'negative', label: 'Negative', values: ['bad', 'terrible']      },
];

const CHANNEL_LABELS = {
    cases:     'Case',
    chat:      'Chat',
    call:      'Call',
    email:     'Email',
    messaging: 'Messaging',
};

const SEARCHABLE_THRESHOLD = 6;

const FACET_IDS = ['serviceRep', 'channels', 'queues', 'skills', 'sentiment', 'teams'];

// Height of each facet card (px) — header: 50px, body padding: 12px top,
// card = 12px padding top + 20px label + 20px summary + 12px padding bottom = 64px, gap = 8px
const CARD_HEIGHT = 64;
const CARD_GAP    = 8;
// Offset from fp-body top to first card (fp-header 50px + border 1px)
const BODY_TOP_OFFSET = 51;
// Popover nubbin vertical centre from popover top
const NUBBIN_OFFSET = 24;

function emptyFilters() {
    return FACET_IDS.reduce((acc, id) => { acc[id] = []; return acc; }, {});
}

export default class InProgressFilterPanel extends LightningElement {
    @api
    get items() { return this._items; }
    set items(value) {
        this._items = Array.isArray(value) ? value : [];
    }

    @api
    get appliedFilters() { return this._applied; }
    set appliedFilters(value) {
        this._applied = normalizeFilters(value);
    }

    @track _items = [];
    @track _applied = emptyFilters();
    @track _activeFacet = null;   // facet id whose popover is open
    @track _searchTerms = {};

    // ── Distinct option builders ───────────────────────────────────────────
    get _allServiceReps() {
        const set = new Set();
        for (const r of this._items) if (r.assignedTo) set.add(r.assignedTo);
        return Array.from(set).sort((a, b) => a.localeCompare(b)).map(v => ({ value: v, label: v }));
    }
    get _allChannels() {
        const set = new Set();
        for (const r of this._items) if (r.channel) set.add(r.channel);
        return Array.from(set).sort().map(v => ({ value: v, label: CHANNEL_LABELS[v] ?? v }));
    }
    get _allQueues() {
        const set = new Set();
        for (const r of this._items) if (r.queue) set.add(r.queue);
        return Array.from(set).sort((a, b) => a.localeCompare(b)).map(v => ({ value: v, label: v }));
    }
    get _allSkills() {
        const set = new Set();
        for (const r of this._items) {
            if (Array.isArray(r.skills)) for (const s of r.skills) if (s) set.add(s);
        }
        return Array.from(set).sort((a, b) => a.localeCompare(b)).map(v => ({ value: v, label: v }));
    }
    get _allTeams() {
        const set = new Set();
        for (const r of this._items) if (r.team) set.add(r.team);
        return Array.from(set).sort((a, b) => a.localeCompare(b)).map(v => ({ value: v, label: v }));
    }

    // ── Facet card list (collapsed, no inline body) ───────────────────────
    get facetList() {
        return [
            this._buildFacetCard('serviceRep', 'Service Rep',  'All Service Reps', this._allServiceReps),
            this._buildFacetCard('channels',   'Channels',     'All Channels',     this._allChannels),
            this._buildFacetCard('queues',     'Queues',       'All Queues',       this._allQueues),
            this._buildFacetCard('skills',     'Skills',       'All Skills',       this._allSkills),
            this._buildFacetCard('sentiment',  'Sentiment',    'All Sentiments',   SENTIMENT_BUCKETS.map(b => ({ value: b.value, label: b.label }))),
            this._buildFacetCard('teams',      'Teams',        'All Teams',        this._allTeams),
        ];
    }

    _buildFacetCard(id, label, emptyLabel, options) {
        const selected = this._applied[id] ?? [];
        const isExpanded = this._activeFacet === id;
        return {
            id,
            label,
            summary:      this._formatSummary(selected, options, emptyLabel),
            hasSelection: selected.length > 0,
            isExpanded,
            wrapperClass: `fp-facet${isExpanded ? ' fp-facet_active' : ''}${selected.length > 0 ? ' fp-facet_has-selection' : ''}`,
        };
    }

    _formatSummary(selected, options, emptyLabel) {
        if (!selected || selected.length === 0) return emptyLabel;
        const labelByValue = Object.fromEntries(options.map(o => [o.value, o.label]));
        const labels = selected.map(v => labelByValue[v] ?? v);
        if (labels.length === 1) return labels[0];
        return `${labels[0]}, +${labels.length - 1} more`;
    }

    // ── Popover data ───────────────────────────────────────────────────────
    get hasPopover() {
        return !!this._activeFacet;
    }

    get popoverData() {
        const id = this._activeFacet;
        if (!id) return null;
        const allOptionsMap = {
            serviceRep: this._allServiceReps,
            channels:   this._allChannels,
            queues:     this._allQueues,
            skills:     this._allSkills,
            sentiment:  SENTIMENT_BUCKETS.map(b => ({ value: b.value, label: b.label })),
            teams:      this._allTeams,
        };
        const labelMap = {
            serviceRep: 'Service Rep',
            channels:   'Channels',
            queues:     'Queues',
            skills:     'Skills',
            sentiment:  'Sentiment',
            teams:      'Teams',
        };
        const options = allOptionsMap[id] ?? [];
        const selected = this._applied[id] ?? [];
        const selectedSet = new Set(selected);
        const term = (this._searchTerms[id] ?? '').trim().toLowerCase();
        const filteredOptions = term
            ? options.filter(o => o.label.toLowerCase().includes(term))
            : options;
        const allChecked = options.length > 0 && selected.length === 0;

        return {
            id,
            title:             `${labelMap[id]} (${options.length})`,
            isSearchable:      options.length > SEARCHABLE_THRESHOLD,
            searchPlaceholder: `Search ${(labelMap[id] ?? id).toLowerCase()}…`,
            searchTerm:        this._searchTerms[id] ?? '',
            options: filteredOptions.map(o => ({
                key:     `pop__${id}__${o.value}`,
                value:   o.value,
                label:   o.label,
                checked: selectedSet.has(o.value),
            })),
            noResults:    filteredOptions.length === 0,
            hasSelection: selected.length > 0,
            allChecked,
        };
    }

    // Position the popover so its nubbin aligns with the centre of the active card.
    get popoverStyle() {
        const idx = FACET_IDS.indexOf(this._activeFacet);
        if (idx < 0) return '';
        // top of active card centre relative to :host top
        const cardCentreY = BODY_TOP_OFFSET + idx * (CARD_HEIGHT + CARD_GAP) + CARD_HEIGHT / 2;
        const popoverTop  = cardCentreY - NUBBIN_OFFSET;
        return `top:${popoverTop}px`;
    }

    // ── Reset state ────────────────────────────────────────────────────────
    get hasAnySelection() {
        return Object.values(this._applied).some(arr => arr.length > 0);
    }

    // ── Event handlers ─────────────────────────────────────────────────────
    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }

    handleHeaderKeydown(event) {
        if (event.key === 'Escape') {
            if (this._activeFacet) {
                event.preventDefault();
                this._activeFacet = null;
            } else {
                event.preventDefault();
                this.handleClose();
            }
        }
    }

    handleFacetToggle(event) {
        const id = event.currentTarget.dataset.facet;
        if (!id) return;
        event.stopPropagation();
        this._activeFacet = this._activeFacet === id ? null : id;
    }

    // Clicking anywhere on the panel (but not a facet button) closes popover
    handlePanelClick(event) {
        if (!event.target.closest('.fp-facet__row') && !event.target.closest('.fp-popover')) {
            this._activeFacet = null;
        }
    }

    handleOptionChange(event) {
        const id    = event.currentTarget.dataset.facet;
        const value = event.currentTarget.dataset.value;
        if (!id || value == null) return;
        const checked = !!event.target.checked;
        const current = new Set(this._applied[id] ?? []);
        if (checked) current.add(value); else current.delete(value);
        const nextApplied = { ...this._applied, [id]: Array.from(current) };
        this._applied = nextApplied;
        this._fireApply(nextApplied);
    }

    handleAllOptionChange(event) {
        const id = this._activeFacet;
        if (!id) return;
        // "All" means clear all selections for this facet
        const nextApplied = { ...this._applied, [id]: [] };
        this._applied = nextApplied;
        this._fireApply(nextApplied);
    }

    handleFacetSearch(event) {
        const id = event.currentTarget.dataset.facet;
        if (!id) return;
        this._searchTerms = { ...this._searchTerms, [id]: event.target.value ?? '' };
    }

    handleFacetClear(event) {
        const id = event.currentTarget.dataset.facet;
        if (!id) return;
        const nextApplied = { ...this._applied, [id]: [] };
        this._applied = nextApplied;
        this._fireApply(nextApplied);
    }

    handleFacetClearCard(event) {
        // Delete icon on the facet card row — clears that facet without
        // opening the popover. Stop propagation so the facet-toggle button
        // beneath doesn't also fire.
        event.stopPropagation();
        const id = event.currentTarget.dataset.facet;
        if (!id) return;
        if (this._activeFacet === id) this._activeFacet = null;
        const nextApplied = { ...this._applied, [id]: [] };
        this._applied = nextApplied;
        this._fireApply(nextApplied);
    }

    handleResetAll() {
        const nextApplied = emptyFilters();
        this._applied = nextApplied;
        this._fireApply(nextApplied);
    }

    _fireApply(filters) {
        this.dispatchEvent(new CustomEvent('apply', {
            detail: { filters: cloneFilters(filters) },
        }));
    }
}

function normalizeFilters(value) {
    const out = emptyFilters();
    if (!value || typeof value !== 'object') return out;
    for (const id of FACET_IDS) {
        const arr = value[id];
        out[id] = Array.isArray(arr) ? arr.slice() : [];
    }
    return out;
}

function cloneFilters(value) {
    const out = {};
    for (const id of FACET_IDS) {
        out[id] = (value[id] ?? []).slice();
    }
    return out;
}
