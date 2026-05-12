import { LightningElement, api, track } from 'lwc';

const STATUS_ICON = {
    online:  'utility:record',
    break:   'utility:record',
    offline: 'utility:record',
};

const CHANNEL_LABELS = { chat: 'Chat', call: 'Call', cases: 'Case' };
const CHANNEL_ICONS  = { chat: 'utility:chat', call: 'utility:call', cases: 'utility:case' };

// Minimum column width is 150px; Capacity is wider to fit the two badges + gap
// without overflow, and the Service Rep Name column holds the full agent name.
const COLUMN_DEFS = [
    { label: 'Service Rep Name', fieldName: 'name',             sortable: true,  width: 240 },
    { label: 'Status',           fieldName: 'statusLabel',      sortable: true,  width: 150 },
    { label: 'Flag',             fieldName: 'flagLabel',        sortable: false, width: 120 },
    { label: 'Work Summary',     fieldName: 'workSummary',      sortable: true,  width: 150 },
    { label: 'Channels',         fieldName: 'channelsDisplay',  sortable: false, width: 150 },
    { label: 'Login',            fieldName: 'login',            sortable: true,  width: 150 },
    { label: 'State',            fieldName: 'state',            sortable: true,  width: 150 },
    { label: 'Capacity',         fieldName: 'capacityP',        sortable: true,  width: 180 },
    { label: 'Accept',           fieldName: 'accept',           sortable: true,  width: 150 },
    { label: 'Workload',         fieldName: 'workload',         sortable: true,  width: 150 },
    { label: 'ACW',              fieldName: 'acw',              sortable: true,  width: 150 },
    { label: 'Queues',           fieldName: 'queuesDisplay',    sortable: false, width: 150 },
    { label: 'Skills',           fieldName: 'skillsDisplay',    sortable: false, width: 150 },
];

// Infinite-scroll bottom threshold in pixels — when the user scrolls within
// this distance of the bottom of the scroll container, another page of clones
// is appended.
const SCROLL_THRESHOLD_PX = 120;

export default class ServiceRepsTable extends LightningElement {
    _data = [];
    _pageCount = 0;        // # of extra cloned pages appended after the seed
    _isLoading = false;    // guard so a single scroll burst can't double-load
    _scrollAttached = false;

    @track sortedBy;
    @track sortedDirection = 'asc';
    @track expandedIds = new Set();
    @track selectedIds = new Set();

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
        this.selectedIds = new Set();
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

    get tableRows() {
        const rows = (this.expandedData ?? []).map((rep) => {
            const isExpanded = this.expandedIds.has(String(rep.id));
            const workItems = (rep.children ?? []).map((wi, wiIdx) => {
                const priorityKey = String(wi.priority ?? '').toLowerCase();
                return {
                    id: `${rep.id}-wi-${wiIdx}`,
                    customer: wi.customer,
                    subject: wi.subject,
                    caseNumberDisplay: `#${wi.caseNumber}`,
                    statusLabel: wi.status,
                    priorityLabel: wi.priority,
                    priorityClass: `wi-priority wi-priority_${priorityKey}`,
                    channelIcon: CHANNEL_ICONS[wi.channel] ?? 'utility:record',
                    channelLabel: CHANNEL_LABELS[wi.channel] ?? wi.channel,
                    queue: wi.queue,
                    hasFlagIcon: wi.hasFlag,
                };
            });
            return {
                id: String(rep.id),
                name: rep.name,
                statusLabel: rep.statusLabel,
                statusTime: rep.statusTime,
                statusIcon: STATUS_ICON[rep.status] ?? 'utility:record',
                statusCellClass: `status-cell status-cell_${rep.status}`,
                hasFlagIcon: rep.hasFlag,
                workSummary: rep.workSummary,
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
                hasChildren: workItems.length > 0,
                isExpanded,
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

    handleExpandToggle(event) {
        const id = event.currentTarget.dataset.id;
        const next = new Set(this.expandedIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        this.expandedIds = next;
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

    // ── Infinite scroll ─────────────────────────────────────────────────────
    // Bind the scroll handler once the .table-container is in the DOM. Guarded
    // by `_scrollAttached` because renderedCallback fires on every re-render.
    renderedCallback() {
        if (this._scrollAttached) return;
        const container = this.template.querySelector('.table-container');
        if (!container) return;
        container.addEventListener('scroll', this._onScroll);
        this._scrollAttached = true;
    }

    disconnectedCallback() {
        const container = this.template.querySelector('.table-container');
        if (container) container.removeEventListener('scroll', this._onScroll);
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
