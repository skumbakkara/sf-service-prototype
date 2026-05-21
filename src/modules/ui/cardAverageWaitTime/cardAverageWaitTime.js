import { LightningElement } from 'lwc';

export default class CardAverageWaitTime extends LightningElement {
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
}
