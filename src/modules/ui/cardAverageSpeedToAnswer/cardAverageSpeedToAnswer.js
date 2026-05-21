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
                { x: 0, y: 1.8 }, { x: 1, y: 2.0 }, { x: 2, y: 2.1 }, { x: 3, y: 2.2 },
                { x: 4, y: 2.5 }, { x: 5, y: 2.8 }, { x: 6, y: 3.0 }, { x: 7, y: 3.2 },
                { x: 8, y: 3.5 }, { x: 9, y: 3.8 }, { x: 10, y: 4.0 }, { x: 11, y: 4.3 },
                { x: 12, y: 4.5 }, { x: 13, y: 4.7 }, { x: 14, y: 5.0 }, { x: 15, y: 5.1 },
            ],
        },
        {
            id: 'q2', label: 'Tech Support',
            colorVar: '--ccs-g-color-chart-category-light-color-2',
            points: [
                { x: 0, y: 1.5 }, { x: 1, y: 1.6 }, { x: 2, y: 1.8 }, { x: 3, y: 2.0 },
                { x: 4, y: 2.2 }, { x: 5, y: 2.4 }, { x: 6, y: 2.6 }, { x: 7, y: 2.8 },
                { x: 8, y: 3.0 }, { x: 9, y: 3.2 }, { x: 10, y: 3.5 }, { x: 11, y: 3.6 },
                { x: 12, y: 3.8 }, { x: 13, y: 4.0 }, { x: 14, y: 4.2 }, { x: 15, y: 4.3 },
            ],
        },
        {
            id: 'q3', label: 'Renewals',
            colorVar: '--ccs-g-color-chart-category-light-color-3',
            points: [
                { x: 0, y: 1.2 }, { x: 1, y: 1.4 }, { x: 2, y: 1.6 }, { x: 3, y: 1.8 },
                { x: 4, y: 2.0 }, { x: 5, y: 2.1 }, { x: 6, y: 2.3 }, { x: 7, y: 2.4 },
                { x: 8, y: 2.6 }, { x: 9, y: 2.8 }, { x: 10, y: 3.0 }, { x: 11, y: 3.2 },
                { x: 12, y: 3.3 }, { x: 13, y: 3.5 }, { x: 14, y: 3.7 }, { x: 15, y: 3.8 },
            ],
        },
        {
            id: 'q4', label: 'Returns',
            colorVar: '--ccs-g-color-chart-category-light-color-4',
            points: [
                { x: 0, y: 1.0 }, { x: 1, y: 1.1 }, { x: 2, y: 1.2 }, { x: 3, y: 1.4 },
                { x: 4, y: 1.5 }, { x: 5, y: 1.7 }, { x: 6, y: 1.8 }, { x: 7, y: 2.0 },
                { x: 8, y: 2.1 }, { x: 9, y: 2.3 }, { x: 10, y: 2.5 }, { x: 11, y: 2.6 },
                { x: 12, y: 2.8 }, { x: 13, y: 2.9 }, { x: 14, y: 3.0 }, { x: 15, y: 3.1 },
            ],
        },
    ];

    yLabels = ['5m', '4m', '3m', '2m', '1m'];
    xLabels = ['0m', '5m', '10m', '15m'];
}
