import { LightningElement, track } from 'lwc';
import { navigate } from '../../../router';

const CHANNEL_ICONS = { chat: 'utility:chat', call: 'utility:call', cases: 'utility:case' };

const WORK_ITEMS = [
    { id: 'wi-a', customer: 'Sarah Mitchell',  subject: 'Billing dispute on recent invoice',        status: 'Working', caseNumber: '100847321', priority: 'Medium', queue: 'Billing', channel: 'cases', flagCount: 0 },
    { id: 'wi-b', customer: 'James Okafor',    subject: 'Unable to access account after reset',     status: 'Pending', caseNumber: '100912456', priority: 'High',   queue: 'Billing', channel: 'cases', flagCount: 2 },
    { id: 'wi-c', customer: 'Priya Nair',      subject: 'Refund request for duplicate transaction', status: 'Working', caseNumber: '100863017', priority: 'Medium', queue: 'Billing', channel: 'chat',  flagCount: 0 },
    { id: 'wi-d', customer: 'Carlos Reyes',    subject: 'Card declined at checkout',                status: 'Active',  caseNumber: '100779834', priority: 'Low',    queue: 'Chat',    channel: 'call',  flagCount: 1 },
];

const REPS_DATA = [
    { id: 1,  name: 'Gilda Ann Thomas',  status: 'online',  statusLabel: 'All Online', statusTime: 'Since 9:15am', hasFlag: true,  workSummary: '3 Cases 1 Message', channels: ['chat','call','cases'], login: '2m 5s',   state: '5m 3s',   capacityP: 100, capacityI: 100, accept: '3m 5s',   workload: '0/20', acw: '2m 4s',   queues: ['Billing','Chat','+3'], skills: ['Billing','Chat','+3'], children: WORK_ITEMS },
    { id: 2,  name: 'Jerome Bell',       status: 'break',   statusLabel: 'On Break',   statusTime: 'Since 9:15am', hasFlag: false, workSummary: '2 Cases',           channels: ['call','cases'],       login: '10m 20s', state: '10m 20s', capacityP: 20,  capacityI: 35,  accept: '44m',     workload: '0/20', acw: '5m 34s',  queues: ['Billing','Chat','+3'], skills: ['Billing','Chat','+3'], children: WORK_ITEMS.slice(0, 2) },
    { id: 3,  name: 'Devon Lane',        status: 'online',  statusLabel: 'All Online', statusTime: 'Since 9:15am', hasFlag: true,  workSummary: '3 Cases 1 Message', channels: ['chat','call','cases'], login: '2m 5s',   state: '5m 3s',   capacityP: 100, capacityI: 100, accept: '3m 5s',   workload: '0/20', acw: '2m 4s',   queues: ['Billing','Chat','+3'], skills: ['Billing','Chat','+3'], children: WORK_ITEMS },
    { id: 4,  name: 'Arlene McCoy',      status: 'online',  statusLabel: 'All Online', statusTime: 'Since 9:15am', hasFlag: false, workSummary: '1 Case',            channels: ['call','cases'],       login: '8m 12s',  state: '14m 45s', capacityP: 100, capacityI: 40,  accept: '14m 45s', workload: '0/20', acw: '44m',     queues: ['Billing','Chat','+3'], skills: ['Billing','Chat','+3'], children: WORK_ITEMS.slice(0, 1) },
    { id: 5,  name: 'Floyd Miles',       status: 'online',  statusLabel: 'All Online', statusTime: 'Since 9:15am', hasFlag: true,  workSummary: '3 Cases 1 Message', channels: ['chat','call','cases'], login: '2m 5s',   state: '5m 3s',   capacityP: 100, capacityI: 100, accept: '3m 5s',   workload: '0/20', acw: '2m 4s',   queues: ['Billing','Chat','+3'], skills: ['Billing','Chat','+3'], children: WORK_ITEMS },
    { id: 6,  name: 'Savannah Nguyen',   status: 'online',  statusLabel: 'All Online', statusTime: 'Since 9:15am', hasFlag: false, workSummary: '4 Cases',           channels: ['cases'],              login: '10m 20s', state: '1h 26m',  capacityP: 50,  capacityI: 100, accept: '5m 34s',  workload: '0/20', acw: '1h 26m',  queues: ['Billing','Chat','+3'], skills: ['Billing','Chat','+3'], children: WORK_ITEMS },
    { id: 7,  name: 'Leslie Alexander',  status: 'break',   statusLabel: 'On Break',   statusTime: 'Since 9:15am', hasFlag: false, workSummary: '2 Messages',        channels: ['chat'],               login: '44m',     state: '8m 12s',  capacityP: 30,  capacityI: 50,  accept: '1h 26m',  workload: '0/20', acw: '10m 20s', queues: ['Billing','Chat','+3'], skills: ['Billing','Chat','+3'], children: WORK_ITEMS.slice(0, 2) },
    { id: 8,  name: 'Robert Fox',        status: 'online',  statusLabel: 'All Online', statusTime: 'Since 9:15am', hasFlag: false, workSummary: '3 Cases 1 Message', channels: ['chat','call','cases'], login: '5m 34s',  state: '10m 20s', capacityP: 50,  capacityI: 20,  accept: '7m 25s',  workload: '0/20', acw: '10m 20s', queues: ['Billing','Chat','+3'], skills: ['Billing','Chat','+3'], children: WORK_ITEMS },
    { id: 9,  name: 'Theresa Webb',      status: 'offline', statusLabel: 'Offline',    statusTime: 'Since 9:15am', hasFlag: false, workSummary: '1 Message',         channels: ['chat','call'],        login: '9m 02s',  state: '9m 02s',  capacityP: 30,  capacityI: 80,  accept: '14m 45s', workload: '0/20', acw: '5m 34s',  queues: ['Billing','Chat','+3'], skills: ['Billing','Chat','+3'], children: WORK_ITEMS.slice(0, 1) },
    { id: 10, name: 'Marvin McKinney',   status: 'online',  statusLabel: 'All Online', statusTime: 'Since 9:15am', hasFlag: false, workSummary: '1 Call',            channels: ['call','cases'],       login: '1h 26m',  state: '5m 34s',  capacityP: 40,  capacityI: 50,  accept: '7m 25s',  workload: '0/20', acw: '44m',     queues: ['Billing','Chat','+3'], skills: ['Billing','Chat','+3'], children: WORK_ITEMS.slice(0, 1) },
    { id: 11, name: 'Kylie Jenner',      status: 'online',  statusLabel: 'All Online', statusTime: 'Since 9:15am', hasFlag: false, workSummary: '1 Call',            channels: ['call','cases'],       login: '1h 26m',  state: '5m 34s',  capacityP: 40,  capacityI: 50,  accept: '7m 25s',  workload: '0/20', acw: '44m',     queues: ['Billing','Chat','+3'], skills: ['Billing','Chat','+3'], children: WORK_ITEMS.slice(0, 1) },
    { id: 12, name: 'Tom Hanks',         status: 'online',  statusLabel: 'All Online', statusTime: 'Since 9:15am', hasFlag: false, workSummary: '1 Call',            channels: ['call','cases'],       login: '1h 26m',  state: '5m 34s',  capacityP: 40,  capacityI: 50,  accept: '7m 25s',  workload: '0/20', acw: '44m',     queues: ['Billing','Chat','+3'], skills: ['Billing','Chat','+3'], children: WORK_ITEMS.slice(0, 1) },
];

export default class ServiceRepsInlineDrawer extends LightningElement {
    reps = REPS_DATA;
    activeTab = 'service-reps';
    @track openTabs = [];
    @track activeTabId = null;

    get drawerOpen() {
        return this.openTabs.length > 0;
    }

    get openRepIds() {
        return this.openTabs.map(t => t.id);
    }

    get tableAreaClass() {
        return this.drawerOpen ? 'table-area table-area_compressed' : 'table-area';
    }

    handleRowClick(event) {
        const repId = event.detail.repId;
        const isOpen = this.openTabs.some(t => t.id === repId);

        if (isOpen) {
            this.openTabs = this.openTabs.filter(t => t.id !== repId);
            if (this.activeTabId === repId) {
                this.activeTabId = this.openTabs.length > 0 ? this.openTabs[this.openTabs.length - 1].id : null;
            }
        } else {
            const rep = REPS_DATA.find(r => String(r.id) === repId);
            if (!rep) return;
            const workItems = (rep.children ?? []).map((wi, idx) => ({
                id:          `${repId}-wi-${idx}`,
                customer:    wi.customer,
                subject:     wi.subject,
                status:      wi.status,
                caseNumber:  wi.caseNumber,
                priority:    wi.priority,
                queue:       wi.queue,
                flagCount:   wi.flagCount,
                channelIcon: CHANNEL_ICONS[wi.channel] ?? 'utility:record',
            }));
            this.openTabs = [...this.openTabs, { id: repId, name: rep.name, workItems }];
            this.activeTabId = repId;
        }
    }

    handleTabSelect(event) {
        this.activeTabId = event.detail.repId;
    }

    handleTabClose(event) {
        const repId = event.detail.repId;
        this.openTabs = this.openTabs.filter(t => t.id !== repId);
        if (this.activeTabId === repId) {
            this.activeTabId = this.openTabs.length > 0 ? this.openTabs[this.openTabs.length - 1].id : null;
        }
    }

    handleTabChange(event) {
        this.activeTab = event.target.value;
    }

    handleAccordionToggle() {
        navigate('/');
    }
}
