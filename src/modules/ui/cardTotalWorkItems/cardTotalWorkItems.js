import { LightningElement } from 'lwc';

export default class CardTotalWorkItems extends LightningElement {
    filterGroups = [
        {
            value: 'Queue', label: 'Queue',
            options: [
                { id: 'q-billing',  label: 'Billing' },
                { id: 'q-account',  label: 'Account Management' },
                { id: 'q-renewals', label: 'Renewals' },
                { id: 'q-tech',     label: 'Tech Support' },
                { id: 'q-loyalty',  label: 'Loyalty' },
            ],
        },
        {
            value: 'Channel', label: 'Channel',
            options: [
                { id: 'ch-phone', label: 'Phone' },
                { id: 'ch-chat',  label: 'Chat' },
                { id: 'ch-email', label: 'Email' },
            ],
        },
    ];
}
