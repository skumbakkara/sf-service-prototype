import { LightningElement } from 'lwc';

export default class CardAgentPresenceStatus extends LightningElement {
    filterGroups = [
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

    rows = [
        { id: 'offline',       label: 'Offline',           value: 10, colorVar: '--ccs-g-color-chart-category-light-color-1' },
        { id: 'avail-case',    label: 'Available for Case', value: 8,  colorVar: '--ccs-g-color-chart-category-light-color-1' },
        { id: 'online',        label: 'Online',             value: 7,  colorVar: '--ccs-g-color-chart-category-light-color-1' },
        { id: 'avail-all',     label: 'Available All',      value: 7,  colorVar: '--ccs-g-color-chart-category-light-color-1' },
        { id: 'avail-call',    label: 'Available for Call', value: 6,  colorVar: '--ccs-g-color-chart-category-light-color-1' },
        { id: 'avail-chat',    label: 'Available for Chat', value: 5,  colorVar: '--ccs-g-color-chart-category-light-color-1' },
    ];

    tickLabels = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
}
