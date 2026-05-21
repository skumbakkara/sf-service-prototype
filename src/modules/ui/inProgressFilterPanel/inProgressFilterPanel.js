import { LightningElement, api, track } from 'lwc';

// ── Sentiment buckets ───────────────────────────────────────────────────────
// The data has 5 raw sentiment levels (excellent/good/neutral/bad/terrible).
// Figma collapses them to 3 buckets (Positive / Neutral / Negative) — same
// grouping the table cell already uses. Filter chips show the bucket label;
// the matching against a row's `sentiment` field is handled by the table.
const SENTIMENT_BUCKETS = [
    { value: 'positive', label: 'Positive', values: ['excellent', 'good']    },
    { value: 'neutral',  label: 'Neutral',  values: ['neutral']              },
    { value: 'negative', label: 'Negative', values: ['bad', 'terrible']      },
];

// Channel value -> display label. Matches the labels used by the table cell.
const CHANNEL_LABELS = {
    cases:     'Case',
    chat:      'Chat',
    call:      'Call',
    email:     'Email',
    messaging: 'Messaging',
};

// Long-list threshold — facets with more options than this get a
// "Search within…" input above the checkbox list (matches Figma for the
// Service Rep / Queues / Skills / Teams rows that have many distinct values).
const SEARCHABLE_THRESHOLD = 6;

// Facet IDs are referenced throughout the component (template `for:each`
// view models, applied chip mapping in the parent, etc.). Single source of
// truth. Order here is also the visual order in the panel.
const FACET_IDS = ['serviceRep', 'channels', 'queues', 'skills', 'sentiment', 'teams'];

// Empty-state for the applied-filters object. `appliedFilters` is always a
// fully-populated object keyed by facet id (each value an array) so the
// table-side filter pipeline can iterate uniformly without null checks.
function emptyFilters() {
    return FACET_IDS.reduce((acc, id) => { acc[id] = []; return acc; }, {});
}

export default class InProgressFilterPanel extends LightningElement {
    // ── Public API ──────────────────────────────────────────────────────────
    // This component is now an INLINE DRAWER, not an overlay. The parent
    // (ui-in-progress-table) is responsible for whether the host element is
    // rendered at all (via `template if:true` on the host's open state) — so
    // there's no `open` prop, no backdrop, no fixed positioning, no modal
    // semantics. The parent simply destroys the panel on close.

    // Source data the panel uses to enumerate facet options. The parent passes
    // the full IN_PROGRESS_ITEMS list; the panel derives distinct values per
    // facet from it. Sorted alphabetically for deterministic output.
    @api
    get items() { return this._items; }
    set items(value) {
        this._items = Array.isArray(value) ? value : [];
    }

    // Currently-applied filters (parent-owned, immediate-apply). Drives the
    // selection-summary line per facet row and which checkboxes are checked
    // when a facet is expanded. There is no "draft" — every change fires an
    // `apply` event immediately, so this mirrors the parent's source of truth.
    @api
    get appliedFilters() { return this._applied; }
    set appliedFilters(value) {
        this._applied = normalizeFilters(value);
    }

    // ── Internal state ──────────────────────────────────────────────────────
    @track _items = [];
    @track _applied = emptyFilters();
    @track _expandedFacet = null;      // facet id currently expanded (or null)
    @track _searchTerms = {};          // facet id -> in-facet search string

    // ── Distinct options (derived from items) ──────────────────────────────
    // Each getter returns an array of { value, label } for the facet's
    // checkbox list. Results are sorted alphabetically by label.
    get _allServiceReps() {
        const set = new Set();
        for (const r of this._items) if (r.assignedTo) set.add(r.assignedTo);
        return Array.from(set).sort((a, b) => a.localeCompare(b))
            .map(v => ({ value: v, label: v }));
    }

    get _allChannels() {
        const set = new Set();
        for (const r of this._items) if (r.channel) set.add(r.channel);
        return Array.from(set).sort()
            .map(v => ({ value: v, label: CHANNEL_LABELS[v] ?? v }));
    }

    get _allQueues() {
        const set = new Set();
        for (const r of this._items) if (r.queue) set.add(r.queue);
        return Array.from(set).sort((a, b) => a.localeCompare(b))
            .map(v => ({ value: v, label: v }));
    }

    get _allSkills() {
        const set = new Set();
        for (const r of this._items) {
            if (Array.isArray(r.skills)) for (const s of r.skills) if (s) set.add(s);
        }
        return Array.from(set).sort((a, b) => a.localeCompare(b))
            .map(v => ({ value: v, label: v }));
    }

    get _allTeams() {
        const set = new Set();
        for (const r of this._items) if (r.team) set.add(r.team);
        return Array.from(set).sort((a, b) => a.localeCompare(b))
            .map(v => ({ value: v, label: v }));
    }

    // ── Per-facet view models for the template ──────────────────────────────
    // `facetList` returns the array the template `for:each`s over. Matches
    // the new Figma mock: 6 facets, no Agent Type. AI/Human quick filtering
    // is restored to the page toolbar (separate concern from the panel).
    get facetList() {
        return [
            this._buildFacet('serviceRep', 'Service Rep',  'All Service Reps', this._allServiceReps),
            this._buildFacet('channels',   'Channels',     'All Channels',     this._allChannels),
            this._buildFacet('queues',     'Queues',       'All Queues',       this._allQueues),
            this._buildFacet('skills',     'Skills',       'All Skills',       this._allSkills),
            this._buildFacet('sentiment',  'Sentiment',    'All Sentiments',   SENTIMENT_BUCKETS.map(b => ({ value: b.value, label: b.label }))),
            this._buildFacet('teams',      'Teams',        'All Teams',        this._allTeams),
        ];
    }

    _buildFacet(id, label, emptyLabel, options) {
        const selected    = this._applied[id] ?? [];
        const selectedSet = new Set(selected);
        const isExpanded  = this._expandedFacet === id;
        const term        = (this._searchTerms[id] ?? '').trim().toLowerCase();
        const filteredOptions = term
            ? options.filter(o => o.label.toLowerCase().includes(term))
            : options;
        return {
            id,
            label,
            summary:           this._formatSummary(selected, options, emptyLabel),
            hasSelection:      selected.length > 0,
            isExpanded,
            // CSS class hooks: visually highlight an active facet so the
            // user can see at a glance which rows have applied selections,
            // and which one is currently expanded.
            wrapperClass:
                `fp-facet${isExpanded ? ' fp-facet_expanded' : ''}${selected.length > 0 ? ' fp-facet_has-selection' : ''}`,
            // The collapsed row per the new mock has no chevron / no trash;
            // we still expose `aria-expanded` for AT. No icon name needed
            // because the template doesn't render a chevron element.
            isSearchable:      options.length > SEARCHABLE_THRESHOLD,
            searchTerm:        this._searchTerms[id] ?? '',
            searchPlaceholder: `Search ${label.toLowerCase()}…`,
            options: filteredOptions.map(o => ({
                key:     `${id}__${o.value}`,
                value:   o.value,
                label:   o.label,
                checked: selectedSet.has(o.value),
            })),
            noResults: filteredOptions.length === 0,
        };
    }

    _formatSummary(selected, options, emptyLabel) {
        if (!selected || selected.length === 0) return emptyLabel;
        const labelByValue = Object.fromEntries(options.map(o => [o.value, o.label]));
        const labels = selected.map(v => labelByValue[v] ?? v);
        if (labels.length === 1) return labels[0];
        const extra = labels.length - 1;
        return `${labels[0]}, +${extra} more`;
    }

    // ── Reset state ─────────────────────────────────────────────────────────
    get hasAnySelection() {
        return Object.values(this._applied).some(arr => arr.length > 0);
    }

    // ── Event handlers ──────────────────────────────────────────────────────
    handleClose() {
        // Notifies the parent (the table) to flip its own open state. The
        // host element is destroyed on the next render, so we don't bother
        // resetting internal state — distinct `_items` etc. are re-driven
        // by props anyway on re-mount.
        this.dispatchEvent(new CustomEvent('close'));
    }

    handleHeaderKeydown(event) {
        // ESC closes the panel ONLY when the keydown originates inside the
        // panel — we intentionally do NOT install a global window listener
        // so the panel doesn't fight with other components for keyboard
        // events. Fires on the panel root via `onkeydown`.
        if (event.key === 'Escape') {
            event.preventDefault();
            this.handleClose();
        }
    }

    handleFacetToggle(event) {
        const id = event.currentTarget.dataset.facet;
        if (!id) return;
        // Single-open accordion: click any other row to close the current
        // one and open the clicked one. Click the open row to collapse it.
        this._expandedFacet = this._expandedFacet === id ? null : id;
    }

    handleOptionChange(event) {
        // Immediate-apply: each checkbox change writes through to the
        // applied filters and notifies the parent. The chip row above the
        // table updates on the same tick.
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

    handleFacetSearch(event) {
        const id = event.currentTarget.dataset.facet;
        if (!id) return;
        this._searchTerms = { ...this._searchTerms, [id]: event.target.value ?? '' };
    }

    handleFacetClear(event) {
        // "Clear" text-button shown inside an expanded facet body. Wipes
        // selection for that facet only. event.stopPropagation isn't needed
        // here because the button lives inside the expanded body, not on
        // the row header.
        const id = event.currentTarget.dataset.facet;
        if (!id) return;
        const nextApplied = { ...this._applied, [id]: [] };
        this._applied = nextApplied;
        this._fireApply(nextApplied);
    }

    handleResetAll() {
        // Bottom-of-panel reset — collapses every facet selection. The chip
        // row above the table also exposes "Clear all"; either path produces
        // the same final state.
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

// ── Helpers ─────────────────────────────────────────────────────────────────

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
