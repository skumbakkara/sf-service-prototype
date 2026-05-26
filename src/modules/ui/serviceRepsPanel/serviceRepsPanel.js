import { LightningElement, api, track } from 'lwc';

const STATUS_ICON = {
    online:  'utility:record',
    break:   'utility:record',
    offline: 'utility:record',
};

const CHANNEL_LABELS = { chat: 'Chat', call: 'Call', cases: 'Case', email: 'Email', messaging: 'Message' };
const CHANNEL_ICONS  = { chat: 'utility:chat', call: 'utility:call', cases: 'utility:case', email: 'utility:email', messaging: 'utility:chat' };
const CHANNEL_BG_CLASS = {
    cases:     'wi-ch-icon wi-ch-icon_cases',
    call:      'wi-ch-icon wi-ch-icon_call',
    chat:      'wi-ch-icon wi-ch-icon_chat',
    email:     'wi-ch-icon wi-ch-icon_email',
    messaging: 'wi-ch-icon wi-ch-icon_messaging',
};

const WORK_SUMMARY_BUCKETS = [
    { key: 'cases',   match: ['cases'],            singular: 'Case',    plural: 'Cases' },
    { key: 'message', match: ['chat', 'messaging'], singular: 'Message', plural: 'Messages' },
    { key: 'call',    match: ['call'],             singular: 'Call',    plural: 'Calls' },
    { key: 'email',   match: ['email'],            singular: 'Email',   plural: 'Emails' },
];

function summarizeWorkItems(children) {
    if (!Array.isArray(children) || children.length === 0) return '0 Cases';
    const counts = Object.fromEntries(WORK_SUMMARY_BUCKETS.map(b => [b.key, 0]));
    for (const wi of children) {
        const bucket = WORK_SUMMARY_BUCKETS.find(b => b.match.includes(wi.channel))
            ?? WORK_SUMMARY_BUCKETS[0];
        counts[bucket.key] += 1;
    }
    const parts = [];
    for (const b of WORK_SUMMARY_BUCKETS) {
        const n = counts[b.key];
        if (n > 0) parts.push(`${n} ${n === 1 ? b.singular : b.plural}`);
    }
    return parts.join(' ');
}

const COLUMN_DEFS = [
    { label: 'Service Rep Name', fieldName: 'name',             sortable: true,  width: 200 },
    { label: 'Status',           fieldName: 'statusLabel',      sortable: true,  width: 130 },
    { label: 'Channels',         fieldName: 'channelsDisplay',  sortable: false, width: 100 },
    { label: 'Work Summary',     fieldName: 'workSummary',      sortable: true,  width: 200 },
    { label: 'Flag',             fieldName: 'flagLabel',        sortable: false, width: 80  },
    { label: 'Login',            fieldName: 'login',            sortable: true,  width: 90  },
    { label: 'State',            fieldName: 'state',            sortable: true,  width: 90  },
    { label: 'Capacity',         fieldName: 'capacityP',        sortable: true,  width: 150 },
    { label: 'Accept',           fieldName: 'accept',           sortable: true,  width: 90  },
    { label: 'Workload',         fieldName: 'workload',         sortable: true,  width: 100 },
    { label: 'ACW',              fieldName: 'acw',              sortable: true,  width: 90  },
    { label: 'Queues',           fieldName: 'queuesDisplay',    sortable: false, width: 180 },
    { label: 'Skills',           fieldName: 'skillsDisplay',    sortable: false, width: 200 },
];

const SCROLL_THRESHOLD_PX = 120;

export default class ServiceRepsPanel extends LightningElement {
    _data = [];
    _pageCount = 0;
    _isLoading = false;
    _scrollAttached = false;

    @track sortedBy;
    @track sortedDirection = 'asc';
    @track selectedIds = new Set();
    @track _selectedRep = null;
    @track _isPanelOpen = false;

    @api
    get data() { return this._data; }
    set data(value) {
        this._data = Array.isArray(value) ? value : [];
        this._pageCount = 0;
        this._isLoading = false;
        this.selectedIds = new Set();
        this._selectedRep = null;
        this._isPanelOpen = false;
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
        const rows = (this.expandedData ?? []).map((rep) => {
            const workItems = (rep.children ?? []).map((wi, wiIdx) => ({
                id: `${rep.id}-wi-${wiIdx}`,
                channel: wi.channel,
                customer: wi.customer,
                descriptionLink: `${wi.subject} | ${wi.status ?? 'Working'} | ${wi.caseNumber}${wi.priority ? ' | ' + wi.priority : ''}`,
                workLoadLabel: 'Work load: ',
                workLoadValue: `${wi.workLoad ?? 0}/20`,
                queueLabel: 'Queue: ',
                queueValue: wi.queue,
                channelIcon: CHANNEL_ICONS[wi.channel] ?? 'utility:record',
                channelLabel: CHANNEL_LABELS[wi.channel] ?? wi.channel,
                channelIconClass: CHANNEL_BG_CLASS[wi.channel] ?? 'wi-ch-icon wi-ch-icon_cases',
                hasFlag: wi.hasFlag,
                flagWhisperBody: wi.flagWhisperBody || 'Help needed with this work item.',
            }));
            return {
                id: String(rep.id),
                name: rep.name,
                statusLabel: rep.statusLabel,
                statusTime: rep.statusTime,
                statusIcon: STATUS_ICON[rep.status] ?? 'utility:record',
                statusCellClass: `status-cell status-cell_${rep.status}`,
                hasFlagIcon: rep.hasFlag,
                workSummary: summarizeWorkItems(rep.children ?? []),
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
                isSelected: this.selectedIds.has(String(rep.id)),
                isActive: this._selectedRep && this._selectedRep.id === String(rep.id),
                repRowClass: `slds-hint-parent rep-row${this._selectedRep && this._selectedRep.id === String(rep.id) ? ' rep-row_active' : ''}`,
                workItems,
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

    get layoutClass() {
        return `srp-layout${this._isPanelOpen ? ' srp-layout_panel-open' : ''}`;
    }

    get panelClass() {
        return 'srp-side-panel';
    }

    get selectedRepWorkItems() {
        return this._selectedRep?.workItems ?? [];
    }

    get selectedRepName() {
        return this._selectedRep?.name ?? '';
    }

    get selectedRepStatusLabel() {
        return this._selectedRep?.statusLabel ?? '';
    }

    get selectedRepStatusCellClass() {
        return this._selectedRep?.statusCellClass ?? 'status-cell';
    }

    get selectedRepStatusIcon() {
        return this._selectedRep?.statusIcon ?? 'utility:record';
    }

    get selectedRepChannelIcons() {
        return this._selectedRep?.channelIcons ?? [];
    }

    get selectedRepCapacityPLabel() {
        return this._selectedRep?.capacityPLabel ?? '';
    }

    get selectedRepCapacityILabel() {
        return this._selectedRep?.capacityILabel ?? '';
    }

    get selectedRepQueues() {
        return this._selectedRep?.queuesDisplay ?? '';
    }

    get selectedRepSkills() {
        return this._selectedRep?.skillsDisplay ?? '';
    }

    get hasSelectedRepWorkItems() {
        return (this._selectedRep?.workItems ?? []).length > 0;
    }

    get selectedRepSummaryLine() {
        const items = this._selectedRep?.workItems ?? [];
        if (items.length === 0) return '';
        const counts = {};
        for (const wi of items) {
            const label = CHANNEL_LABELS[wi.channel] ?? wi.channel ?? 'Item';
            counts[label] = (counts[label] ?? 0) + 1;
        }
        return Object.entries(counts)
            .map(([label, n]) => `${n} ${label}${n > 1 ? 's' : ''}`)
            .join(' • ');
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

    handleRowClick(event) {
        // Ignore clicks on the checkbox cell
        if (event.target.type === 'checkbox') return;
        const id = event.currentTarget.dataset.id;
        if (!id) return;

        const row = this.tableRows.find(r => r.id === id);
        if (!row) return;

        if (this._selectedRep && this._selectedRep.id === id) {
            // Second click on the same row closes the panel
            this._selectedRep = null;
            this._isPanelOpen = false;
        } else {
            this._selectedRep = row;
            this._isPanelOpen = true;
        }
    }

    handlePanelClose() {
        this._selectedRep = null;
        this._isPanelOpen = false;
    }

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
