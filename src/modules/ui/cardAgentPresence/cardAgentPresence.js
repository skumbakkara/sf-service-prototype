import { LightningElement } from 'lwc';

export default class CardAgentPresence extends LightningElement {
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
            value: 'Skill', label: 'Skill',
            options: [
                { id: 'sk-product',  label: 'Product Knowledge' },
                { id: 'sk-spanish',  label: 'Spanish' },
                { id: 'sk-billing',  label: 'Billing Specialist' },
                { id: 'sk-tech',     label: 'Technical Support' },
            ],
        },
    ];

    segments = [
        { id: 'offline',      label: 'Offline',            value: 22, colorVar: '--ccs-g-color-chart-category-light-color-1' },
        { id: 'avail-case',   label: 'Available for case', value: 18, colorVar: '--ccs-g-color-chart-category-light-color-2' },
        { id: 'online',       label: 'Online',             value: 14, colorVar: '--ccs-g-color-chart-category-light-color-3' },
        { id: 'avail-all',    label: 'Available all',      value: 12, colorVar: '--ccs-g-color-chart-category-light-color-4' },
        { id: 'avail-call',   label: 'Available for call', value: 10, colorVar: '--ccs-g-color-chart-category-light-color-5' },
    ];
}
