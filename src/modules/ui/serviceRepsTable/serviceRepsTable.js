import { LightningElement, api, track } from 'lwc';

const STATUS_ICON = {
    online:  'utility:record',
    break:   'utility:record',
    offline: 'utility:record',
};

const CHANNEL_LABELS = { chat: 'Chat', call: 'Call', cases: 'Case' };
const CHANNEL_ICONS  = { chat: 'utility:chat', call: 'utility:call', cases: 'utility:case' };

const COLUMN_DEFS = [
    { label: 'Service Rep Name', fieldName: 'name',             sortable: true,  width: 240 },
    { label: 'Status',           fieldName: 'statusLabel',      sortable: true,  width: 140 },
    { label: 'Flag',             fieldName: 'flagLabel',        sortable: false, width: 68  },
    { label: 'Work Summary',     fieldName: 'workSummary',      sortable: true,  width: 148 },
    { label: 'Channels',         fieldName: 'channelsDisplay',  sortable: false, width: 90  },
    { label: 'Login',            fieldName: 'login',            sortable: true,  width: 80  },
    { label: 'State',            fieldName: 'state',            sortable: true,  width: 80  },
    { label: 'Capacity',         fieldName: 'capacityP',        sortable: true,  width: 128 },
    { label: 'Accept',           fieldName: 'accept',           sortable: true,  width: 80  },
    { label: 'Workload',         fieldName: 'workload',         sortable: true,  width: 80  },
    { label: 'ACW',              fieldName: 'acw',              sortable: true,  width: 80  },
    { label: 'Queues',           fieldName: 'queuesDisplay',    sortable: false, width: 120 },
    { label: 'Skills',           fieldName: 'skillsDisplay',    sortable: false, width: 120 },
];

export default class ServiceRepsTable extends LightningElement {
    @api data = [];
    @track sortedBy;
    @track sortedDirection = 'asc';
    @track expandedIds = new Set();
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
        const rows = (this.data ?? []).map((rep) => {
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
            this.selectedIds = new Set((this.data ?? []).map(r => String(r.id)));
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
}
