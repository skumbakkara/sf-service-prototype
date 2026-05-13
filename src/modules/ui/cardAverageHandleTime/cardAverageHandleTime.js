import { LightningElement } from 'lwc';

export default class CardAverageHandleTime extends LightningElement {
    menuItems = [
        { value: 'view',   label: 'View details' },
        { value: 'export', label: 'Export' },
    ];
}
