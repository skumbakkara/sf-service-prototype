import { LightningElement, track } from 'lwc';

const FILTER_GROUPS = [
    {
        value: 'Queues', label: 'Queues',
        options: [
            { id: 'q-billing',  label: 'Billing' },
            { id: 'q-account',  label: 'Account Management' },
            { id: 'q-renewals', label: 'Renewals' },
            { id: 'q-tech',     label: 'Tech Support' },
            { id: 'q-loyalty',  label: 'Loyalty' },
        ],
    },
    {
        value: 'Skills', label: 'Skills',
        options: [
            { id: 'sk-product',  label: 'Product Knowledge' },
            { id: 'sk-spanish',  label: 'Spanish' },
            { id: 'sk-billing',  label: 'Billing Specialist' },
            { id: 'sk-tech',     label: 'Technical Support' },
        ],
    },
    {
        value: 'ServiceReps', label: 'Service Reps',
        options: [
            { id: 'sr-alice',   label: 'Alice Johnson' },
            { id: 'sr-bob',     label: 'Bob Martinez' },
            { id: 'sr-carol',   label: 'Carol White' },
            { id: 'sr-david',   label: 'David Lee' },
            { id: 'sr-emma',    label: 'Emma Davis' },
        ],
    },
    {
        value: 'Teams', label: 'Teams',
        options: [
            { id: 'tm-west',    label: 'West Coast' },
            { id: 'tm-east',    label: 'East Coast' },
            { id: 'tm-emea',    label: 'EMEA' },
            { id: 'tm-apac',    label: 'APAC' },
        ],
    },
    {
        value: 'Channels', label: 'Channels',
        options: [
            { id: 'ch-phone', label: 'Phone' },
            { id: 'ch-chat',  label: 'Chat' },
            { id: 'ch-email', label: 'Email' },
            { id: 'ch-video', label: 'Video' },
        ],
    },
];

const PULSE_INTERVAL_MS = 5500;

export default class CardAverageActiveWorkTime extends LightningElement {
    filterGroups = FILTER_GROUPS;

    // Track total seconds; format as "Xm Ys"
    @track _totalSecs = 8 * 60 + 45;
    _interval = null;

    get displayValue() {
        const m = Math.floor(this._totalSecs / 60);
        const s = this._totalSecs % 60;
        return `${m}m ${s}s`;
    }

    connectedCallback() {
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this._interval = setInterval(() => { this._tick(); }, PULSE_INTERVAL_MS);
    }

    disconnectedCallback() {
        clearInterval(this._interval);
    }

    _tick() {
        const delta = Math.random() < 0.5 ? -15 : 15;
        this._totalSecs = Math.max(60, this._totalSecs + delta);
        const dir = delta > 0 ? 'up' : 'down';
        const kv = this.template.querySelector('ui-kpi-value');
        if (kv) kv.pulse(dir);
    }
}
