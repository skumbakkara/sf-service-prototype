import { LightningElement, api, track } from 'lwc';

const CHANNEL_ICONS  = { chat: 'utility:chat', call: 'utility:call', cases: 'utility:case', email: 'utility:email', messaging: 'utility:sms' };
const CHANNEL_LABELS = { chat: 'Chat', call: 'Call', cases: 'Case', email: 'Email', messaging: 'Message' };

// Sentiment config: emoji icon + color class per level. Five raw sentiment
// values collapse to three buckets: good / average / bad. Mirrors the
// inProgressTable component, with `bkt-` scope class names.
const SENTIMENT_CONFIG = {
    excellent: { icon: 'utility:emoji_good',    label: 'Good',    cssClass: 'bkt-sentiment_good'    },
    good:      { icon: 'utility:emoji_good',    label: 'Good',    cssClass: 'bkt-sentiment_good'    },
    neutral:   { icon: 'utility:emoji_average', label: 'Average', cssClass: 'bkt-sentiment_average' },
    bad:       { icon: 'utility:emoji_bad',     label: 'Bad',     cssClass: 'bkt-sentiment_bad'     },
    terrible:  { icon: 'utility:emoji_bad',     label: 'Bad',     cssClass: 'bkt-sentiment_bad'     },
};

// Column definitions for the Backlog table — ordered left-to-right after the
// leading checkbox column. Widths pinned to the Figma spec; table-layout:
// fixed in CSS holds them strictly so the sort-chevron hover state never
// resizes a column.
const COLUMN_DEFS = [
    { label: 'Priority',             fieldName: 'priorityRank',    sortable: true,  width: 100 },
    { label: 'Customer Name',        fieldName: 'customerName',    sortable: true,  width: 170 },
    { label: 'Conversation Summary', fieldName: 'summarySortKey',  sortable: true,  width: 530 },
    { label: 'Route By',             fieldName: 'routeByDisplay',  sortable: true,  width: 150 },
    { label: 'Channels',             fieldName: 'channelLabel',    sortable: true,  width: 120 },
    { label: 'User Sentiment',       fieldName: 'sentiment',       sortable: true,  width: 150 },
    { label: 'Work Size',            fieldName: 'workSize',        sortable: true,  width: 120 },
    { label: 'INTR',                 fieldName: 'isInterruptible', sortable: true,  width: 80  },
    { label: 'Wait Time',            fieldName: 'waitTime',        sortable: true,  width: 120 },
    { label: 'Requested Time',       fieldName: 'requestedTime',   sortable: true,  width: 200 },
    { label: 'Accept By',            fieldName: 'acceptBy',        sortable: true,  width: 120 },
];

// Infinite-scroll bottom threshold in pixels — appends another page of
// cloned rows once the user scrolls within this distance of the bottom of
// the scroll container.
const SCROLL_THRESHOLD_PX = 120;

export default class BacklogTable extends LightningElement {
    _data = [];
    _pageCount = 0;
    _isLoading = false;
    _scrollAttached = false;

    @track _newRowId = null;

    @track sortedBy;
    @track sortedDirection = 'asc';
    @track selectedIds = new Set();

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

    @api
    get data() { return this._data; }
    set data(value) {
        this._data = Array.isArray(value) ? value : [];
        // Restart at page 1 of the new source on every parent update.
        // Clearing selection avoids stale IDs referencing removed items.
        this._pageCount = 0;
        this._isLoading = false;
        this.selectedIds = new Set();
        // Scroll to top so users see the new filter result from the start.
        // Guarded — first set() runs before the DOM exists.
        const container = this.template
            ? this.template.querySelector('.bkt-container')
            : null;
        if (container) container.scrollTop = 0;
    }

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
            // Use a component-scoped sortable class instead of SLDS's
            // .slds-is-sortable so we don't override an SLDS class.
            thClass: col.sortable ? 'bkt-sortable' : '',
        }));
    }

    get allSelected() {
        const total = this.expandedData.length;
        return total > 0 && this.selectedIds.size === total;
    }

    get tableRows() {
        const rows = (this.expandedData ?? []).map((item) => {
            const sentimentKey = String(item.sentiment ?? 'neutral').toLowerCase();
            const sentimentCfg = SENTIMENT_CONFIG[sentimentKey] ?? SENTIMENT_CONFIG.neutral;
            const channelLabel = CHANNEL_LABELS[item.channel] ?? (item.channel ?? '');
            const channelIcon  = CHANNEL_ICONS[item.channel]  ?? 'utility:record';

            // Route By cell has three visual variants driven by routeKind:
            //   'queue' → forward arrow icon + blue link
            //   'skill' → skill icon         + blue link
            //   'human' → avatar             + plain text (uses `routeDisplay`)
            const routeKind = item.routeKind || (item.isAgent ? 'queue' : 'human');
            const isHumanRoute = routeKind === 'human';
            const routeIconName = routeKind === 'skill' ? 'utility:skill' : 'utility:work_queue';
            const routeByDisplay = item.routeDisplay
                ?? (isHumanRoute ? (item.assignedTo ?? '') : (item.routeBy ?? ''));
            const routeByInitials = (item.assignedTo || '')
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map(w => w[0])
                .join('')
                .toUpperCase();

            // Conversation summary cell renders as one composed string of:
            //   subject | status | <priority> Priority
            // — empty parts are dropped so items without a priority collapse to
            // "Subject | Working", and items without a status to just "Subject".
            const summaryParts = [];
            if (item.subject)  summaryParts.push(item.subject);
            if (item.status)   summaryParts.push(item.status);
            if (item.priority) summaryParts.push(`${item.priority} Priority`);
            const summaryDisplay = summaryParts.join(' | ');

            const rowId = String(item.id);
            const isNew = rowId === this._newRowId;
            return {
                id: rowId,
                rowClass: `slds-hint-parent bkt-row${isNew ? ' bkt-row--new' : ''}`,

                // Priority
                priorityRank: Number.isFinite(item.priorityRank) ? item.priorityRank : 3,

                // Customer name
                customerName: item.customerName ?? '',

                // Conversation summary (subject + status + priority composed)
                subject: item.subject ?? '',
                summaryDisplay,
                // Sort by subject for the summary column
                summarySortKey: (item.subject ?? '').toString().toLowerCase(),

                // Route By
                isHumanRoute,
                routeIconName,
                routeByDisplay,
                routeByAvatarUrl: item.avatarUrl || null,
                routeByInitials,

                // Channels
                channelIcon,
                channelLabel,

                // Sentiment
                sentimentIcon: sentimentCfg.icon,
                sentimentLabel: sentimentCfg.label,
                sentimentClass: sentimentCfg.cssClass,
                sentiment: sentimentKey,

                // Misc
                workSize: item.workSize,
                isInterruptible: !!item.isInterruptible,
                waitTime: item.waitTime ?? '',
                requestedTime: item.requestedTime ?? '',
                acceptBy: item.acceptBy ?? '',

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

    // ── Infinite scroll ─────────────────────────────────────────────────────
    renderedCallback() {
        if (this._scrollAttached) return;
        const container = this.template.querySelector('.bkt-container');
        if (!container) return;
        container.addEventListener('scroll', this._onScroll);
        this._scrollAttached = true;
    }

    disconnectedCallback() {
        const container = this.template.querySelector('.bkt-container');
        if (container) container.removeEventListener('scroll', this._onScroll);
        this._scrollAttached = false;
    }

    _onScroll = () => {
        if (this._isLoading) return;
        const container = this.template.querySelector('.bkt-container');
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
