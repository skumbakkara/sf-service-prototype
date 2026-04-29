import { LightningElement } from 'lwc';
import { navigate } from '../../../router';

const WORK_ITEMS = [
    { id: 'wi-a', description: 'Sarah Mitchell | Billing dispute on recent invoice — overcharge on plan upgrade | 100847321 | Working | Medium Priority', channel: 'cases', queue: 'Billing', hasFlag: false },
    { id: 'wi-b', description: 'James Okafor | Unable to access account after password reset loop | 100912456 | Pending | High Priority',                 channel: 'cases', queue: 'Billing', hasFlag: true  },
    { id: 'wi-c', description: 'Priya Nair | Refund request for duplicate transaction on 14 Apr | 100863017 | Working | Medium Priority',                channel: 'cases', queue: 'Billing', hasFlag: false },
    { id: 'wi-d', description: 'Carlos Reyes | Live chat: card declined at checkout, needs payment method update | 100779834 | Active | Low Priority',   channel: 'chat',  queue: 'Billing', hasFlag: true  },
];

const REPS_DATA = [
    { id: 1,  name: 'Gilda Ann Thomas',  status: 'online',  statusLabel: 'All Online', statusTime: 'Since 9:15am', hasFlag: true,  workSummary: '3 Cases 1 Message', channels: ['chat','call','cases'], login: '2m 5s',   state: '5m 3s',   capacityP: 100, capacityI: 100, accept: '3m 5s',   workload: '0/20', acw: '2m 4s',   queues: ['Billing','Chat','+3'], skills: ['Billing','Chat','+3'], children: WORK_ITEMS },
    { id: 2,  name: 'Jerome Bell',        status: 'break',   statusLabel: 'On Break',   statusTime: 'Since 9:15am', hasFlag: false, workSummary: '2 Cases',           channels: ['call','cases'],       login: '10m 20s', state: '10m 20s', capacityP: 20,  capacityI: 35,  accept: '44m',     workload: '0/20', acw: '5m 34s',  queues: ['Billing','Chat','+3'], skills: ['Billing','Chat','+3'], children: WORK_ITEMS.slice(0, 2) },
    { id: 3,  name: 'Devon Lane',         status: 'online',  statusLabel: 'All Online', statusTime: 'Since 9:15am', hasFlag: true,  workSummary: '3 Cases 1 Message', channels: ['chat','call','cases'], login: '2m 5s',   state: '5m 3s',   capacityP: 100, capacityI: 100, accept: '3m 5s',   workload: '0/20', acw: '2m 4s',   queues: ['Billing','Chat','+3'], skills: ['Billing','Chat','+3'], children: WORK_ITEMS },
    { id: 4,  name: 'Arlene McCoy',       status: 'online',  statusLabel: 'All Online', statusTime: 'Since 9:15am', hasFlag: false, workSummary: '1 Case',            channels: ['call','cases'],       login: '8m 12s',  state: '14m 45s', capacityP: 100, capacityI: 40,  accept: '14m 45s', workload: '0/20', acw: '44m',     queues: ['Billing','Chat','+3'], skills: ['Billing','Chat','+3'], children: WORK_ITEMS.slice(0, 1) },
    { id: 5,  name: 'Floyd Miles',        status: 'online',  statusLabel: 'All Online', statusTime: 'Since 9:15am', hasFlag: true,  workSummary: '3 Cases 1 Message', channels: ['chat','call','cases'], login: '2m 5s',   state: '5m 3s',   capacityP: 100, capacityI: 100, accept: '3m 5s',   workload: '0/20', acw: '2m 4s',   queues: ['Billing','Chat','+3'], skills: ['Billing','Chat','+3'], children: WORK_ITEMS },
    { id: 6,  name: 'Savannah Nguyen',    status: 'online',  statusLabel: 'All Online', statusTime: 'Since 9:15am', hasFlag: false, workSummary: '4 Cases',           channels: ['cases'],              login: '10m 20s', state: '1h 26m',  capacityP: 50,  capacityI: 100, accept: '5m 34s',  workload: '0/20', acw: '1h 26m',  queues: ['Billing','Chat','+3'], skills: ['Billing','Chat','+3'], children: WORK_ITEMS },
    { id: 7,  name: 'Leslie Alexander',   status: 'break',   statusLabel: 'On Break',   statusTime: 'Since 9:15am', hasFlag: false, workSummary: '2 Messages',        channels: ['chat'],               login: '44m',     state: '8m 12s',  capacityP: 30,  capacityI: 50,  accept: '1h 26m',  workload: '0/20', acw: '10m 20s', queues: ['Billing','Chat','+3'], skills: ['Billing','Chat','+3'], children: WORK_ITEMS.slice(0, 2) },
    { id: 8,  name: 'Robert Fox',         status: 'online',  statusLabel: 'All Online', statusTime: 'Since 9:15am', hasFlag: false, workSummary: '3 Cases 1 Message', channels: ['chat','call','cases'], login: '5m 34s',  state: '10m 20s', capacityP: 50,  capacityI: 20,  accept: '7m 25s',  workload: '0/20', acw: '10m 20s', queues: ['Billing','Chat','+3'], skills: ['Billing','Chat','+3'], children: WORK_ITEMS },
    { id: 9,  name: 'Theresa Webb',       status: 'offline', statusLabel: 'Offline',    statusTime: 'Since 9:15am', hasFlag: false, workSummary: '1 Message',         channels: ['chat','call'],        login: '9m 02s',  state: '9m 02s',  capacityP: 30,  capacityI: 80,  accept: '14m 45s', workload: '0/20', acw: '5m 34s',  queues: ['Billing','Chat','+3'], skills: ['Billing','Chat','+3'], children: WORK_ITEMS.slice(0, 1) },
    { id: 10, name: 'Marvin McKinney',    status: 'online',  statusLabel: 'All Online', statusTime: 'Since 9:15am', hasFlag: false, workSummary: '1 Call',            channels: ['call','cases'],       login: '1h 26m',  state: '5m 34s',  capacityP: 40,  capacityI: 50,  accept: '7m 25s',  workload: '0/20', acw: '44m',     queues: ['Billing','Chat','+3'], skills: ['Billing','Chat','+3'], children: WORK_ITEMS.slice(0, 1) },
    { id: 11, name: 'Marvin McKinney',    status: 'online',  statusLabel: 'All Online', statusTime: 'Since 9:15am', hasFlag: false, workSummary: '1 Call',            channels: ['call','cases'],       login: '1h 26m',  state: '5m 34s',  capacityP: 40,  capacityI: 50,  accept: '7m 25s',  workload: '0/20', acw: '44m',     queues: ['Billing','Chat','+3'], skills: ['Billing','Chat','+3'], children: WORK_ITEMS.slice(0, 1) },
    { id: 12, name: 'Marvin McKinney',    status: 'online',  statusLabel: 'All Online', statusTime: 'Since 9:15am', hasFlag: false, workSummary: '1 Call',            channels: ['call','cases'],       login: '1h 26m',  state: '5m 34s',  capacityP: 40,  capacityI: 50,  accept: '7m 25s',  workload: '0/20', acw: '44m',     queues: ['Billing','Chat','+3'], skills: ['Billing','Chat','+3'], children: WORK_ITEMS.slice(0, 1) },
];

export default class ServiceReps extends LightningElement {
    activeTab = 'service-reps';
    reps = REPS_DATA;

    handleTabChange(event) {
        this.activeTab = event.target.value;
    }

    handleInlineDrawerToggle() {
        navigate('/service-reps-inline-drawer');
    }
}
