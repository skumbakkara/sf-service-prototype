import { LightningElement, api, track } from 'lwc';

const CHANNEL_ICONS  = { chat: 'utility:chat', call: 'utility:call', cases: 'utility:case', email: 'utility:email', messaging: 'utility:sms' };
const CHANNEL_LABELS = { chat: 'Chat', call: 'Call', cases: 'Case', email: 'Email', messaging: 'Message' };

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

// Status config (per Figma): 16px utility icon + colored label
const STATUS_CONFIG = {
    Working: { label: 'Working', icon: 'utility:setup',     cssClass: 'ipt-status ipt-status_working' },
    Pending: { label: 'Pending', icon: 'utility:clock',     cssClass: 'ipt-status ipt-status_pending' },
    Active:  { label: 'Active',  icon: 'utility:check',     cssClass: 'ipt-status ipt-status_active'  },
    Waiting: { label: 'Waiting', icon: 'utility:hourglass', cssClass: 'ipt-status ipt-status_waiting' },
};

// Column order: Status pulled forward next to Details; Flag pulled forward next to Assigned To.
// Minimum column width is 150px; content-heavy columns get a wider allocation.
const COLUMN_DEFS = [
    { label: 'Channel',        fieldName: 'channelLabel',   sortable: false, width: 120  },
    { label: 'Details',        fieldName: 'subject',        sortable: true,  width: 360  },
    { label: 'Status',         fieldName: 'status',         sortable: true,  width: 150  },
    { label: 'Priority',       fieldName: 'priority',       sortable: true,  width: 150  },
    { label: 'Assigned To',    fieldName: 'assignedTo',     sortable: true,  width: 170  },
    { label: 'Flag',           fieldName: 'hasFlag',        sortable: false, width: 120  },
    { label: 'Route By',       fieldName: 'routeBy',        sortable: true,  width: 160  },
    { label: 'Action',         fieldName: 'action',         sortable: false, width: 150  },
    { label: 'User Sentiment', fieldName: 'sentiment',      sortable: true,  width: 150  },
    { label: 'Work Size',      fieldName: 'workSize',       sortable: true,  width: 150  },
    { label: 'INTR',           fieldName: 'isInterruptible',sortable: false, width: 150  },
    { label: 'Handle Time',    fieldName: 'handleTime',     sortable: true,  width: 150  },
    { label: 'Assigned Time',  fieldName: 'assignedTime',   sortable: true,  width: 150  },
    { label: 'Speed To Answer',fieldName: 'speedToAnswer',  sortable: true,  width: 150  },
    { label: 'Accepted Time',  fieldName: 'acceptedTime',   sortable: true,  width: 150  },
];

// Infinite-scroll bottom threshold in pixels — when the user scrolls within
// this distance of the bottom of the scroll container, another page of clones
// is appended.
const SCROLL_THRESHOLD_PX = 120;

export default class InProgressTable extends LightningElement {
    _data = [];
    _pageCount = 0;        // # of extra cloned pages appended after the seed
    _isLoading = false;
    _scrollAttached = false;

    @track sortedBy;
    @track sortedDirection = 'asc';
    @track selectedIds = new Set();

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

    get tableRows() {
        const rows = (this.expandedData ?? []).map((item) => {
            const sentimentKey = String(item.sentiment ?? 'neutral').toLowerCase();
            const sentimentCfg = SENTIMENT_CONFIG[sentimentKey] ?? SENTIMENT_CONFIG.neutral;
            const priorityCfg  = PRIORITY_CONFIG[item.priority] ?? null;
            const statusCfg    = STATUS_CONFIG[item.status]     ?? STATUS_CONFIG.Working;
            return {
                id: String(item.id),
                channelIcon: CHANNEL_ICONS[item.channel] ?? 'utility:record',
                channelLabel: CHANNEL_LABELS[item.channel] ?? item.channel,
                subject: item.subject,
                caseNumberDisplay: `#${item.caseNumber}`,
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
                routeByIcon: item.routeByIcon || null,
                hasFlag: item.hasFlag,
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
        const container = this.template.querySelector('.ipt-container');
        if (!container) return;
        container.addEventListener('scroll', this._onScroll);
        this._scrollAttached = true;
    }

    disconnectedCallback() {
        const container = this.template.querySelector('.ipt-container');
        if (container) container.removeEventListener('scroll', this._onScroll);
        this._scrollAttached = false;
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
