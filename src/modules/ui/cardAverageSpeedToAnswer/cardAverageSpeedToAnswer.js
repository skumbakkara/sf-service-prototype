import { LightningElement } from 'lwc';

/**
 * Wallboard "Average Speed to Answer" KPI card (Figma node 19734:27981).
 *
 * Composes the shared chrome/value primitives with `ui-chart-line` for
 * the trend visual. The mock series + band are sized so the line ends
 * around 78s ("1m 18s"), matching the Figma value, and the band reads as
 * an "expected range" envelope above/below the trend.
 */
export default class CardAverageSpeedToAnswer extends LightningElement {
    menuItems = [
        { value: 'view',   label: 'View details' },
        { value: 'export', label: 'Export' },
    ];

    // X = minutes-ago bucket (60 → 0). Y = average answer time in seconds.
    // Hand-tuned so the trend rises modestly across the hour and ends at
    // 78s (the displayed "1m 18s" value).
    series = [
        { x:  0, y: 62 },
        { x:  5, y: 60 },
        { x: 10, y: 64 },
        { x: 15, y: 68 },
        { x: 20, y: 66 },
        { x: 25, y: 70 },
        { x: 30, y: 72 },
        { x: 35, y: 71 },
        { x: 40, y: 74 },
        { x: 45, y: 73 },
        { x: 50, y: 76 },
        { x: 55, y: 77 },
        { x: 60, y: 78 },
    ];

    // ±10s envelope around the trend, smoothed slightly so the band is
    // not a perfect parallel to the line.
    band = [
        { x:  0, upper: 74, lower: 50 },
        { x: 10, upper: 76, lower: 52 },
        { x: 20, upper: 78, lower: 54 },
        { x: 30, upper: 84, lower: 60 },
        { x: 40, upper: 86, lower: 62 },
        { x: 50, upper: 88, lower: 64 },
        { x: 60, upper: 90, lower: 66 },
    ];

    yLabels = ['2m', '0s'];
    xLabels = ['60m ago', 'Now'];
}
