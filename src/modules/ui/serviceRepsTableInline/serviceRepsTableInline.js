import { LightningElement, api, track } from 'lwc';

const STATUS_ICON = {
    online:  'utility:record',
    break:   'utility:record',
    offline: 'utility:record',
};

const CHANNEL_LABELS = { chat: 'Chat', call: 'Call', cases: 'Case' };
const CHANNEL_ICONS  = { chat: 'utility:chat', call: 'utility:call', cases: 'utility:case' };

const COLUMN_DEFS = [
    { label: 'Service Rep Name', fieldName: 'name',             sortable: true,  width: 168 },
    { label: 'Status',           fieldName: 'statusDisplay',    sortable: true,  width: 140 },
    { label: 'Flag',             fieldName: 'flagLabel',        sortable: false, width: 68  },
    { label: 'Work Summary',     fieldName: 'workSummary',      sortable: true,  width: 148 },
    { label: 'Channels',         fieldName: 'channelsDisplay',  sortable: false, width: 90  },
    { label: 'Login',            fieldName: 'login',            sortable: true,  width: 80  },
    { label: 'State',            fieldName: 'state',            sortable: true,  width: 80  },
    { label: 'Capacity',         fieldName: 'capacityDisplay',  sortable: true,  width: 128 },
    { label: 'Accept',           fieldName: 'accept',           sortable: true,  width: 80  },
    { label: 'Workload',         fieldName: 'workload',         sortable: true,  width: 80  },
    { label: 'ACW',              fieldName: 'acw',              sortable: true,  width: 80  },
    { label: 'Queues',           fieldName: 'queuesDisplay',    sortable: false, width: 120 },
    { label: 'Skills',           fieldName: 'skillsDisplay',    sortable: false, width: 120 },
];

function capacityClass(pct, isI, status) {
    if (isI && status === 'break') return pct >= 50 ? 'cap-warn-high' : 'cap-warn-low';
    if (pct >= 90) return 'cap-full';
    if (pct >= 50) return 'cap-high';
    if (pct >= 30) return 'cap-mid';
    return 'cap-low';
}

export default class ServiceRepsTableInline extends LightningElement {
    @api data = [];
    @api openRepIds = [];
    @track sortedBy;
    @track sortedDirection = 'asc';
    @track selectedIds = new Set();

    get columnHeaders() {
        return COLUMN_DEFS.map(col => ({
            ...col,
            style: `width:${col.width}px;min-width:${col.width}px;`,
            thClass: col.sortable ? 'slds-is-sortable' : '',
        }));
    }

    get allSelected() {
        return this.data.length > 0 && this.selectedIds.size === this.data.length;
    }

    get tableRows() {
        const openIds = Array.isArray(this.openRepIds) ? this.openRepIds.map(String) : [];
        const rows = (this.data ?? []).map((rep, index) => {
            const id = String(rep.id);
            const isOpen = openIds.includes(id);
            return {
                id,
                name: rep.name,
                statusDisplay: `${rep.statusLabel} · ${rep.statusTime}`,
                statusIcon: STATUS_ICON[rep.status] ?? 'utility:record',
                statusCellClass: `status-cell status-cell_${rep.status}`,
                hasFlagIcon: index % 2 === 0,
                workSummary: rep.workSummary,
                channelIcons: rep.channels.map(c => ({ icon: CHANNEL_ICONS[c] ?? 'utility:record', label: CHANNEL_LABELS[c] ?? c })),
                login: rep.login,
                state: rep.state,
                capacityDisplay: `P: ${rep.capacityP}%  I: ${rep.capacityI}%`,
                capacityCellClass: `capacity-cell ${capacityClass(rep.capacityP, false, rep.status)} ${capacityClass(rep.capacityI, true, rep.status)}-i`,
                accept: rep.accept,
                workload: rep.workload,
                acw: rep.acw,
                queuesDisplay: rep.queues.join(', '),
                skillsDisplay: rep.skills.join(', '),
                isSelected: this.selectedIds.has(id),
                rowClass: `slds-hint-parent rep-row${isOpen ? ' slds-is-selected' : ''}`,
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

    handleRowClick(event) {
        if (event.target.type === 'checkbox') return;
        const id = event.currentTarget.dataset.id;
        this.dispatchEvent(new CustomEvent('rowclick', { detail: { repId: id }, bubbles: true, composed: true }));
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
            this.selectedIds = new Set((this.data ?? []).map(r => String(r.id)));
        } else {
            this.selectedIds = new Set();
        }
    }

    handleRowSelect(event) {
        event.stopPropagation();
        const id = event.currentTarget.dataset.id;
        const next = new Set(this.selectedIds);
        if (event.target.checked) {
            next.add(id);
        } else {
            next.delete(id);
        }
        this.selectedIds = next;
    }
}
