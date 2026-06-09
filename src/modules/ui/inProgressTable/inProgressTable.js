import { LightningElement, api, track } from 'lwc';

const CHANNEL_ICONS  = { chat: 'utility:chat', call: 'utility:call', cases: 'utility:case', email: 'utility:email', messaging: 'utility:sms' };
const CHANNEL_LABELS = { chat: 'Chat', call: 'Call', cases: 'Case', email: 'Email', messaging: 'Message' };

// ── Queue & Skill detail maps (module-level constants) ───────────────────────
const QUEUE_DETAILS = {
    'Billing':          { priority: '#1', workSize: '1 unit', online: 12, busy: 8,  atCapacity: 7, idle: 4, totalWaiting: 4, longestWait: '4m 2s',  avgWait: '2m 5s'  },
    'Tech Support':     { priority: '#2', workSize: '1 unit', online: 9,  busy: 5,  atCapacity: 3, idle: 2, totalWaiting: 2, longestWait: '1m 45s', avgWait: '1m 2s'  },
    'Cancellations':    { priority: '#3', workSize: '1 unit', online: 6,  busy: 4,  atCapacity: 2, idle: 1, totalWaiting: 3, longestWait: '6m 10s', avgWait: '3m 30s' },
    'Onboarding':       { priority: '#4', workSize: '2 units',online: 8,  busy: 3,  atCapacity: 3, idle: 5, totalWaiting: 1, longestWait: '2m 0s',  avgWait: '1m 15s' },
    'Renewals':         { priority: '#5', workSize: '1 unit', online: 5,  busy: 2,  atCapacity: 1, idle: 3, totalWaiting: 0, longestWait: '—',      avgWait: '—'      },
    'Returns':          { priority: '#6', workSize: '1 unit', online: 4,  busy: 3,  atCapacity: 2, idle: 1, totalWaiting: 5, longestWait: '8m 30s', avgWait: '4m 45s' },
    'Enterprise':       { priority: '#1', workSize: '2 units',online: 7,  busy: 6,  atCapacity: 5, idle: 1, totalWaiting: 6, longestWait: '10m 0s', avgWait: '5m 30s' },
    'General Inquiry':  { priority: '#7', workSize: '1 unit', online: 14, busy: 9,  atCapacity: 8, idle: 5, totalWaiting: 7, longestWait: '3m 20s', avgWait: '1m 50s' },
};

const SKILL_DETAILS = {
    'Product Knowledge':  { priority: '#1', workSize: '1 unit', online: 10, busy: 7, atCapacity: 5, idle: 3, totalWaiting: 3, longestWait: '3m 15s', avgWait: '1m 45s' },
    'Billing Expertise':  { priority: '#2', workSize: '1 unit', online: 8,  busy: 5, atCapacity: 4, idle: 3, totalWaiting: 2, longestWait: '2m 30s', avgWait: '1m 20s' },
    'Technical Writing':  { priority: '#3', workSize: '1 unit', online: 4,  busy: 2, atCapacity: 1, idle: 2, totalWaiting: 1, longestWait: '1m 0s',  avgWait: '0m 45s' },
    'Conflict Resolution':{ priority: '#4', workSize: '1 unit', online: 6,  busy: 4, atCapacity: 3, idle: 2, totalWaiting: 2, longestWait: '4m 0s',  avgWait: '2m 10s' },
    'Spanish':            { priority: '#5', workSize: '1 unit', online: 5,  busy: 3, atCapacity: 2, idle: 2, totalWaiting: 1, longestWait: '2m 0s',  avgWait: '1m 0s'  },
    'French':             { priority: '#6', workSize: '1 unit', online: 3,  busy: 1, atCapacity: 1, idle: 2, totalWaiting: 0, longestWait: '—',      avgWait: '—'      },
    'Enterprise Sales':   { priority: '#2', workSize: '2 units',online: 5,  busy: 4, atCapacity: 3, idle: 1, totalWaiting: 3, longestWait: '5m 30s', avgWait: '3m 0s'  },
    'Compliance':         { priority: '#3', workSize: '1 unit', online: 4,  busy: 2, atCapacity: 1, idle: 2, totalWaiting: 1, longestWait: '3m 0s',  avgWait: '1m 30s' },
};

const QS_GENERIC = { priority: '#—', workSize: '1 unit', online: 0, busy: 0, atCapacity: 0, idle: 0, totalWaiting: 0, longestWait: '—', avgWait: '—' };

// ── Filter helpers ──────────────────────────────────────────────────────────
// Facet ids must mirror the panel component. Defined here too because the
// table owns the canonical applied state and produces the chip row. Agent
// Type isn't in this list — AI/Human filtering happens at the page level
// via the toolbar toggles, which pre-filter the data we receive via `data`.
const FACET_IDS = ['serviceRep', 'channels', 'queues', 'skills', 'sentiment', 'teams'];

// Sentiment buckets — same mapping the panel uses. Duplicated rather than
// imported so the table can stay self-contained for the demo.
const SENTIMENT_BUCKET_MEMBERS = {
    positive: new Set(['excellent', 'good']),
    neutral:  new Set(['neutral']),
    negative: new Set(['bad', 'terrible']),
};

const FACET_LABELS = {
    serviceRep: 'Service Rep',
    channels:   'Channels',
    queues:     'Queue',
    skills:     'Skill',
    sentiment:  'Sentiment',
    teams:      'Team',
};

const SENTIMENT_LABELS = {
    positive: 'Positive', neutral: 'Neutral', negative: 'Negative',
};

function emptyFilters() {
    return FACET_IDS.reduce((acc, id) => { acc[id] = []; return acc; }, {});
}

// Sentiment config: emoji icon + color class per level
// All five raw sentiment values collapse to three buckets: good / average / bad
const SENTIMENT_CONFIG = {
    excellent: { icon: 'utility:emoji_good',    label: 'Good',    cssClass: 'ipt-sentiment_good'    },
    good:      { icon: 'utility:emoji_good',    label: 'Good',    cssClass: 'ipt-sentiment_good'    },
    neutral:   { icon: 'utility:emoji_average', label: 'Average', cssClass: 'ipt-sentiment_average' },
    bad:       { icon: 'utility:emoji_bad',     label: 'Bad',     cssClass: 'ipt-sentiment_bad'     },
    terrible:  { icon: 'utility:emoji_bad',     label: 'Bad',     cssClass: 'ipt-sentiment_bad'     },
};

// Priority badge config (per Figma): rounded-rect chip with semantic container backgrounds
const PRIORITY_CONFIG = {
    Low:      { label: 'Low',      cssClass: 'ipt-priority ipt-priority_low'      },
    Medium:   { label: 'Medium',   cssClass: 'ipt-priority ipt-priority_medium'   },
    High:     { label: 'High',     cssClass: 'ipt-priority ipt-priority_high'     },
    Critical: { label: 'Critical', cssClass: 'ipt-priority ipt-priority_critical' },
};

// Status config: only three states — Working (in-progress, neutral),
// New (just assigned, info-blue), Escalated (needs attention, error-red).
const STATUS_CONFIG = {
    Working:   { label: 'Working',   icon: 'utility:setup',    cssClass: 'ipt-status ipt-status_working'   },
    New:       { label: 'New',       icon: 'utility:new',      cssClass: 'ipt-status ipt-status_new'       },
    Escalated: { label: 'Escalated', icon: 'utility:priority', cssClass: 'ipt-status ipt-status_escalated' },
};

// Column order: Status pulled forward next to Details; Flag pulled forward next to Assigned To.
// Widths sized to actual cell content. Icon-only columns floor at 80px; text
// columns are sized so the header label fits without truncation when not hovered
// (the chevron is display:none until :hover and table-layout:fixed prevents
// hover expansion). Details + Assigned Time are content-heavy and stay wider.
const COLUMN_DEFS = [
    { label: 'Channel',        fieldName: 'channelLabel',   sortable: false, width: 100  },
    { label: 'Details',        fieldName: 'subject',        sortable: true,  width: 560  },
    { label: 'Status',         fieldName: 'status',         sortable: true,  width: 110  },
    { label: 'Priority',       fieldName: 'priority',       sortable: true,  width: 110  },
    { label: 'Assigned To',    fieldName: 'assignedTo',     sortable: true,  width: 170  },
    { label: 'Flag',           fieldName: 'hasFlag',        sortable: false, width: 80   },
    { label: 'Route By',       fieldName: 'routeBy',        sortable: true,  width: 160  },
    { label: 'Action',         fieldName: 'action',         sortable: false, width: 110  },
    { label: 'User Sentiment', fieldName: 'sentiment',      sortable: true,  width: 150  },
    { label: 'Work Size',      fieldName: 'workSize',       sortable: true,  width: 110  },
    { label: 'INTR',           fieldName: 'isInterruptible',sortable: false, width: 80   },
    { label: 'Handle Time',    fieldName: 'handleTime',     sortable: true,  width: 130  },
    { label: 'Assigned Time',  fieldName: 'assignedTime',   sortable: true,  width: 180  },
    { label: 'Speed To Answer',fieldName: 'speedToAnswer',  sortable: true,  width: 160  },
    { label: 'Accepted Time',  fieldName: 'acceptedTime',   sortable: true,  width: 180  },
];

// Infinite-scroll bottom threshold in pixels — when the user scrolls within
// this distance of the bottom of the scroll container, another page of clones
// is appended.
const SCROLL_THRESHOLD_PX = 120;

// Default copy for the flag popover. The Figma spec for the flagged-work
// popover (node 19427:55644) shows a "Latest Whisper from Rep" title with a
// short note body and a "Lower Flag" action. For this prototype the same
// text is shown for every flagged row; varied per-row whispers can be
// added later by attaching `flagWhisperTitle` / `flagWhisperBody` to the
// source items in serviceReps.js.
const FLAG_WHISPER_TITLE_DEFAULT = 'Latest Whisper from Rep';
const FLAG_WHISPER_BODY_DEFAULT  = 'Help needed with this case';

export default class InProgressTable extends LightningElement {
    _data = [];
    _pageCount = 0;        // # of extra cloned pages appended after the seed
    _isLoading = false;
    _scrollAttached = false;

    // ID of the most-recently-prepended row; drives the slide-in animation.
    @track _newRowId = null;

    // ID of the row whose flag popover is currently open; null = all closed.
    @track _openFlagRowId = null;

    // Queue/Skill hover popover state: { type, name, top, left } or null
    @track _openQsPopover = null;

    // Parent passes the id of the arriving row via this attribute so the
    // animation class is applied in the same render that draws the row.
    @api
    get newRowId() { return this._newRowId; }
    set newRowId(value) {
        const id = value ? String(value) : null;
        this._newRowId = id;
        if (id) {
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(() => { this._newRowId = null; }, 2600);
        }
    }

    // Comma-separated list of column fieldNames to hide. Kebab-case attribute:
    // `hide-columns="status,assignedTo,hasFlag"`. Empty string => show all.
    @api hideColumns = '';

    @track sortedBy;
    @track sortedDirection = 'asc';
    @track selectedIds = new Set();

    // ── Filter state ────────────────────────────────────────────────────────
    // `_appliedFilters` is the canonical state shared with the inline drawer.
    // Always a fully-populated object keyed by facet id (each value an array)
    // so downstream consumers never need null checks.
    @track _filterPanelOpen = false;
    @track _appliedFilters = emptyFilters();

    // Public methods called by the page's toolbar Filter button. The button
    // calls `toggleFilterPanel()` so a second click closes the drawer. The
    // page mirrors our open state for the funnel button's brand variant by
    // listening for `panelchange` events we dispatch from `_setPanelOpen`.
    @api
    openFilterPanel() { this._setPanelOpen(true); }
    @api
    closeFilterPanel() { this._setPanelOpen(false); }
    @api
    toggleFilterPanel() { this._setPanelOpen(!this._filterPanelOpen); }

    _setPanelOpen(next) {
        const value = Boolean(next);
        if (value === this._filterPanelOpen) return;
        this._filterPanelOpen = value;
        this.dispatchEvent(new CustomEvent('panelchange', {
            detail: { open: value },
        }));
    }

    get _hiddenFieldSet() {
        const raw = this.hideColumns;
        if (!raw || typeof raw !== 'string') return new Set();
        const out = new Set();
        for (const part of raw.split(',')) {
            const name = part.trim();
            if (name) out.add(name);
        }
        return out;
    }

    @api
    get data() { return this._data; }
    set data(value) {
        this._data = Array.isArray(value) ? value : [];
        // When the parent passes a new (filtered) source array, restart from
        // page 1 of the new source. Clearing the selection avoids stale IDs
        // referencing items not in the new filtered set.
        this._pageCount = 0;
        this._isLoading = false;
        this.selectedIds = new Set();
        // Reset scroll position to the top so users see the new filter result
        // from the start. Guarded — first set() runs before the DOM exists.
        const container = this.template
            ? this.template.querySelector('.ipt-container')
            : null;
        if (container) container.scrollTop = 0;
    }

    // ── Filtering ───────────────────────────────────────────────────────────
    // The table now owns its own filter state, so `expandedData` flows from
    // `filteredData` rather than `_data` directly. Pagination clones run off
    // the filtered seed too, which matches the existing "restart at page 1
    // on data swap" semantics — only here the trigger is a filter Apply.
    get filteredData() {
        const items = this._data ?? [];
        const f = this._appliedFilters;
        const hasAny = FACET_IDS.some(id => (f[id] ?? []).length > 0);
        if (!hasAny) return items;
        return items.filter(item => this._matchesFilters(item, f));
    }

    _matchesFilters(item, f) {
        // Service Rep — direct match on assignedTo.
        if (f.serviceRep.length > 0 && !f.serviceRep.includes(item.assignedTo)) return false;
        // Channels — direct match on channel.
        if (f.channels.length   > 0 && !f.channels.includes(item.channel))     return false;
        // Queues — direct match on queue.
        if (f.queues.length     > 0 && !f.queues.includes(item.queue))         return false;
        // Teams — direct match on team.
        if (f.teams.length      > 0 && !f.teams.includes(item.team))           return false;
        // Skills — intersection (row matches if it has any of the requested skills).
        if (f.skills.length > 0) {
            const itemSkills = Array.isArray(item.skills) ? item.skills : [];
            const hit = f.skills.some(s => itemSkills.includes(s));
            if (!hit) return false;
        }
        // Sentiment — translate buckets back to raw values for the row check.
        if (f.sentiment.length > 0) {
            const matched = f.sentiment.some(bucket => {
                const members = SENTIMENT_BUCKET_MEMBERS[bucket];
                return members && members.has(String(item.sentiment ?? '').toLowerCase());
            });
            if (!matched) return false;
        }
        return true;
    }

    // ── Filter chip row (toolbar row in the parent page) ───────────────────
    // Exposed as @api so the parent page can render chips inline with the
    // "N Work Items • Live Updates" row. Each chip maps to one active facet.
    @api
    get filterChips() {
        const chips = [];
        const f = this._appliedFilters;
        for (const id of FACET_IDS) {
            const values = f[id] ?? [];
            if (values.length === 0) continue;
            chips.push({
                id,
                label: `${FACET_LABELS[id]}: ${this._chipValueText(id, values)}`,
                clearTitle: `Remove ${FACET_LABELS[id]} filter`,
            });
        }
        return chips;
    }

    @api get hasFilterChips()   { return this.filterChips.length > 0; }
    @api get filterCountLabel() {
        const n = this.filterChips.length;
        return `${n} ${n === 1 ? 'filter' : 'filters'} applied`;
    }

    @api
    clearFacet(id) {
        if (!id) return;
        this._appliedFilters = { ...this._appliedFilters, [id]: [] };
        this._pageCount = 0;
        this.selectedIds = new Set();
        this._fireFilterChange();
    }

    @api
    clearAllFilters() {
        this._appliedFilters = emptyFilters();
        this._pageCount = 0;
        this.selectedIds = new Set();
        this._fireFilterChange();
    }

    _chipValueText(id, values) {
        const first = this._displayValue(id, values[0]);
        if (values.length === 1) return first;
        return `${first} +${values.length - 1}more`;
    }

    _displayValue(id, value) {
        if (id === 'sentiment') return SENTIMENT_LABELS[value] ?? value;
        if (id === 'channels')  return CHANNEL_LABELS[value]   ?? value;
        return value;
    }

    get expandedData() {
        const seed = this.filteredData;
        if (seed.length === 0) return [];
        const out = seed.slice();
        for (let p = 1; p <= this._pageCount; p++) {
            for (let i = 0; i < seed.length; i++) {
                const orig = seed[i];
                out.push({ ...orig, id: `${orig.id}--p${p}-${i}` });
            }
        }
        return out;
    }

    get columnHeaders() {
        const hidden = this._hiddenFieldSet;
        return COLUMN_DEFS
            .filter(col => !hidden.has(col.fieldName))
            .map(col => ({
                ...col,
                style: `width:${col.width}px;min-width:${col.width}px;`,
                thClass: col.sortable ? 'slds-is-sortable' : '',
            }));
    }

    // Per-column visibility getters used by the row template to drop body
    // <td>s for hidden columns. Field names mirror COLUMN_DEFS entries.
    get showChannel()       { return !this._hiddenFieldSet.has('channelLabel'); }
    get showDetails()       { return !this._hiddenFieldSet.has('subject'); }
    get showStatus()        { return !this._hiddenFieldSet.has('status'); }
    get showPriority()      { return !this._hiddenFieldSet.has('priority'); }
    get showAssignedTo()    { return !this._hiddenFieldSet.has('assignedTo'); }
    get showFlag()          { return !this._hiddenFieldSet.has('hasFlag'); }
    get showRouteBy()       { return !this._hiddenFieldSet.has('routeBy'); }
    get showAction()        { return !this._hiddenFieldSet.has('action'); }
    get showSentiment()     { return !this._hiddenFieldSet.has('sentiment'); }
    get showWorkSize()      { return !this._hiddenFieldSet.has('workSize'); }
    get showInterruptible() { return !this._hiddenFieldSet.has('isInterruptible'); }
    get showHandleTime()    { return !this._hiddenFieldSet.has('handleTime'); }
    get showAssignedTime()  { return !this._hiddenFieldSet.has('assignedTime'); }
    get showSpeedToAnswer() { return !this._hiddenFieldSet.has('speedToAnswer'); }
    get showAcceptedTime()  { return !this._hiddenFieldSet.has('acceptedTime'); }

    get allSelected() {
        const total = this.expandedData.length;
        return total > 0 && this.selectedIds.size === total;
    }

    get tableRows() {
        const rows = (this.expandedData ?? []).map((item) => {
            const sentimentKey = String(item.sentiment ?? 'neutral').toLowerCase();
            const sentimentCfg = SENTIMENT_CONFIG[sentimentKey] ?? SENTIMENT_CONFIG.neutral;
            const priorityCfg  = PRIORITY_CONFIG[item.priority] ?? null;
            const statusCfg    = STATUS_CONFIG[item.status]     ?? STATUS_CONFIG.Working;
            // Details cell renders as a single hyperlink composed of:
            //   subject | case# | status | <priority> Priority
            // Parts are dropped when missing so e.g. items without a priority
            // collapse to "Subject | 12345 | Working" without a trailing pipe.
            const detailsParts = [];
            if (item.subject)        detailsParts.push(item.subject);
            if (item.caseNumber)     detailsParts.push(String(item.caseNumber));
            if (statusCfg?.label)    detailsParts.push(statusCfg.label);
            if (priorityCfg?.label)  detailsParts.push(`${priorityCfg.label} Priority`);
            const rowId = String(item.id);
            const isNew = rowId === this._newRowId;
            const isFlagOpen = rowId === this._openFlagRowId;
            return {
                id: rowId,
                rowClass: `slds-hint-parent ipt-row${isNew ? ' ipt-row--new' : ''}`,
                isFlagOpen,
                channelIcon: CHANNEL_ICONS[item.channel] ?? 'utility:record',
                channelLabel: CHANNEL_LABELS[item.channel] ?? item.channel,
                subject: item.subject,
                caseNumberDisplay: `#${item.caseNumber}`,
                detailsLink: detailsParts.join(' | '),
                priority: item.priority,
                priorityLabel: priorityCfg?.label ?? '',
                priorityClass: priorityCfg?.cssClass ?? '',
                hasPriority: !!priorityCfg,
                assignedTo: item.assignedTo,
                isAiAgent: !!item.isAgent,
                assignedToAvatarUrl: item.avatarUrl || null,
                assignedToInitials: (item.assignedTo || '')
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map(w => w[0])
                    .join('')
                    .toUpperCase(),
                routeBy: item.routeBy,
                routeKind: item.routeKind ?? 'queue',
                routeByIcon: item.routeByIcon
                    || (item.routeBy === 'Direct to Agent' ? 'utility:forward' : null),
                hasFlag: item.hasFlag,
                // Flag popover title id is unique per row so the dialog can
                // be labelled by it. lightning-button-menu manages its own
                // open/close state — the CSS `:has(button[aria-expanded="true"])`
                // selector on `.ipt-flag-td` handles the stacking-context lift
                // automatically when the dropdown opens, so no row-level
                // open/closed flag is tracked in JS.
                flagPopoverTitleId: `ipt-flag-popover-title-${rowId}`,
                flagWhisperTitle: item.flagWhisperTitle || FLAG_WHISPER_TITLE_DEFAULT,
                flagWhisperBody:  item.flagWhisperBody  || FLAG_WHISPER_BODY_DEFAULT,
                sentimentIcon: sentimentCfg.icon,
                sentimentLabel: sentimentCfg.label,
                sentimentClass: sentimentCfg.cssClass,
                workSize: item.workSize,
                isInterruptible: item.isInterruptible,
                handleTime: item.handleTime,
                assignedTime: item.assignedTime,
                speedToAnswer: item.speedToAnswer,
                acceptedTime: item.acceptedTime,
                status: item.status,
                statusLabel: statusCfg.label,
                statusIcon: statusCfg.icon,
                statusClass: statusCfg.cssClass,
                isSelected: this.selectedIds.has(String(item.id)),
            };
        });

        if (!this.sortedBy) return rows;

        const dir = this.sortedDirection === 'asc' ? 1 : -1;
        return [...rows].sort((a, b) => {
            const av = a[this.sortedBy] ?? '';
            const bv = b[this.sortedBy] ?? '';
            return av < bv ? -dir : av > bv ? dir : 0;
        });
    }

    // ── Queue / Skill popover ────────────────────────────────────────────────
    get popoverVisible() { return this._openQsPopover !== null; }

    _qsData() {
        const p = this._openQsPopover;
        if (!p) return QS_GENERIC;
        const map = p.type === 'skill' ? SKILL_DETAILS : QUEUE_DETAILS;
        return map[p.name] ?? QS_GENERIC;
    }

    get popoverName()        { return this._openQsPopover?.name ?? ''; }
    get popoverIcon()        { return this._openQsPopover?.type === 'skill' ? 'standard:skill' : 'standard:work_queue'; }
    get popoverPerfTitle()   { return this._openQsPopover?.type === 'skill' ? 'Skill Performance' : 'Queue Performance'; }
    get popoverClass()       { return `qs-popover${this._openQsPopover?.above ? ' qs-popover--above' : ''}`; }
    get popoverStyle() {
        const p = this._openQsPopover;
        if (!p) return '';
        return `top:${p.top}px;left:${p.left}px;`;
    }
    get popoverPriority()    { return this._qsData().priority; }
    get popoverWorkSize()    { return this._qsData().workSize; }
    get popoverOnline()      { return this._qsData().online; }
    get popoverBusy()        { return this._qsData().busy; }
    get popoverAtCapacity()  { return this._qsData().atCapacity; }
    get popoverIdle()        { return this._qsData().idle; }
    get popoverTotalWaiting(){ return this._qsData().totalWaiting; }
    get popoverLongestWait() { return this._qsData().longestWait; }
    get popoverAvgWait()     { return this._qsData().avgWait; }

    handleQsClose(event) {
        event.stopPropagation();
        this._openQsPopover = null;
    }

    handleQsClick(event) {
        event.stopPropagation();
        const el = event.currentTarget;
        const type = el.dataset.qsType;
        const name = el.dataset.qsName;
        if (!type || !name) return;
        if (this._openQsPopover?.name === name && this._openQsPopover?.type === type) {
            this._openQsPopover = null;
            return;
        }
        const rect = el.getBoundingClientRect();
        const wrap = this.template.querySelector('.ipt-shell');
        const wrapRect = wrap ? wrap.getBoundingClientRect() : { top: 0, left: 0 };
        const POPOVER_H = 360;
        const spaceBelow = window.innerHeight - rect.bottom;
        const above = spaceBelow < POPOVER_H && rect.top > POPOVER_H;
        this._openQsPopover = {
            type,
            name,
            above,
            top:  above
                ? rect.top - wrapRect.top - POPOVER_H
                : rect.bottom - wrapRect.top + 8,
            left: rect.left - wrapRect.left,
        };
    }

    handleSort(event) {
        const field = event.currentTarget.dataset.field;
        const col = COLUMN_DEFS.find(c => c.fieldName === field);
        if (!col?.sortable) return;
        if (this.sortedBy === field) {
            this.sortedDirection = this.sortedDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortedBy = field;
            this.sortedDirection = 'asc';
        }
    }

    handleSelectAll(event) {
        if (event.target.checked) {
            this.selectedIds = new Set((this.expandedData ?? []).map(r => String(r.id)));
        } else {
            this.selectedIds = new Set();
        }
    }

    handleRowSelect(event) {
        const id = event.currentTarget.dataset.id;
        const next = new Set(this.selectedIds);
        if (event.target.checked) {
            next.add(id);
        } else {
            next.delete(id);
        }
        this.selectedIds = next;
    }

    // ── Flag popover handlers ──────────────────────────────────────────────
    handleFlagToggle(event) {
        const id = event.currentTarget?.dataset?.id;
        if (!id) return;
        event.stopPropagation();
        this._openFlagRowId = this._openFlagRowId === id ? null : id;
    }

    handleLowerFlag(event) {
        const id = event.currentTarget?.dataset?.id;
        if (!id) return;
        this._openFlagRowId = null;
        this.dispatchEvent(new CustomEvent('flaglower', {
            detail: { id },
            bubbles: true,
            composed: true,
        }));
    }

    _handleDocClick = () => {
        if (this._openFlagRowId !== null) this._openFlagRowId = null;
        if (this._openQsPopover !== null) this._openQsPopover = null;
    };

    // ── Infinite scroll + outside-click dismiss ─────────────────────────────
    renderedCallback() {
        if (this._scrollAttached) return;
        const container = this.template.querySelector('.ipt-container');
        if (!container) return;
        container.addEventListener('scroll', this._onScroll);
        document.addEventListener('click', this._handleDocClick);
        this._scrollAttached = true;
    }

    disconnectedCallback() {
        const container = this.template.querySelector('.ipt-container');
        if (container) container.removeEventListener('scroll', this._onScroll);
        document.removeEventListener('click', this._handleDocClick);
        this._scrollAttached = false;
    }

    // ── Panel + chip event handlers ────────────────────────────────────────
    // Expose `_filterPanelOpen` and `_appliedFilters` as plain getters so the
    // template can bind to them without leading-underscore warnings.
    get filterPanelOpen() { return this._filterPanelOpen; }
    get appliedFilters()  { return this._appliedFilters; }
    get shellClass() {
        return `ipt-shell${this._filterPanelOpen ? ' ipt-shell_panel-open' : ''}`;
    }

    handleFilterPanelClose() {
        // X icon in the inline drawer header. The drawer remains in the DOM
        // until we flip `_filterPanelOpen` — same template guard the open()
        // API call uses. Dispatches `panelchange` so the page's funnel
        // button can drop its brand variant.
        this._setPanelOpen(false);
    }

    handleFilterPanelApply(event) {
        // Immediate-apply: the drawer fires this on every checkbox change
        // and on Clear / Reset. The drawer stays open; we just refresh the
        // filtered data, reset pagination, and clear the selection.
        this._appliedFilters = event.detail?.filters ?? emptyFilters();
        this._pageCount = 0;
        this.selectedIds = new Set();
        const container = this.template.querySelector('.ipt-container');
        if (container) container.scrollTop = 0;
        this._fireFilterChange();
    }

    handleChipRemove(event) {
        const id = event.currentTarget.dataset.facet;
        if (!id) return;
        this._appliedFilters = { ...this._appliedFilters, [id]: [] };
        this._pageCount = 0;
        this.selectedIds = new Set();
        this._fireFilterChange();
    }

    handleClearAllChips() {
        this._appliedFilters = emptyFilters();
        this._pageCount = 0;
        this.selectedIds = new Set();
        this._fireFilterChange();
    }

    _fireFilterChange() {
        this.dispatchEvent(new CustomEvent('filterchange', {
            detail: { chips: this.filterChips },
        }));
    }

    _onScroll = () => {
        if (this._isLoading) return;
        const container = this.template.querySelector('.ipt-container');
        if (!container) return;
        const { scrollTop, scrollHeight, clientHeight } = container;
        if (scrollHeight - scrollTop - clientHeight > SCROLL_THRESHOLD_PX) return;
        this._isLoading = true;
        requestAnimationFrame(() => {
            this._pageCount = this._pageCount + 1;
            this._isLoading = false;
        });
    };
}
