import { LightningElement } from 'lwc';

export default class CardAgentPresence extends LightningElement {
    menuItems = [
        { value: 'view',   label: 'View details' },
        { value: 'export', label: 'Export' },
    ];

    // Segment order matches the Figma legend (top → bottom). Mock values
    // are distributed so the donut visually resembles the Figma reference.
    // Colours map 1:1 to the SLDS 2 Figma "chart/Category/Light/Color N"
    // tokens (defined as project-namespaced aliases in src/styles/global.css).
    // Verified hex values: Color 1 #4992fe, Color 2 #ba01ff, Color 3 #06a59a,
    //                       Color 4 #3a49da, Color 5 #fe5c4c.
    segments = [
        { id: 'offline',      label: 'Offline',            value: 22, colorVar: '--ccs-g-color-chart-category-light-color-1' },
        { id: 'avail-case',   label: 'Available for case', value: 18, colorVar: '--ccs-g-color-chart-category-light-color-2' },
        { id: 'online',       label: 'Online',             value: 14, colorVar: '--ccs-g-color-chart-category-light-color-3' },
        { id: 'avail-all',    label: 'Available all',      value: 12, colorVar: '--ccs-g-color-chart-category-light-color-4' },
        { id: 'avail-call',   label: 'Available for call', value: 10, colorVar: '--ccs-g-color-chart-category-light-color-5' },
    ];
}
