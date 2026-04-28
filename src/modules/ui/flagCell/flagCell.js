import { LightningElement, api } from 'lwc';

export default class FlagCell extends LightningElement {
    @api value;

    get showIcon() {
        return this.value === true;
    }
}
