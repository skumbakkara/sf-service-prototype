import { LightningElement, api, track } from 'lwc';

const FLAG_WHISPER_TITLE_DEFAULT = 'Latest Whisper from Rep';
const FLAG_WHISPER_BODY_DEFAULT  = 'Help needed with this case';

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

const STATUS_ICON = {
    'available-all':  'utility:record',
    'available-call': 'utility:record',
    'available-case': 'utility:record',
    break:            'utility:record',
    offline:          'utility:record',
};

const STATUS_LABEL = {
    'available-all':  'Available for All',
    'available-call': 'Available for Call',
    'available-case': 'Available for Case',
    break:            'On Break',
    offline:          'Offline',
};

const CHANNEL_LABELS = { chat: 'Chat', call: 'Call', cases: 'Case', email: 'Email', messaging: 'Message' };
const CHANNEL_ICONS  = { chat: 'utility:chat', call: 'utility:call', cases: 'utility:case', email: 'utility:email', messaging: 'utility:chat' };

// Maps each work-item channel to its `Work Summary` bucket. Only three work
// item types surface: `chat`/`messaging` roll up to "Message(s)"; `email` is
// logged as a case so it rolls up to "Case(s)" alongside `cases`; `call` is
// its own type. `cases` is also the catch-all so unknown channels still
// produce a sensible count rather than silently disappearing.
const WORK_SUMMARY_BUCKETS = [
    { key: 'cases',   match: ['cases', 'email'],     singular: 'Case',    plural: 'Cases' },
    { key: 'message', match: ['chat', 'messaging'], singular: 'Message', plural: 'Messages' },
    { key: 'call',    match: ['call'],              singular: 'Call',    plural: 'Calls' },
];

function summarizeWorkItems(children) {
    if (!Array.isArray(children) || children.length === 0) return '0 Cases';
    const counts = Object.fromEntries(WORK_SUMMARY_BUCKETS.map(b => [b.key, 0]));
    for (const wi of children) {
        const bucket = WORK_SUMMARY_BUCKETS.find(b => b.match.includes(wi.channel))
            ?? WORK_SUMMARY_BUCKETS[0]; // fall back to "Case" for unknown channels
        counts[bucket.key] += 1;
    }
    const parts = [];
    for (const b of WORK_SUMMARY_BUCKETS) {
        const n = counts[b.key];
        if (n > 0) parts.push(`${n} ${n === 1 ? b.singular : b.plural}`);
    }
    return parts.join(' ');
}

// Widths sized to actual cell content. Icon-only columns floor at 80px; text
// columns fit the header label without truncation (chevron-on-hover is
// display:none + table-layout:fixed). Queues/Skills get extra room for typical
// "first1, first2, +N" strings; Service Rep Name accommodates the chevron and
// names like "Savannah Nguyen".
const COLUMN_DEFS = [
    { label: 'Service Rep Name', fieldName: 'name',             sortable: true,  width: 200 },
    { label: 'Status',           fieldName: 'statusLabel',      sortable: true,  width: 180 },
    { label: 'Work Summary',     fieldName: 'workSummary',      sortable: true,  width: 200 },
    { label: 'Flag',             fieldName: 'flagLabel',        sortable: false, width: 80  },
    { label: 'Login',            fieldName: 'login',            sortable: true,  width: 90  },
    { label: 'State',            fieldName: 'state',            sortable: true,  width: 90  },
    { label: 'Capacity',         fieldName: 'capacityP',        sortable: true,  width: 150 },
    { label: 'Channels',         fieldName: 'channelsDisplay',  sortable: false, width: 100 },
    { label: 'Accept',           fieldName: 'accept',           sortable: true,  width: 90  },
    { label: 'Workload',         fieldName: 'workload',         sortable: true,  width: 100 },
    { label: 'ACW',              fieldName: 'acw',              sortable: true,  width: 90  },
    { label: 'Queues',           fieldName: 'queuesDisplay',    sortable: false, width: 180 },
    { label: 'Skills',           fieldName: 'skillsDisplay',    sortable: false, width: 200 },
];

// Infinite-scroll bottom threshold in pixels — when the user scrolls within
// this distance of the bottom of the scroll container, another page of clones
// is appended.
const SCROLL_THRESHOLD_PX = 120;

// Cap how many work-item cards an expanded rep can show in the accordion.
// Keeps the panel short enough that the table body remains scrollable and
// the next rep stays in view. The Work Summary column count is derived
// from the *capped* list (see tableRows below) so the header label and the
// accordion always agree.
const MAX_WORK_ITEMS_PER_REP = 3;

export default class ServiceRepsTable extends LightningElement {
    _data = [];
    _pageCount = 0;        // # of extra cloned pages appended after the seed
    _isLoading = false;    // guard so a single scroll burst can't double-load
    _scrollAttached = false;

    @track sortedBy;
    @track sortedDirection = 'asc';
    @track expandedIds = new Set();
    @track closingIds = new Set();
    @track selectedIds = new Set();
    @track _openFlagWiId = null;
    @track _openPausedRepId = null;
    @track _openQsPopover = null; // { type: 'queue'|'skill', name, top, left }
    @track _statusMenu = null;   // { repId, top, left }

    @api
    get data() { return this._data; }
    set data(value) {
        this._data = Array.isArray(value) ? value : [];
        // A new source array means the user changed the underlying dataset
        // (e.g. a parent filter toggled). Reset pagination + transient state
        // so they start from page 1 of the new source.
        this._pageCount = 0;
        this._isLoading = false;
        this.expandedIds = new Set();
        this.closingIds = new Set();
        this.selectedIds = new Set();
        this._openPausedRepId = null;
    }

    // Seed array plus cloned pages, each clone has a unique `id` so selection
    // and expand/collapse state never collide between original rows and clones.
    get expandedData() {
        const seed = this._data ?? [];
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
        return COLUMN_DEFS.map(col => ({
            ...col,
            style: `width:${col.width}px;min-width:${col.width}px;`,
            thClass: col.sortable ? 'slds-is-sortable' : '',
        }));
    }

    get allSelected() {
        const total = this.expandedData.length;
        return total > 0 && this.selectedIds.size === total;
    }

    // Build one work-item card view-model (shared by active + paused lists).
    // Per Figma node 20248:28340: a single navy summary line
    // "<subject> | <caseNumber> | <customer>", then a meta row of
    // channel-icon · "N/20 Workload" · routing-icon + queue · (optional)
    // check-icon + "Interruptible".
    buildWorkItem(wi, wiId) {
        const isFlagOpen = wiId === this._openFlagWiId;
        // Show either the queue (work_queue icon) or the skill (skill icon)
        // facet in the meta row, per the item's `routeBy`.
        const bySkill = wi.routeBy === 'skill';
        const routeValue = bySkill ? (wi.skill ?? wi.queue) : wi.queue;
        return {
            id: wiId,
            staggerStyle: '',
            summaryText: `${wi.subject} | ${wi.caseNumber} | ${wi.customer}`,
            workLoadText: `${wi.workLoad ?? 0}/20 Workload`,
            routeValue,
            routeType: bySkill ? 'skill' : 'queue',
            routeIcon: bySkill ? 'utility:skill' : 'utility:work_queue',
            channelIcon: CHANNEL_ICONS[wi.channel] ?? 'utility:record',
            channelLabel: CHANNEL_LABELS[wi.channel] ?? wi.channel,
            isInterruptible: !!wi.isInterruptible,
            hasFlagIcon: wi.hasFlag,
            isFlagOpen,
            flagPopoverTitleId: `wi-flag-popover-title-${wiId}`,
            flagWhisperTitle: wi.flagWhisperTitle || FLAG_WHISPER_TITLE_DEFAULT,
            flagWhisperBody:  wi.flagWhisperBody  || FLAG_WHISPER_BODY_DEFAULT,
        };
    }

    get tableRows() {
        const rows = (this.expandedData ?? []).map((rep) => {
            const isExpanded = this.expandedIds.has(String(rep.id));
            // Flagged work-item cards are shown only when the row itself shows a
            // flag icon (rep.hasFlag). When the row is unflagged, drop any
            // flagged children so the cards never contradict the row indicator.
            const flagFilter = (wi) => rep.hasFlag || !wi.hasFlag;
            // Cap *active* children before both the accordion render and the
            // Work Summary count so the two stay in lockstep. Paused items are
            // shown in full (small set) and also counted.
            const visibleChildren = (rep.children ?? []).filter(flagFilter).slice(0, MAX_WORK_ITEMS_PER_REP);
            const visiblePaused = (rep.pausedChildren ?? []).filter(flagFilter);
            const workItems = visibleChildren.map((wi, wiIdx) => ({
                ...this.buildWorkItem(wi, `${rep.id}-wi-${wiIdx}`),
                staggerStyle: `--wi-index:${wiIdx};`,
            }));
            // Paused work items power the collapsible "Paused Work Items"
            // section below the active cards (same card shape, reused mapper).
            const pausedItems = visiblePaused.map((wi, wiIdx) =>
                this.buildWorkItem(wi, `${rep.id}-pwi-${wiIdx}`)
            );
            return {
                id: String(rep.id),
                name: rep.name,
                statusLabel: rep.statusLabel,
                statusTime: rep.statusTime,
                statusIcon: STATUS_ICON[rep.status] ?? 'utility:record',
                statusCellClass: `status-cell status-cell_${rep.status?.startsWith('available') ? 'online' : rep.status}`,
                hasFlagIcon: rep.hasFlag,
                // Computed from the cards actually rendered on expand — active
                // (capped) PLUS paused — so the column count always matches the
                // total number of work-item cards shown, paused included.
                workSummary: summarizeWorkItems([...visibleChildren, ...visiblePaused]),
                channelIcons: rep.channels.map(c => ({ icon: CHANNEL_ICONS[c] ?? 'utility:record', label: CHANNEL_LABELS[c] ?? c })),
                channelsDisplay: rep.channels.map(c => CHANNEL_LABELS[c] ?? c).join(' · '),
                login: rep.login,
                state: rep.state,
                capacityP: rep.capacityP,
                capacityI: rep.capacityI,
                capacityPLabel: `P: ${rep.capacityP}%`,
                capacityILabel: `I: ${rep.capacityI}%`,
                accept: rep.accept,
                workload: rep.workload,
                acw: rep.acw,
                queuesDisplay: rep.queues.join(', '),
                skillsDisplay: rep.skills.join(', '),
                // Individual hoverable items for Queues / Skills columns.
                // "+N" overflow tokens are not hoverable (name: null).
                queueItems: (rep.queues ?? [])
                    .filter(q => !q.startsWith('+'))
                    .map(q => ({ name: q, display: q, chipClass: 'srt-chip qs-trigger' }))
                    .concat(
                        (rep.queues ?? [])
                            .filter(q => q.startsWith('+'))
                            .map(q => ({ name: null, display: q, chipClass: 'srt-chip srt-chip--overflow' }))
                    ),
                skillItems: (rep.skills ?? [])
                    .filter(s => !s.startsWith('+'))
                    .map(s => ({ name: s, display: s, chipClass: 'srt-chip qs-trigger' }))
                    .concat(
                        (rep.skills ?? [])
                            .filter(s => s.startsWith('+'))
                            .map(s => ({ name: null, display: s, chipClass: 'srt-chip srt-chip--overflow' }))
                    ),
                hasChildren: workItems.length > 0,
                hasMoreChildren: (rep.children ?? []).filter(flagFilter).length > MAX_WORK_ITEMS_PER_REP,
                wiPanelId: `${String(rep.id)}-wi-panel`,
                isExpanded,
                wiPanelClass: `work-item-row work-item-row_wrap${isExpanded ? ' wi-panel_open' : this.closingIds.has(String(rep.id)) ? ' wi-panel_closing' : ' wi-panel_closed'}`,
                // Paused section: list + collapsed/expanded toggle state. The
                // chevron icon and the "show/hide" affordance are driven from
                // `isPausedOpen` (tracked per-rep via `_openPausedRepId`).
                pausedItems,
                hasPausedItems: pausedItems.length > 0,
                isPausedOpen: this._openPausedRepId === String(rep.id),
                pausedToggleIcon: this._openPausedRepId === String(rep.id)
                    ? 'utility:chevronup'
                    : 'utility:chevrondown',
                // Add `rep-row_expanded` while the accordion is open so the
                // parent row keeps the same neutral-base-95 fill as :hover —
                // gives a clear visual link between the row and its expanded
                // work-items panel.
                repRowClass: `slds-hint-parent rep-row${(isExpanded || this.closingIds.has(String(rep.id))) ? ' rep-row_expanded' : ''}`,
                chevronClass: `toggle-chevron${isExpanded ? ' toggle-chevron_open' : ''}`,
                workItems,
                isSelected: this.selectedIds.has(String(rep.id)),
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
        // Toggle: clicking the same chip again closes the popover
        if (this._openQsPopover?.name === name && this._openQsPopover?.type === type) {
            this._openQsPopover = null;
            return;
        }
        const rect = el.getBoundingClientRect();
        const wrap = this.template.querySelector('.table-scroll-wrap');
        const wrapRect = wrap ? wrap.getBoundingClientRect() : { top: 0, left: 0 };
        const POPOVER_H = 290; // estimated max popover height in px
        const GAP = 4;
        const spaceBelow = window.innerHeight - rect.bottom;
        const above = spaceBelow < POPOVER_H + GAP && rect.top > POPOVER_H + GAP;
        this._openQsPopover = {
            type,
            name,
            above,
            top:  above
                ? rect.top - wrapRect.top - POPOVER_H - GAP
                : rect.bottom - wrapRect.top + GAP,
            left: rect.left - wrapRect.left,
        };
    }

    // ── Status menu ─────────────────────────────────────────────────────────
    get statusMenuVisible() { return this._statusMenu !== null; }
    get statusMenuRepId()   { return this._statusMenu?.repId ?? ''; }
    get statusMenuStyle() {
        const m = this._statusMenu;
        if (!m) return '';
        return `top:${m.top}px;left:${m.left}px;`;
    }

    get statusMenuItems() {
        const repId = this._statusMenu?.repId;
        const rep = repId ? (this._data ?? []).find(r => String(r.id) === repId) : null;
        const current = rep?.status ?? '';
        return [
            { value: 'available-all',  label: 'Available for All',  dotClass: 'status-menu-dot status-menu-dot_online'  },
            { value: 'available-call', label: 'Available for Call', dotClass: 'status-menu-dot status-menu-dot_online'  },
            { value: 'available-case', label: 'Available for Case', dotClass: 'status-menu-dot status-menu-dot_online'  },
            { value: 'break',          label: 'On Break',           dotClass: 'status-menu-dot status-menu-dot_break'   },
            { value: 'offline',        label: 'Offline',            dotClass: 'status-menu-dot status-menu-dot_offline' },
        ].map(item => ({
            ...item,
            menuItemClass: `status-menu-item${item.value === current ? ' status-menu-item_active' : ''}`,
        }));
    }

    handleStatusClick(event) {
        event.stopPropagation();
        const td = event.currentTarget;
        const id = td.dataset.id;
        if (!id) return;
        // Toggle: clicking the same cell again closes the menu
        if (this._statusMenu?.repId === id) {
            this._statusMenu = null;
            return;
        }
        const rect = td.getBoundingClientRect();
        const wrap = this.template.querySelector('.table-scroll-wrap');
        const wrapRect = wrap ? wrap.getBoundingClientRect() : { top: 0, left: 0 };
        this._statusMenu = {
            repId: id,
            top:  rect.bottom - wrapRect.top + 4,
            left: rect.left   - wrapRect.left,
        };
    }

    handleStatusMenuSelect(event) {
        event.stopPropagation();
        const newStatus = event.currentTarget.dataset.value;
        const repId    = event.currentTarget.dataset.repId;
        if (!newStatus || !repId) return;
        this._data = (this._data ?? []).map(r =>
            String(r.id) === repId ? { ...r, status: newStatus, statusLabel: STATUS_LABEL[newStatus] ?? newStatus } : r
        );
        this._statusMenu = null;
    }

    handleSort(event) {
        const field = event.currentTarget.dataset.field;
        if (!field) return;
        const col = COLUMN_DEFS.find(c => c.fieldName === field);
        if (!col?.sortable) return;
        if (this.sortedBy === field) {
            this.sortedDirection = this.sortedDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortedBy = field;
            this.sortedDirection = 'asc';
        }
    }

    _collapseRow(id) {
        if (!id || !this.expandedIds.has(id)) return;
        const next = new Set(this.expandedIds);
        next.delete(id);
        this.expandedIds = next;
        // Kick off the close animation: mark as closing so CSS plays wi-panel-out
        const nextClosing = new Set(this.closingIds);
        nextClosing.add(id);
        this.closingIds = nextClosing;
    }

    _expandRow(id) {
        if (!id) return;
        // Clear any in-flight closing state for this row before expanding
        if (this.closingIds.has(id)) {
            const nextClosing = new Set(this.closingIds);
            nextClosing.delete(id);
            this.closingIds = nextClosing;
        }
        const next = new Set(this.expandedIds);
        next.add(id);
        this.expandedIds = next;
    }

    handleRowClick(event) {
        // Ignore clicks on the checkbox or the chevron toggle button itself
        if (event.target.type === 'checkbox') return;
        if (event.target.closest?.('.toggle-btn')) return;
        const id = event.currentTarget.dataset.id;
        if (!id) return;
        if (this.expandedIds.has(id)) {
            this._collapseRow(id);
        } else {
            this._expandRow(id);
        }
    }

    handleExpandToggle(event) {
        event.stopPropagation();
        const id = event.currentTarget.dataset.id;
        if (!id) return;
        if (this.expandedIds.has(id)) {
            this._collapseRow(id);
        } else {
            this._expandRow(id);
        }
    }

    // When the close animation ends, remove the closing marker so the panel
    // switches from wi-panel_closing → wi-panel_closed (display:none).
    handlePanelAnimationEnd(event) {
        const tr = event.currentTarget.parentElement;
        const id = tr?.dataset?.panelId;
        if (!id || !this.closingIds.has(id)) return;
        const next = new Set(this.closingIds);
        next.delete(id);
        this.closingIds = next;
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

    // Tooltip uses position: fixed so it escapes the .table-container's
    // overflow-x: auto clip and the .slds-card's overflow: hidden clip;
    // neither z-index nor padding can solve a clipping-ancestor problem.
    handleTooltipShow(event) {
        const badge = event.currentTarget;
        const text = badge?.dataset?.tooltip;
        const tip = this.template.querySelector('.cap-tooltip');
        if (!tip || !text) return;
        const rect = badge.getBoundingClientRect();
        tip.textContent = text;
        tip.style.left = `${rect.left + rect.width / 2}px`;
        tip.style.top = `${rect.top}px`;
        tip.classList.add('is-visible');
    }

    handleTooltipHide() {
        const tip = this.template.querySelector('.cap-tooltip');
        if (tip) tip.classList.remove('is-visible');
    }

    // ── Flag popover handlers ────────────────────────────────────────────────
    handleWiFlagToggle(event) {
        const id = event.currentTarget?.dataset?.id;
        if (!id) return;
        event.stopPropagation();
        this._openFlagWiId = this._openFlagWiId === id ? null : id;
    }

    handleWiLowerFlag(event) {
        const id = event.currentTarget?.dataset?.id;
        if (!id) return;
        this._openFlagWiId = null;
    }

    // Collapse/expand the per-rep "Paused Work Items" section. Single-open:
    // toggling one rep's paused list closes any other that was open.
    handlePausedToggle(event) {
        const id = event.currentTarget?.dataset?.id;
        if (!id) return;
        event.stopPropagation();
        this._openPausedRepId = this._openPausedRepId === id ? null : id;
    }

    _handleDocClick = () => {
        if (this._openFlagWiId !== null) this._openFlagWiId = null;
        if (this._openQsPopover !== null) this._openQsPopover = null;
        if (this._statusMenu !== null) this._statusMenu = null;
    };

    // ── Infinite scroll ─────────────────────────────────────────────────────
    // Bind the scroll handler once the .table-container is in the DOM. Guarded
    // by `_scrollAttached` because renderedCallback fires on every re-render.
    renderedCallback() {
        if (this._scrollAttached) return;
        const container = this.template.querySelector('.table-container');
        if (!container) return;
        container.addEventListener('scroll', this._onScroll);
        document.addEventListener('click', this._handleDocClick);
        this._scrollAttached = true;
    }

    disconnectedCallback() {
        const container = this.template.querySelector('.table-container');
        if (container) container.removeEventListener('scroll', this._onScroll);
        document.removeEventListener('click', this._handleDocClick);
        this._scrollAttached = false;
    }

    // Arrow fn so `this` is bound for add/removeEventListener. The rAF wrap
    // collapses a burst of scroll events into a single page append, and the
    // `_isLoading` flag prevents a second burst from queuing before the first
    // append's render commits (clientHeight changes on next paint).
    _onScroll = () => {
        if (this._isLoading) return;
        const container = this.template.querySelector('.table-container');
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
