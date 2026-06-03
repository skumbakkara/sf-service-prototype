import { LightningElement, track } from 'lwc';

export default class Wallboard extends LightningElement {
    get greeting() {
        const hour = new Date().getHours();
        const timeOfDay = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
        return `Good ${timeOfDay}, Alex`;
    }
}
