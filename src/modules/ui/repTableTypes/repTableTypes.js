import { LightningElement, api } from 'lwc';
import StatusCell from 'ui/statusCell';

const CUSTOM_TYPES = {
    statusType: {
        template: StatusCell,
        standardCellLayout: true,
        typeAttributes: [],
    },
};

export default class RepTableTypes extends LightningElement {
    @api
    getDataTypes() {
        return CUSTOM_TYPES;
    }
}
