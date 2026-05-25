import { LightningElement } from 'lwc';

export default class CardAverageSpeedToAnswer extends LightningElement {
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

    // 4 queue series trending upward over 15 minutes, matching Figma mock.
    // Colors map to the project chart-category palette (color 1–4). Queue
    // names are drawn from the same vocabulary used by the work-item data
    // in `serviceReps.js` (Billing / Account / Renewals / Tech / Loyalty /
    // Returns) so the demo reads consistently across the Wallboard and
    // the Service Reps / In-Progress / Backlog tabs.
    series = [
        {
            id: 'q1', label: 'Billing',
            colorVar: '--ccs-g-color-chart-category-light-color-1',
            points: [
                { x: 0, y: 1.5 }, { x: 5, y: 3.8 }, { x: 10, y: 2.2 }, { x: 15, y: 4.6 },
            ],
        },
        {
            id: 'q2', label: 'Tech Support',
            colorVar: '--ccs-g-color-chart-category-light-color-2',
            points: [
                { x: 0, y: 3.0 }, { x: 6, y: 1.4 }, { x: 11, y: 4.5 }, { x: 15, y: 2.8 },
            ],
        },
        {
            id: 'q3', label: 'Renewals',
            colorVar: '--ccs-g-color-chart-category-light-color-3',
            points: [
                { x: 0, y: 4.2 }, { x: 4, y: 2.0 }, { x: 9, y: 3.5 }, { x: 15, y: 1.8 },
            ],
        },
        {
            id: 'q4', label: 'Returns',
            colorVar: '--ccs-g-color-chart-category-light-color-4',
            points: [
                { x: 0, y: 2.5 }, { x: 7, y: 4.8 }, { x: 12, y: 1.5 }, { x: 15, y: 3.9 },
            ],
        },
    ];

    yLabels = ['5m', '4m', '3m', '2m', '1m'];
    xLabels = ['0m', '5m', '10m', '15m'];
}
