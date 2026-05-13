import { LightningElement } from 'lwc';

export default class CardTotalWorkItems extends LightningElement {
    menuItems = [
        { value: 'view',   label: 'View details' },
        { value: 'export', label: 'Export' },
    ];
}
