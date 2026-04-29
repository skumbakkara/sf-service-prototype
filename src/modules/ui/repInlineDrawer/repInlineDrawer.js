import { LightningElement, api } from 'lwc';

export default class RepInlineDrawer extends LightningElement {
    @api tabsData = [];
    @api activeTabId;

    get tabs() {
        return (this.tabsData ?? []).map(t => ({
            ...t,
            tabClass: t.id === this.activeTabId
                ? 'drawer-tab drawer-tab_active'
                : 'drawer-tab',
        }));
    }

    get activeTab() {
        return (this.tabsData ?? []).find(t => t.id === this.activeTabId) ?? null;
    }

    handleTabSelect(event) {
        const id = event.currentTarget.dataset.id;
        this.dispatchEvent(new CustomEvent('tabselect', { detail: { repId: id } }));
    }

    handleTabClose(event) {
        event.stopPropagation();
        const id = event.currentTarget.dataset.id;
        this.dispatchEvent(new CustomEvent('tabclose', { detail: { repId: id } }));
    }

    handleWorkItemClick(event) {
        event.preventDefault();
    }
}
