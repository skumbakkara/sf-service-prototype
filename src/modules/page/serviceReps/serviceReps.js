import { LightningElement, track } from 'lwc';

// `queue`, `skills`, `team` extend each row to power the multi-facet filter
// side-panel on the In-Progress table. Values are picked deterministically
// per row from each item's subject/channel context so the same row always
// shows the same facets (no random-per-render drift).
const IN_PROGRESS_ITEMS = [
    { id: 'ip-01', channel: 'cases', subject: 'Technical Assistance Bot',           caseNumber: '100783405', priority: 'Medium',   status: 'Working', assignedTo: 'Bay Assist Agent', isAgent: true,  routeBy: 'Direct to Agent', hasFlag: false, sentiment: 'neutral',   workSize: 5, isInterruptible: true,  handleTime: '4 m',    assignedTime: '22 Oct, 2025, 11:40 PM', speedToAnswer: '1 m 7 s',  acceptedTime: '22 Oct, 2025, 11:41 PM', queue: 'Tech Support',  team: 'Tier 2',     skills: ['Technical','Diagnostics']    },
    { id: 'ip-02', channel: 'chat',  subject: 'Technical Assistance Bot',           caseNumber: '100783406', priority: 'High',     status: 'New'    , assignedTo: 'Dana Bose',       isAgent: false, avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg', routeBy: 'Skills-Based', routeByIcon: 'utility:skill', hasFlag: false, sentiment: 'good',      workSize: 2, isInterruptible: false, handleTime: '9 m',    assignedTime: '21 Sep, 2025, 9:15 AM', speedToAnswer: '44 s',  acceptedTime: '21 Sep, 2025, 9:16 AM', queue: 'Tech Support',  team: 'Tier 1',     skills: ['Technical','Tier 3']         },
    { id: 'ip-03', channel: 'cases', subject: 'Product Recommendation Assistant',   caseNumber: '100783409', priority: '',         status: 'Working',  assignedTo: 'Fiona Patel', isAgent: false, avatarUrl: 'https://randomuser.me/api/portraits/women/68.jpg', routeBy: 'Product Knowled...', routeByIcon: 'utility:skill', hasFlag: false, sentiment: 'excellent', workSize: 8, isInterruptible: true,  handleTime: '1 m',    assignedTime: '17 Sep, 2025, 2:48 PM', speedToAnswer: '17 s',  acceptedTime: '17 Sep, 2025, 2:49 PM', queue: 'Sales',         team: 'SMB',        skills: ['Sales','Account Mgmt']       },
    { id: 'ip-04', channel: 'call',  subject: 'Order Status Inquiry',               caseNumber: '100783412', priority: '',         status: 'Escalated', assignedTo: 'Sofia Yang',     isAgent: false, avatarUrl: 'https://randomuser.me/api/portraits/women/12.jpg', routeBy: 'SF Proactive Sup...', routeByIcon: 'utility:work_queue', hasFlag: true,  sentiment: 'neutral',   workSize: 3, isInterruptible: false, handleTime: '3 h',    assignedTime: '15 Sep, 2025, 4:22 PM', speedToAnswer: '1 m 10 s',  acceptedTime: '15 Sep, 2025, 4:23 PM', queue: 'Returns',       team: 'AMER',       skills: ['Spanish','Account Mgmt']     },
    { id: 'ip-05', channel: 'cases', subject: 'Subscription Management Support',    caseNumber: '100783415', priority: 'Medium',   status: 'Working', assignedTo: 'Tech Agentforce', isAgent: true,  routeBy: 'Direct to Agent', hasFlag: false, sentiment: 'good',      workSize: 6, isInterruptible: true,  handleTime: '3 m',    assignedTime: '9 Sep, 2025, 10:05 AM',  speedToAnswer: '—',     acceptedTime: '—',                     queue: 'Renewals',      team: 'Tier 2',     skills: ['Retention','Account Mgmt']   },
    { id: 'ip-06', channel: 'chat',  subject: 'Delivery Issue Resolution',          caseNumber: '100783418', priority: 'High',     status: 'New'    , assignedTo: 'Matthew Fox',    isAgent: false, avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg', routeBy: 'Most Available', routeByIcon: 'utility:skill', hasFlag: false, sentiment: 'bad',       workSize: 4, isInterruptible: false, handleTime: '44 m',   assignedTime: '4 Sep, 2025, 1:33 PM',  speedToAnswer: '22 s',  acceptedTime: '4 Sep, 2025, 1:34 PM',  queue: 'Returns',       team: 'EMEA',       skills: ['Refunds','French']           },
    { id: 'ip-07', channel: 'email', subject: 'Customer Upgrade Chart',             caseNumber: '100783421', priority: 'Medium',   status: 'Working', assignedTo: 'Social Media Ma...', isAgent: true, routeBy: 'Direct to Agent', hasFlag: false, sentiment: 'neutral',   workSize: 1, isInterruptible: true,  handleTime: '10 m',   assignedTime: '25 Aug, 2025, 8:12 AM', speedToAnswer: '1 m 2 s',  acceptedTime: '25 Aug, 2025, 8:13 AM', queue: 'Loyalty',       team: 'AMER',       skills: ['Sales','Premium']            },
    { id: 'ip-08', channel: 'cases', subject: 'Agent Registration Form',            caseNumber: '100783424', priority: '',         status: 'Escalated', assignedTo: 'Grace Agent',    isAgent: true,  routeBy: 'Direct to Agent', hasFlag: true,  sentiment: 'excellent', workSize: 9, isInterruptible: false, handleTime: '7 m',    assignedTime: '21 Aug, 2025, 6:50 PM', speedToAnswer: '31 s',  acceptedTime: '21 Aug, 2025, 6:51 PM', queue: 'Onboarding',    team: 'Enterprise', skills: ['Onboarding','Account Mgmt']  },
    { id: 'ip-09', channel: 'chat',  subject: 'Feedback Collection Chat',           caseNumber: '100783427', priority: '',         status: 'Working',  assignedTo: 'Aisha Khan',     isAgent: false, avatarUrl: 'https://randomuser.me/api/portraits/women/63.jpg', routeBy: 'Round Robin', routeByIcon: 'utility:work_queue', hasFlag: false, sentiment: 'good',      workSize: 2, isInterruptible: true,  handleTime: '14 m',   assignedTime: '17 Aug, 2025, 11:25 AM', speedToAnswer: '55 s',  acceptedTime: '17 Aug, 2025, 11:26 AM', queue: 'Chat',         team: 'APAC',       skills: ['Sales','Italian']            },
    { id: 'ip-10', channel: 'call',  subject: 'Feedback Collection Chat',           caseNumber: '100783430', priority: 'High',     status: 'New'    , assignedTo: 'Ethan Brooks',   isAgent: false, avatarUrl: 'https://randomuser.me/api/portraits/men/45.jpg', routeBy: 'Most Idle', routeByIcon: 'utility:work_queue', hasFlag: false, sentiment: 'terrible',  workSize: 7, isInterruptible: false, handleTime: '5 m',    assignedTime: '11 Aug, 2025, 3:45 PM', speedToAnswer: '1 m 20 s',  acceptedTime: '11 Aug, 2025, 3:46 PM', queue: 'Escalations',   team: 'AMER',       skills: ['Negotiation','Tier 3']       },
    { id: 'ip-11', channel: 'cases', subject: 'Feedback Collection Omni',           caseNumber: '100783433', priority: 'Medium',   status: 'Working', assignedTo: 'Marcus Cole',    isAgent: false, avatarUrl: 'https://randomuser.me/api/portraits/men/76.jpg', routeBy: 'Skills-Based', routeByIcon: 'utility:skill', hasFlag: false, sentiment: 'neutral',   workSize: 3, isInterruptible: true,  handleTime: '2 m',    assignedTime: '5 Aug, 2025, 7:18 AM',  speedToAnswer: '8 s',  acceptedTime: '5 Aug, 2025, 7:19 AM',     queue: 'Sales',         team: 'SMB',        skills: ['Sales','Onboarding']         },
    { id: 'ip-12', channel: 'cases', subject: 'Refund processing delay investigation', caseNumber: '100783436', priority: 'High',     status: 'New'    , assignedTo: 'Liam Anderson',  isAgent: false, avatarUrl: 'https://i.pravatar.cc/64?img=12', routeBy: 'Skills-Based',  routeByIcon: 'utility:skill',      hasFlag: false, sentiment: 'bad',       workSize: 5, isInterruptible: false, handleTime: '12 m',   assignedTime: '3 Aug, 2025, 5:09 PM',  speedToAnswer: '38 s',  acceptedTime: '3 Aug, 2025, 5:10 PM',   queue: 'Billing',       team: 'Tier 2',     skills: ['Billing','Refunds']          },
    { id: 'ip-13', channel: 'chat',  subject: 'Knowledge Base AI Assist',             caseNumber: '100783439', priority: '',         status: 'Working',  assignedTo: 'Knowledge Bot',  isAgent: true,  routeBy: 'Direct to Agent', routeByIcon: null,                                  hasFlag: false, sentiment: 'good',      workSize: 1, isInterruptible: true,  handleTime: '2 m',    assignedTime: '1 Aug, 2025, 12:30 PM',  speedToAnswer: '5 s',  acceptedTime: '1 Aug, 2025, 12:31 PM',  queue: 'Chat',          team: 'Tier 1',     skills: ['Technical','Onboarding']     },
    { id: 'ip-14', channel: 'email', subject: 'Warranty claim review request',         caseNumber: '100783442', priority: 'Medium',   status: 'Working', assignedTo: 'Olivia Bennett', isAgent: false, avatarUrl: 'https://i.pravatar.cc/64?img=14', routeBy: 'Most Available', routeByIcon: 'utility:skill',      hasFlag: true,  sentiment: 'neutral',   workSize: 4, isInterruptible: true,  handleTime: '8 m',    assignedTime: '30 Jul, 2025, 9:55 AM', speedToAnswer: '1 m 2 s',  acceptedTime: '30 Jul, 2025, 9:56 AM', queue: 'Returns',       team: 'AMER',       skills: ['Refunds','Account Mgmt']     },
    { id: 'ip-15', channel: 'call',  subject: 'Account merge request',                 caseNumber: '100783445', priority: ''        , status: 'New'    , assignedTo: 'Routing Agent',  isAgent: true,  routeBy: 'Direct to Agent', routeByIcon: null,                                  hasFlag: true,  sentiment: 'terrible',  workSize: 9, isInterruptible: false, handleTime: '23 m',   assignedTime: '28 Jul, 2025, 10:42 PM', speedToAnswer: '11 s',  acceptedTime: '28 Jul, 2025, 10:43 PM', queue: 'Escalations',   team: 'Tier 3',     skills: ['Tier 3','Account Mgmt']      },
    { id: 'ip-16', channel: 'chat',  subject: 'Shipping address change after dispatch',caseNumber: '100783448', priority: '',         status: 'Escalated', assignedTo: 'Noah Carter',    isAgent: false, avatarUrl: 'https://i.pravatar.cc/64?img=16', routeBy: 'Round Robin',    routeByIcon: 'utility:work_queue', hasFlag: false, sentiment: 'neutral',   workSize: 2, isInterruptible: true,  handleTime: '6 m',    assignedTime: '25 Jul, 2025, 2:17 PM', speedToAnswer: '27 s',  acceptedTime: '25 Jul, 2025, 2:18 PM',  queue: 'Returns',       team: 'EMEA',       skills: ['German','Account Mgmt']      },
    { id: 'ip-17', channel: 'cases', subject: 'Product activation key not received',   caseNumber: '100783451', priority: ''   ,      status: 'Working', assignedTo: 'Activation Bot', isAgent: true,  routeBy: 'Direct to Agent', routeByIcon: null,                                  hasFlag: false, sentiment: 'good',      workSize: 1, isInterruptible: true,  handleTime: '1 m',    assignedTime: '23 Jul, 2025, 8:33 AM', speedToAnswer: '3 s',  acceptedTime: '23 Jul, 2025, 8:34 AM',     queue: 'Onboarding',    team: 'Tier 1',     skills: ['Onboarding','Technical']     },
    { id: 'ip-18', channel: 'messaging', subject: 'Two-factor reset locked account',   caseNumber: '100783454', priority: 'High',     status: 'New'    , assignedTo: 'Ava Thompson',   isAgent: false, avatarUrl: 'https://i.pravatar.cc/64?img=18', routeBy: 'Skills-Based',   routeByIcon: 'utility:skill',      hasFlag: false, sentiment: 'bad',       workSize: 6, isInterruptible: false, handleTime: '15 m',   assignedTime: '21 Jul, 2025, 4:01 PM', speedToAnswer: '51 s',  acceptedTime: '21 Jul, 2025, 4:02 PM',  queue: 'Tech Support',  team: 'Tier 2',     skills: ['Technical','Diagnostics']    },
    { id: 'ip-19', channel: 'cases', subject: 'Subscription renewal pricing question', caseNumber: '100783457', priority: 'Medium',   status: 'Working',  assignedTo: 'Renewal Agent',  isAgent: true,  routeBy: 'Direct to Agent', routeByIcon: null,                                  hasFlag: false, sentiment: 'neutral',   workSize: 3, isInterruptible: true,  handleTime: '4 m',    assignedTime: '18 Jul, 2025, 11:48 AM', speedToAnswer: '14 s',  acceptedTime: '18 Jul, 2025, 11:49 AM', queue: 'Renewals',      team: 'SMB',        skills: ['Retention','Negotiation']    },
    { id: 'ip-20', channel: 'email', subject: 'Bulk order export failing on download', caseNumber: '100783460', priority: '',         status: 'Working', assignedTo: 'Ethan Walker',   isAgent: false, avatarUrl: 'https://i.pravatar.cc/64?img=20', routeBy: 'Most Idle',      routeByIcon: 'utility:work_queue', hasFlag: false, sentiment: 'good',      workSize: 4, isInterruptible: true,  handleTime: '9 m',    assignedTime: '15 Jul, 2025, 6:24 PM', speedToAnswer: '1 m 18 s',  acceptedTime: '15 Jul, 2025, 6:25 PM', queue: 'Tech Support',  team: 'Tier 2',     skills: ['Technical','Diagnostics']    },
    { id: 'ip-21', channel: 'call',  subject: 'VIP escalation — outage impact review', caseNumber: '100783463', priority: ''        , status: 'Working', assignedTo: 'Mia Robinson',   isAgent: false, avatarUrl: 'https://i.pravatar.cc/64?img=22', routeBy: 'Skills-Based',   routeByIcon: 'utility:skill',      hasFlag: true,  sentiment: 'terrible',  workSize: 8, isInterruptible: false, handleTime: '1 h',    assignedTime: '12 Jul, 2025, 1:11 AM', speedToAnswer: '9 s',  acceptedTime: '12 Jul, 2025, 1:12 AM',    queue: 'VIP',           team: 'VIP Care',   skills: ['Premium','Tier 3']           },
    { id: 'ip-22', channel: 'chat',  subject: 'Tier upgrade preview eligibility',      caseNumber: '100783466', priority: ''   ,      status: 'Escalated', assignedTo: 'Upgrade Bot',    isAgent: true,  routeBy: 'Direct to Agent', routeByIcon: null,                                  hasFlag: false, sentiment: 'good',      workSize: 2, isInterruptible: true,  handleTime: '3 m',    assignedTime: '10 Jul, 2025, 9:39 PM', speedToAnswer: '6 s',  acceptedTime: '10 Jul, 2025, 9:40 PM',    queue: 'Sales',         team: 'Enterprise', skills: ['Sales','Premium']            },
    { id: 'ip-23', channel: 'cases', subject: 'Replacement device tracking number',    caseNumber: '100783469', priority: '',         status: 'New'    , assignedTo: 'Logistics Bot',  isAgent: true,  routeBy: 'Direct to Agent', routeByIcon: null,                                  hasFlag: false, sentiment: 'neutral',   workSize: 3, isInterruptible: true,  handleTime: '5 m',    assignedTime: '8 Jul, 2025, 3:56 PM',  speedToAnswer: '2 s',  acceptedTime: '8 Jul, 2025, 3:57 PM',     queue: 'Returns',       team: 'AMER',       skills: ['Refunds','Account Mgmt']     },
    { id: 'ip-24', channel: 'cases', subject: 'GDPR data export request',              caseNumber: '100783472', priority: 'High',     status: 'New'    , assignedTo: 'Isabella Reed',  isAgent: false, avatarUrl: 'https://i.pravatar.cc/64?img=24', routeBy: 'Skills-Based',   routeByIcon: 'utility:skill',      hasFlag: true,  sentiment: 'bad',       workSize: 7, isInterruptible: false, handleTime: '32 m',   assignedTime: '5 Jul, 2025, 7:29 AM',  speedToAnswer: '44 s',  acceptedTime: '5 Jul, 2025, 7:30 AM',   queue: 'Escalations',   team: 'EMEA',       skills: ['Tier 3','Account Mgmt']      },
    { id: 'ip-25', channel: 'chat',  subject: 'Live chat handoff to specialist',       caseNumber: '100783475', priority: 'Medium',   status: 'Working', assignedTo: 'Lucas Bailey',   isAgent: false, avatarUrl: 'https://i.pravatar.cc/64?img=26', routeBy: 'Most Available', routeByIcon: 'utility:skill',      hasFlag: false, sentiment: 'neutral',   workSize: 4, isInterruptible: true,  handleTime: '11 m',   assignedTime: '3 Jul, 2025, 12:14 PM',  speedToAnswer: '19 s',  acceptedTime: '3 Jul, 2025, 12:15 PM', queue: 'Chat',          team: 'Tier 1',     skills: ['Spanish','Onboarding']       },
    { id: 'ip-26', channel: 'email', subject: 'Compliance disclosure follow-up',       caseNumber: '100783478', priority: ''   ,      status: 'Working',  assignedTo: 'Charlotte Ross', isAgent: false, avatarUrl: 'https://i.pravatar.cc/64?img=28', routeBy: 'Queue-based',    routeByIcon: 'utility:work_queue', hasFlag: false, sentiment: 'good',      workSize: 2, isInterruptible: true,  handleTime: '7 m',    assignedTime: '1 Jul, 2025, 5:38 PM',  speedToAnswer: '33 s',  acceptedTime: '1 Jul, 2025, 5:39 PM',   queue: 'Escalations',   team: 'Enterprise', skills: ['Account Mgmt','Tier 3']      },
    { id: 'ip-27', channel: 'call',  subject: 'Repeat billing complaint — third call', caseNumber: '100783481', priority: 'High',     status: 'Working', assignedTo: 'Triage Agent',   isAgent: true,  routeBy: 'Direct to Agent', routeByIcon: null,                                  hasFlag: true,  sentiment: 'terrible',  workSize: 6, isInterruptible: false, handleTime: '18 m',   assignedTime: '28 Jun, 2025, 10:53 AM', speedToAnswer: '7 s',  acceptedTime: '28 Jun, 2025, 10:54 AM', queue: 'Billing',       team: 'Tier 2',     skills: ['Billing','Negotiation']      },
    { id: 'ip-28', channel: 'cases', subject: 'Promo code stacking eligibility check', caseNumber: '100783484', priority: '',         status: 'Working', assignedTo: 'Henry Morgan',   isAgent: false, avatarUrl: 'https://i.pravatar.cc/64?img=30', routeBy: 'Round Robin',    routeByIcon: 'utility:work_queue', hasFlag: false, sentiment: 'neutral',   workSize: 1, isInterruptible: true,  handleTime: '2 m',    assignedTime: '25 Jun, 2025, 4:27 PM', speedToAnswer: '24 s',  acceptedTime: '25 Jun, 2025, 4:28 PM',  queue: 'Loyalty',       team: 'SMB',        skills: ['Sales','Retention']          },
    { id: 'ip-29', channel: 'chat',  subject: 'Onboarding tour assistance',            caseNumber: '100783487', priority: 'Medium',   status: 'Working',  assignedTo: 'Onboarding Bot', isAgent: true,  routeBy: 'Direct to Agent', routeByIcon: null,                                  hasFlag: false, sentiment: 'excellent', workSize: 3, isInterruptible: true,  handleTime: '4 m',    assignedTime: '22 Jun, 2025, 8:46 AM', speedToAnswer: '8 s',  acceptedTime: '22 Jun, 2025, 8:47 AM',    queue: 'Onboarding',    team: 'Tier 1',     skills: ['Onboarding','Account Mgmt']  },
    { id: 'ip-30', channel: 'cases', subject: 'Cancellation reconsideration outreach', caseNumber: '100783490', priority: 'Medium',   status: 'New'    , assignedTo: 'Emma Sullivan',  isAgent: false, avatarUrl: 'https://i.pravatar.cc/64?img=32', routeBy: 'Skills-Based',   routeByIcon: 'utility:skill',      hasFlag: false, sentiment: 'good',      workSize: 5, isInterruptible: true,  handleTime: '13 m',   assignedTime: '19 Jun, 2025, 2:31 PM', speedToAnswer: '47 s',  acceptedTime: '19 Jun, 2025, 2:32 PM',  queue: 'Renewals',      team: 'Enterprise', skills: ['Retention','Negotiation']    },
    { id: 'ip-31', channel: 'messaging', subject: 'Mobile app crash on payment screen',caseNumber: '100783493', priority: 'High',     status: 'Working', assignedTo: 'Mason Hughes',   isAgent: false, avatarUrl: 'https://i.pravatar.cc/64?img=33', routeBy: 'Most Available', routeByIcon: 'utility:skill',      hasFlag: true,  sentiment: 'bad',       workSize: 7, isInterruptible: false, handleTime: '21 m',   assignedTime: '16 Jun, 2025, 9:08 PM', speedToAnswer: '15 s',  acceptedTime: '16 Jun, 2025, 9:09 PM',  queue: 'Tech Support',  team: 'APAC',       skills: ['Technical','Diagnostics']    },
];

// Channel mix is intentionally interleaved (case / message / call repeated)
// so that any slice through this list — including the first MAX_WORK_ITEMS_PER_REP
// the accordion shows (see serviceRepsTable.js) — surfaces all three work-item
// types. That keeps the Work Summary column varied across rows instead of
// reading "N Cases" everywhere.
// `routeBy` decides which facet the work-item card's meta row shows: `'queue'`
// renders the queue name (work_queue icon) and `'skill'` renders the skill name
// (skill icon). The mix is baked into the data so it stays stable across
// re-renders instead of re-rolling on every paint.
const WORK_ITEMS = [
    { id: 'wi-a', customer: 'Sarah Mitchell', subject: 'Billing dispute on recent invoice — overcharge on plan upgrade',  caseNumber: '100847321', status: 'Working',   priority: 'Medium', channel: 'cases', queue: 'Billing',  skill: 'Billing',       routeBy: 'queue', workLoad: 5, hasFlag: false, isInterruptible: true  },
    { id: 'wi-b', customer: 'James Okafor',   subject: 'Live chat — unable to access account after password reset loop',  caseNumber: '100912456', status: 'New',       priority: 'High',   channel: 'chat',  queue: 'Account',  skill: 'Account Mgmt',  routeBy: 'skill', workLoad: 7, hasFlag: true,  isInterruptible: false },
    { id: 'wi-c', customer: 'Priya Nair',     subject: 'Inbound call — refund for duplicate transaction on 14 Apr',       caseNumber: '100863017', status: 'Working',   priority: 'Medium', channel: 'call',  queue: 'Billing',  skill: 'Refunds',       routeBy: 'skill', workLoad: 3, hasFlag: false, isInterruptible: true  },
    { id: 'wi-d', customer: 'Carlos Reyes',   subject: 'Card declined at checkout — payment method update needed',        caseNumber: '100779834', status: 'Working',   priority: '',       channel: 'cases', queue: 'Billing',  skill: 'Payments',      routeBy: 'queue', workLoad: 2, hasFlag: true,  isInterruptible: false },
    { id: 'wi-e', customer: 'Hannah Brooks',  subject: 'Chat — subscription auto-renewed despite cancellation email',     caseNumber: '101023881', status: 'New',       priority: 'High',   channel: 'chat',  queue: 'Renewals', skill: 'Retention',     routeBy: 'skill', workLoad: 6, hasFlag: false, isInterruptible: true  },
    { id: 'wi-f', customer: 'Ahmed Hassan',   subject: 'Voice call — device repeatedly disconnects from wifi',            caseNumber: '101145672', status: 'Working',   priority: 'Medium', channel: 'call',  queue: 'Tech',     skill: 'Diagnostics',   routeBy: 'queue', workLoad: 4, hasFlag: false, isInterruptible: false },
    { id: 'wi-g', customer: 'Lena Park',      subject: 'Loyalty points missing after qualifying purchase',                caseNumber: '101207334', status: 'Working',   priority: '',       channel: 'cases', queue: 'Loyalty',  skill: 'Loyalty',       routeBy: 'skill', workLoad: 1, hasFlag: false, isInterruptible: true  },
    { id: 'wi-h', customer: 'Diego Alvarez',  subject: 'Bulk return shipment status — awaiting carrier confirmation',     caseNumber: '101289005', status: 'Escalated', priority: 'Medium', channel: 'cases', queue: 'Returns',  skill: 'Logistics',     routeBy: 'queue', workLoad: 8, hasFlag: true,  isInterruptible: false },
];

// Paused work items — surfaced under the collapsible "Paused Work Items"
// expander at the bottom of the accordion's Active Work Items column.
const PAUSED_WORK_ITEMS = [
    { id: 'pwi-a', customer: 'Nina Foster',   subject: 'Awaiting customer reply — escalation paused pending docs',        caseNumber: '101334072', status: 'Paused', priority: 'Medium', channel: 'email', queue: 'Escalations', skill: 'Escalations', routeBy: 'skill', workLoad: 2, hasFlag: false, isInterruptible: true  },
    { id: 'pwi-b', customer: 'Tomás Rivera',  subject: 'On hold — waiting on warehouse stock confirmation',               caseNumber: '101356918', status: 'Paused', priority: '',       channel: 'cases', queue: 'Returns',     skill: 'Logistics',   routeBy: 'queue', workLoad: 1, hasFlag: false, isInterruptible: false },
];

const REPS_DATA = [
    { id: 1,  name: 'Gilda Ann Thomas',  status: 'online',  statusLabel: 'All Online', statusTime: 'Since 9:15am', hasFlag: true,  workSummary: '3 Cases 1 Message', channels: ['chat','call','cases'], login: '2m 5s',   state: '5m 3s',   capacityP: 100, capacityI: 100, accept: '3m 5s',   workload: '0/20', acw: '2m 4s',   queues: ['Billing','Chat','+3'],         skills: ['Billing','Refunds','+4'],            children: WORK_ITEMS },
    { id: 2,  name: 'Jerome Bell',        status: 'break',   statusLabel: 'On Break',   statusTime: 'Since 9:15am', hasFlag: false, workSummary: '2 Cases',           channels: ['call','cases'],       login: '10m 20s', state: '10m 20s', capacityP: 20,  capacityI: 35,  accept: '44m',     workload: '0/20', acw: '5m 34s',  queues: ['Sales','Returns','+2'],        skills: ['Sales','Spanish','+1'],              children: WORK_ITEMS.slice(0, 2) },
    { id: 3,  name: 'Devon Lane',         status: 'online',  statusLabel: 'All Online', statusTime: 'Since 9:15am', hasFlag: true,  workSummary: '3 Cases 1 Message', channels: ['chat','call','cases'], login: '2m 5s',   state: '5m 3s',   capacityP: 100, capacityI: 100, accept: '3m 5s',   workload: '0/20', acw: '2m 4s',   queues: ['Tech','Escalations','+4'],     skills: ['Technical','Tier 3','+3'],           children: WORK_ITEMS },
    { id: 4,  name: 'Arlene McCoy',       status: 'online',  statusLabel: 'All Online', statusTime: 'Since 9:15am', hasFlag: false, workSummary: '1 Case',            channels: ['call','cases'],       login: '8m 12s',  state: '14m 45s', capacityP: 100, capacityI: 40,  accept: '14m 45s', workload: '0/20', acw: '44m',     queues: ['VIP','Loyalty','+1'],          skills: ['Account Mgmt','French','+2'],        children: WORK_ITEMS.slice(0, 1) },
    { id: 5,  name: 'Floyd Miles',        status: 'online',  statusLabel: 'All Online', statusTime: 'Since 9:15am', hasFlag: true,  workSummary: '3 Cases 1 Message', channels: ['chat','call','cases'], login: '2m 5s',   state: '5m 3s',   capacityP: 100, capacityI: 100, accept: '3m 5s',   workload: '0/20', acw: '2m 4s',   queues: ['Onboarding','Chat','+3'],      skills: ['Onboarding','Wireless','+3'],        children: WORK_ITEMS },
    { id: 6,  name: 'Savannah Nguyen',    status: 'online',  statusLabel: 'All Online', statusTime: 'Since 9:15am', hasFlag: false, workSummary: '4 Cases',           channels: ['cases'],              login: '10m 20s', state: '1h 26m',  capacityP: 50,  capacityI: 100, accept: '5m 34s',  workload: '0/20', acw: '1h 26m',  queues: ['Cancellations','Tier 2','+2'], skills: ['Retention','Account Recovery','+2'], children: WORK_ITEMS },
    { id: 7,  name: 'Leslie Alexander',   status: 'break',   statusLabel: 'On Break',   statusTime: 'Since 9:15am', hasFlag: false, workSummary: '2 Messages',        channels: ['chat'],               login: '44m',     state: '8m 12s',  capacityP: 30,  capacityI: 50,  accept: '1h 26m',  workload: '0/20', acw: '10m 20s', queues: ['Chat','Support','+1'],         skills: ['Chat','Spanish','+2'],               children: WORK_ITEMS.slice(0, 2) },
    { id: 8,  name: 'Robert Fox',         status: 'online',  statusLabel: 'All Online', statusTime: 'Since 9:15am', hasFlag: false, workSummary: '3 Cases 1 Message', channels: ['chat','call','cases'], login: '5m 34s',  state: '10m 20s', capacityP: 50,  capacityI: 20,  accept: '7m 25s',  workload: '0/20', acw: '10m 20s', queues: ['Tier 1','Sales','+3'],         skills: ['Sales','Premium Support','+2'],      children: WORK_ITEMS },
    { id: 9,  name: 'Theresa Webb',       status: 'offline', statusLabel: 'Offline',    statusTime: 'Since 9:15am', hasFlag: false, workSummary: '1 Message',         channels: ['chat','call'],        login: '9m 02s',  state: '9m 02s',  capacityP: 30,  capacityI: 80,  accept: '14m 45s', workload: '0/20', acw: '5m 34s',  queues: ['Refunds','Billing','+1'],      skills: ['Refunds','Billing','+1'],            children: WORK_ITEMS.slice(0, 1) },
    { id: 10, name: 'Marvin McKinney',    status: 'online',  statusLabel: 'All Online', statusTime: 'Since 9:15am', hasFlag: false, workSummary: '1 Call',            channels: ['call','cases'],       login: '1h 26m',  state: '5m 34s',  capacityP: 40,  capacityI: 50,  accept: '7m 25s',  workload: '0/20', acw: '44m',     queues: ['Tech','VIP','+2'],             skills: ['Technical','Tier 2','+2'],           children: WORK_ITEMS.slice(0, 1) },
    { id: 11, name: 'Kylie Jenner',       status: 'online',  statusLabel: 'All Online', statusTime: 'Since 9:15am', hasFlag: false, workSummary: '1 Call',            channels: ['call','cases'],       login: '1h 26m',  state: '5m 34s',  capacityP: 40,  capacityI: 50,  accept: '7m 25s',  workload: '0/20', acw: '44m',     queues: ['Sales','Loyalty','+3'],        skills: ['Sales','German','+3'],               children: WORK_ITEMS.slice(0, 1) },
    { id: 12, name: 'Tom Hanks',          status: 'online',  statusLabel: 'All Online', statusTime: 'Since 9:15am', hasFlag: false, workSummary: '1 Call',            channels: ['call','cases'],       login: '1h 26m',  state: '5m 34s',  capacityP: 40,  capacityI: 50,  accept: '7m 25s',  workload: '0/20', acw: '44m',     queues: ['Escalations','Tier 3','+1'],   skills: ['Escalations','Account Mgmt','+1'],   children: WORK_ITEMS.slice(0, 1) },
    { id: 13, name: 'Eleanor Pena',       status: 'online',  statusLabel: 'All Online', statusTime: 'Since 8:42am', hasFlag: false, workSummary: '2 Cases',           channels: ['chat','cases'],       login: '3h 12m',  state: '12m 04s', capacityP: 80,  capacityI: 60,  accept: '4m 18s',  workload: '0/20', acw: '6m 12s',  queues: ['Renewals','Loyalty','+2'],     skills: ['Retention','Account Mgmt','+2'],     children: WORK_ITEMS.slice(0, 2) },
    { id: 14, name: 'Wade Warren',        status: 'break',   statusLabel: 'On Break',   statusTime: 'Since 11:02am',hasFlag: false, workSummary: '1 Case',            channels: ['call'],               login: '4h 47m',  state: '15m 20s', capacityP: 0,   capacityI: 0,   accept: '—',       workload: '0/20', acw: '9m 02s',  queues: ['Tech','Tier 2','+1'],          skills: ['Technical','Diagnostics','+1'],      children: WORK_ITEMS.slice(2, 4) },
    { id: 15, name: 'Brooklyn Simmons',   status: 'online',  statusLabel: 'All Online', statusTime: 'Since 7:55am', hasFlag: true,  workSummary: '4 Cases 2 Messages',channels: ['chat','call','cases'], login: '5h 03m',  state: '22m 47s', capacityP: 90,  capacityI: 100, accept: '2m 11s',  workload: '0/20', acw: '3m 18s',  queues: ['VIP','Billing','+3'],          skills: ['Premium Support','Billing','+3'],    children: WORK_ITEMS },
    { id: 16, name: 'Kristin Watson',     status: 'offline', statusLabel: 'Offline',    statusTime: 'Since 6:30am', hasFlag: false, workSummary: '0 Cases',           channels: ['cases'],              login: '8h 41m',  state: '8h 41m',  capacityP: 0,   capacityI: 0,   accept: '—',       workload: '0/20', acw: '—',       queues: ['Billing','Refunds'],           skills: ['Billing','Refunds'],                 children: [] },
    { id: 17, name: 'Cody Fisher',        status: 'online',  statusLabel: 'All Online', statusTime: 'Since 9:30am', hasFlag: false, workSummary: '3 Cases',           channels: ['call','cases'],       login: '2h 58m',  state: '9m 12s',  capacityP: 70,  capacityI: 85,  accept: '5m 09s',  workload: '0/20', acw: '4m 33s',  queues: ['Sales','Onboarding','+2'],     skills: ['Sales','Onboarding','+2'],           children: WORK_ITEMS.slice(0, 3) },
    { id: 18, name: 'Cameron Williamson', status: 'online',  statusLabel: 'All Online', statusTime: 'Since 10:11am',hasFlag: false, workSummary: '1 Message',         channels: ['chat'],               login: '1h 44m',  state: '6m 50s',  capacityP: 100, capacityI: 75,  accept: '3m 02s',  workload: '0/20', acw: '2m 18s',  queues: ['Chat','Support','+1'],         skills: ['Chat','German','+1'],                children: WORK_ITEMS.slice(4, 5) },
    { id: 19, name: 'Jenny Wilson',       status: 'break',   statusLabel: 'On Break',   statusTime: 'Since 11:30am',hasFlag: false, workSummary: '2 Cases',           channels: ['cases'],              login: '5h 22m',  state: '20m 10s', capacityP: 0,   capacityI: 0,   accept: '—',       workload: '0/20', acw: '7m 41s',  queues: ['Refunds','Returns','+2'],      skills: ['Refunds','Returns','+1'],            children: WORK_ITEMS.slice(5, 7) },
    { id: 20, name: 'Esther Howard',      status: 'online',  statusLabel: 'All Online', statusTime: 'Since 9:00am', hasFlag: true,  workSummary: '5 Cases 1 Message', channels: ['chat','call','cases'], login: '4h 18m',  state: '14m 02s', capacityP: 100, capacityI: 90,  accept: '1m 47s',  workload: '0/20', acw: '5m 50s',  queues: ['Escalations','VIP','+3'],      skills: ['Escalations','Premium','+3'],        children: WORK_ITEMS },
    { id: 21, name: 'Guy Hawkins',        status: 'offline', statusLabel: 'Offline',    statusTime: 'Since 5:00am', hasFlag: false, workSummary: '0 Cases',           channels: ['call','cases'],       login: '9h 15m',  state: '9h 15m',  capacityP: 0,   capacityI: 0,   accept: '—',       workload: '0/20', acw: '—',       queues: ['Tier 1','Sales'],              skills: ['Sales','Cold Calls'],                children: [] },
    { id: 22, name: 'Bessie Cooper',      status: 'online',  statusLabel: 'All Online', statusTime: 'Since 8:15am', hasFlag: false, workSummary: '2 Cases 1 Call',    channels: ['call','cases'],       login: '3h 50m',  state: '11m 17s', capacityP: 60,  capacityI: 70,  accept: '4m 22s',  workload: '0/20', acw: '6m 04s',  queues: ['Cancellations','Tier 2','+1'], skills: ['Retention','Negotiation','+1'],      children: WORK_ITEMS.slice(0, 2) },
    { id: 23, name: 'Albert Flores',      status: 'online',  statusLabel: 'All Online', statusTime: 'Since 9:45am', hasFlag: false, workSummary: '1 Case',            channels: ['cases'],              login: '2h 22m',  state: '7m 33s',  capacityP: 50,  capacityI: 100, accept: '6m 11s',  workload: '0/20', acw: '8m 25s',  queues: ['Tech','Diagnostics','+1'],     skills: ['Technical','Tier 3','+2'],           children: WORK_ITEMS.slice(1, 2) },
    { id: 24, name: 'Ronald Richards',    status: 'break',   statusLabel: 'On Break',   statusTime: 'Since 10:45am',hasFlag: false, workSummary: '1 Message',         channels: ['chat','cases'],       login: '6h 02m',  state: '18m 09s', capacityP: 0,   capacityI: 0,   accept: '—',       workload: '0/20', acw: '4m 17s',  queues: ['Chat','Billing','+1'],         skills: ['Chat','Billing','+1'],               children: WORK_ITEMS.slice(2, 3) },
    { id: 25, name: 'Dianne Russell',     status: 'online',  statusLabel: 'All Online', statusTime: 'Since 7:30am', hasFlag: false, workSummary: '3 Cases 1 Call',    channels: ['chat','call','cases'], login: '5h 11m',  state: '13m 44s', capacityP: 85,  capacityI: 95,  accept: '2m 33s',  workload: '0/20', acw: '3m 22s',  queues: ['VIP','Loyalty','+3'],          skills: ['Premium','French','+3'],             children: WORK_ITEMS.slice(0, 3) },
    { id: 26, name: 'Jacob Jones',        status: 'online',  statusLabel: 'All Online', statusTime: 'Since 9:20am', hasFlag: true,  workSummary: '2 Cases',           channels: ['call','cases'],       login: '3h 33m',  state: '10m 02s', capacityP: 75,  capacityI: 50,  accept: '3m 48s',  workload: '0/20', acw: '5m 11s',  queues: ['Escalations','Tier 3','+2'],   skills: ['Escalations','Diagnostics','+2'],    children: WORK_ITEMS.slice(5, 7) },
    { id: 27, name: 'Annette Black',      status: 'online',  statusLabel: 'All Online', statusTime: 'Since 8:50am', hasFlag: false, workSummary: '1 Message',         channels: ['chat'],               login: '2h 41m',  state: '5m 28s',  capacityP: 100, capacityI: 65,  accept: '4m 01s',  workload: '0/20', acw: '2m 47s',  queues: ['Chat','Support'],              skills: ['Chat','Spanish','+1'],               children: WORK_ITEMS.slice(3, 4) },
    { id: 28, name: 'Courtney Henry',     status: 'offline', statusLabel: 'Offline',    statusTime: 'Since 4:15am', hasFlag: false, workSummary: '0 Cases',           channels: ['cases'],              login: '10h 20m', state: '10h 20m', capacityP: 0,   capacityI: 0,   accept: '—',       workload: '0/20', acw: '—',       queues: ['Billing','Refunds'],           skills: ['Billing','Refunds'],                 children: [] },
    { id: 29, name: 'Darlene Robertson',  status: 'online',  statusLabel: 'All Online', statusTime: 'Since 9:05am', hasFlag: false, workSummary: '4 Cases 2 Messages',channels: ['chat','call','cases'], login: '4h 27m',  state: '16m 50s', capacityP: 95,  capacityI: 80,  accept: '2m 18s',  workload: '0/20', acw: '4m 09s',  queues: ['Onboarding','VIP','+3'],       skills: ['Onboarding','Premium','+3'],         children: WORK_ITEMS },
    { id: 30, name: 'Ralph Edwards',      status: 'break',   statusLabel: 'On Break',   statusTime: 'Since 11:20am',hasFlag: false, workSummary: '1 Case',            channels: ['cases'],              login: '7h 14m',  state: '25m 11s', capacityP: 0,   capacityI: 0,   accept: '—',       workload: '0/20', acw: '11m 47s', queues: ['Returns','Refunds','+1'],      skills: ['Returns','Refunds','+1'],            children: WORK_ITEMS.slice(7, 8) },
    { id: 31, name: 'Jane Cooper',        status: 'online',  statusLabel: 'All Online', statusTime: 'Since 8:25am', hasFlag: false, workSummary: '3 Cases 1 Call',    channels: ['call','cases'],       login: '5h 49m',  state: '8m 17s',  capacityP: 65,  capacityI: 100, accept: '5m 03s',  workload: '0/20', acw: '6m 38s',  queues: ['Sales','Loyalty','+2'],        skills: ['Sales','Italian','+2'],              children: WORK_ITEMS.slice(0, 3) },
    { id: 32, name: 'Pamela Howard',      status: 'online',  statusLabel: 'All Online', statusTime: 'Since 9:55am', hasFlag: true,  workSummary: '2 Cases',           channels: ['chat','cases'],       login: '2h 06m',  state: '9m 45s',  capacityP: 100, capacityI: 100, accept: '1m 58s',  workload: '0/20', acw: '3m 03s',  queues: ['Escalations','VIP','+2'],      skills: ['Escalations','Premium','+2'],        children: WORK_ITEMS.slice(0, 2) },
].map((rep) => ({
    // Surface paused work items only on reps carrying the full active set, so
    // the collapsible "Paused Work Items" section appears on the busier rows
    // rather than every single rep in the demo.
    ...rep,
    pausedChildren: (rep.children?.length ?? 0) >= 3 ? PAUSED_WORK_ITEMS : [],
}));

// New-arrival items cycled into the In-Progress table on each tab visit.
const NEW_IP_ARRIVALS = [
    { id: 'ip-new-a', channel: 'chat',     subject: 'Billing dispute — incorrect charge',    caseNumber: '100799001', priority: 'High',   status: 'New',     assignedTo: 'Dana Bose',       isAgent: false, avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg', routeBy: 'Skills-Based', routeByIcon: 'utility:skill',      hasFlag: false, sentiment: 'bad',     workSize: 4, isInterruptible: false, handleTime: '—',   assignedTime: 'Just now', speedToAnswer: '—', acceptedTime: '—', queue: 'Billing',      team: 'Tier 1', skills: ['Billing','Refunds']       },
    { id: 'ip-new-b', channel: 'call',     subject: 'Password reset not arriving via SMS',   caseNumber: '100799002', priority: 'Medium', status: 'New',     assignedTo: 'Ethan Brooks',    isAgent: false, avatarUrl: 'https://randomuser.me/api/portraits/men/45.jpg',  routeBy: 'Most Available', routeByIcon: 'utility:skill',   hasFlag: false, sentiment: 'neutral', workSize: 2, isInterruptible: true,  handleTime: '—',   assignedTime: 'Just now', speedToAnswer: '—', acceptedTime: '—', queue: 'Tech Support', team: 'AMER',   skills: ['Technical','Tier 3']     },
    { id: 'ip-new-c', channel: 'email',    subject: 'Refund request for cancelled order',    caseNumber: '100799003', priority: '',       status: 'Working', assignedTo: 'Marcus Cole',     isAgent: false, avatarUrl: 'https://randomuser.me/api/portraits/men/76.jpg',  routeBy: 'Round Robin',    routeByIcon: 'utility:work_queue', hasFlag: false, sentiment: 'good',    workSize: 3, isInterruptible: true,  handleTime: '—',   assignedTime: 'Just now', speedToAnswer: '—', acceptedTime: '—', queue: 'Returns',      team: 'SMB',    skills: ['Refunds','Account Mgmt'] },
    { id: 'ip-new-d', channel: 'messaging',subject: 'App crash on checkout — iOS 18',       caseNumber: '100799004', priority: 'High',   status: 'New',     assignedTo: 'Triage Agent',    isAgent: true,  routeBy: 'Direct to Agent', routeByIcon: null,                                  hasFlag: true,  sentiment: 'terrible',workSize: 7, isInterruptible: false, handleTime: '—',   assignedTime: 'Just now', speedToAnswer: '—', acceptedTime: '—', queue: 'Escalations',  team: 'Tier 2', skills: ['Technical','Diagnostics'] },
    { id: 'ip-new-e', channel: 'cases',    subject: 'Duplicate invoice sent — 2 charges',   caseNumber: '100799005', priority: 'Medium', status: 'New',     assignedTo: 'Olivia Bennett',  isAgent: false, avatarUrl: 'https://i.pravatar.cc/64?img=14',                 routeBy: 'Most Idle',      routeByIcon: 'utility:work_queue', hasFlag: false, sentiment: 'bad',     workSize: 5, isInterruptible: false, handleTime: '—',   assignedTime: 'Just now', speedToAnswer: '—', acceptedTime: '—', queue: 'Billing',      team: 'EMEA',   skills: ['Billing','Account Mgmt'] },
];

// New-arrival items cycled into the Backlog table on each tab visit.
const NEW_BKT_ARRIVALS = [
    { id: 'ip-new-f', channel: 'chat',  subject: 'Cannot log in after password change',     caseNumber: '100799006', priority: 'High',   status: 'New',    assignedTo: 'Aisha Khan',     isAgent: false, avatarUrl: 'https://randomuser.me/api/portraits/women/63.jpg', routeBy: 'Skills-Based',   routeByIcon: 'utility:skill',      hasFlag: false, sentiment: 'bad',     workSize: 3, isInterruptible: false, handleTime: '—', assignedTime: 'Just now', speedToAnswer: '—', acceptedTime: '—', queue: 'Tech Support',  team: 'APAC',   skills: ['Technical','Account Mgmt'] },
    { id: 'ip-new-g', channel: 'cases', subject: 'Wrong item shipped — exchange needed',    caseNumber: '100799007', priority: 'Medium', status: 'New',    assignedTo: 'Renewal Agent',  isAgent: true,  routeBy: 'Direct to Agent', routeByIcon: null,                                  hasFlag: false, sentiment: 'neutral', workSize: 2, isInterruptible: true,  handleTime: '—', assignedTime: 'Just now', speedToAnswer: '—', acceptedTime: '—', queue: 'Returns',       team: 'Tier 1', skills: ['Refunds','Onboarding']     },
    { id: 'ip-new-h', channel: 'email', subject: 'GDPR data access request — urgent',       caseNumber: '100799008', priority: 'High',   status: 'New',    assignedTo: 'Isabella Reed',  isAgent: false, avatarUrl: 'https://i.pravatar.cc/64?img=24',                 routeBy: 'Round Robin',    routeByIcon: 'utility:work_queue', hasFlag: false, sentiment: 'bad',     workSize: 6, isInterruptible: false, handleTime: '—', assignedTime: 'Just now', speedToAnswer: '—', acceptedTime: '—', queue: 'Escalations',   team: 'EMEA',   skills: ['Tier 3','Account Mgmt']    },
    { id: 'ip-new-i', channel: 'call',  subject: 'Overcharged — requesting callback',       caseNumber: '100799009', priority: '',       status: 'New',    assignedTo: 'Bay Assist Agent',isAgent: true,  routeBy: 'Direct to Agent', routeByIcon: null,                                  hasFlag: false, sentiment: 'neutral', workSize: 4, isInterruptible: true,  handleTime: '—', assignedTime: 'Just now', speedToAnswer: '—', acceptedTime: '—', queue: 'Billing',       team: 'Tier 2', skills: ['Billing','Refunds']         },
    { id: 'ip-new-j', channel: 'chat',  subject: 'Promo discount not applied at checkout',  caseNumber: '100799010', priority: 'Medium', status: 'New',    assignedTo: 'Lucas Bailey',   isAgent: false, avatarUrl: 'https://i.pravatar.cc/64?img=26',                 routeBy: 'Most Available', routeByIcon: 'utility:skill',      hasFlag: false, sentiment: 'good',    workSize: 1, isInterruptible: true,  handleTime: '—', assignedTime: 'Just now', speedToAnswer: '—', acceptedTime: '—', queue: 'Loyalty',       team: 'SMB',    skills: ['Sales','Retention']        },
];

export default class ServiceReps extends LightningElement {
    activeTab = 'wallboard';
    reps = REPS_DATA;
    @track repView = 'accordion';

    // Counters cycling through the arrival pools on each tab visit.
    _ipArrivalIdx  = 0;
    _bktArrivalIdx = 0;
    // Extra rows prepended to each table; reset on tab switch to avoid stale
    // rows accumulating across multiple visits in one session.
    @track _extraIpRow    = null;
    @track _extraBktRow   = null;
    // ID passed to the table as new-row-id so it can apply the animation class.
    @track _ipNewRowId    = null;
    @track _bktNewRowId   = null;

    // ── In-Progress toolbar quick-toggles + filter trigger state ───────────
    // Per the new Figma mock, the multi-facet drawer covers the 6 listed
    // facets only; AI/Human quick-filtering stays in the page toolbar
    // (high-frequency action, lives alongside the search input). These two
    // booleans drive the toolbar button variants and pre-filter the data
    // the table receives. They compose with the drawer's facet filters
    // because the table just filters whatever array it's given.
    @track aiFilterActive    = false;
    @track humanFilterActive = false;

    // Mirror of the table's inline-drawer open state.
    @track inProgressFilterOpen = false;

    // Chip array mirrored from the table via `filterchange` events.
    @track inProgressFilterChips = [];
    // Number of chips that fit before the 100px gap; computed in renderedCallback.
    @track _visibleChipCount = 999;

    get hasInProgressFilterChips() { return this.inProgressFilterChips.length > 0; }
    get visibleChips()    { return this.inProgressFilterChips.slice(0, this._visibleChipCount); }
    get overflowCount()   { return Math.max(0, this.inProgressFilterChips.length - this._visibleChipCount); }
    get hasOverflowChips(){ return this.overflowCount > 0; }
    get overflowLabel()   { return `+${this.overflowCount} more`; }

    // Source list, optionally narrowed by the AI/Human quick-toggles. The
    // table further narrows by its own multi-facet drawer state and search.
    get inProgressItems() {
        const base = this.aiFilterActive    ? IN_PROGRESS_ITEMS.filter(i => i.isAgent)
                   : this.humanFilterActive ? IN_PROGRESS_ITEMS.filter(i => !i.isAgent)
                   : IN_PROGRESS_ITEMS;
        return this._extraIpRow ? [this._extraIpRow, ...base] : base;
    }

    get inProgressCount() {
        return this.inProgressItems.length;
    }

    // Button-variant getters — `brand` when toggled / open, `border-filled`
    // otherwise. Matches the bordered + brand-tinted state in Figma.
    get aiFilterVariant()      { return this.aiFilterActive    ? 'brand' : 'border-filled'; }
    get humanFilterVariant()   { return this.humanFilterActive ? 'brand' : 'border-filled'; }
    get filterPanelVariant()   { return this.inProgressFilterOpen ? 'brand' : 'border-filled'; }

    // Backlog tab — same source + AI/Human filter, mapped into the
    // backlog-table row shape. Customer names + accept-by times are
    // synthesized from a fixed list so the column reads naturally for the
    // demo while the rest of the row passes through from the source item.
    get backlogItems() {
        const PRIORITY_RANK = { Critical: 1, High: 1, Medium: 2, Low: 3 };
        const CUSTOMER_NAMES = [
            'Savannah Nguyen', 'Dianne Russell', 'Cody Fisher', 'Courtney Henry',
            'Leslie Alexander', 'Arlene McCoy', 'Bessie Cooper', 'Jacob Jones',
            'Darlene Robertson', 'Wade Warren', 'Floyd Miles', 'Albert Flores',
        ];
        const ACCEPT_BY = [
            '6:20 am', '7:30 am', '7:30 am', '7:30 am', '5:40 am', '6:45 am',
            '5:40 am', '5:45 am', '7:30 am', '5:55 am', '5:45 am', '5:40 am',
        ];
        // Short, subject-line-style conversation summaries for the Backlog
        // table. Each is kept ≤ ~45 chars so the composed
        //   "summary | status | <priority> Priority"
        // string fits inside the 530px Conversation Summary column without
        // truncating. Cycled by source index so behavior is stable across
        // renders / infinite-scroll clones.
        const CONVERSATION_SUMMARIES = [
            'Refund request — damaged shipment',
            'Auto-renewal failed — expired card',
            'Account locked after failed logins',
            'Pricing inquiry — enterprise tier',
            'Order undelivered after 10 days',
            'Return policy on opened software',
            'Login redirect loop after SSO change',
            'April invoice overcharge — $42.50',
            'Workspace access lost after admin change',
            'Mobile app crashing on launch',
            'Plan upgrade — Pro to Business',
            'Two-factor SMS not arriving in EU',
            'Bulk export hitting 60s timeout',
            'GDPR data deletion request',
            'Duplicate contacts in Salesforce sync',
            'API rate limit blocking nightly sync',
            'Cancellation request — moving away',
            'Discount code BLACKFRIDAY24 broken',
            'Resend invoice — flagged as spam',
            'Session ends after 5 min idle',
            'Custom report missing forecast field',
            'Cannot share dashboard externally',
            'Webhook deliveries failing — 504s',
            'Add-on purchase email never arrived',
            'Trial extension request',
            'Org merge — parent-child migration',
            'Okta SSO returning invalid_grant',
            'Bulk-edit support for line items',
            'Notification prefs reset each session',
            'Password reset link expires too fast',
            'Account compromise — login from BR',
            'Storage quota near limit',
        ];
        // AI-routed rows never display "Direct to Agent" in the Backlog —
        // instead they cycle through a realistic mix of queue and skill
        // destinations. Human-routed rows show the assigned rep's name with
        // their avatar (kind: 'human').
        const AI_ROUTE_TARGETS = [
            { kind: 'queue', name: 'Product Support' },
            { kind: 'skill', name: 'Account Manager' },
            { kind: 'queue', name: 'Voicebot Support' },
            { kind: 'skill', name: 'Technical Support' },
            { kind: 'skill', name: 'Sentiment Analysis' },
            { kind: 'queue', name: 'Predictive Support' },
            { kind: 'queue', name: 'Social Media Inquiries' },
        ];
        // Backlog still applies the legacy AI/Human filter quick-toggles, which
        // we kept off the In-Progress tab. For now Backlog reads the unfiltered
        // source — a follow-up could give Backlog its own filter panel.
        const source = this._extraBktRow
            ? [this._extraBktRow, ...IN_PROGRESS_ITEMS]
            : IN_PROGRESS_ITEMS;
        let aiCounter = 0;
        return source.map((item, index) => {
            let routeKind;
            let routeDisplay;
            if (item.isAgent) {
                const target = AI_ROUTE_TARGETS[aiCounter % AI_ROUTE_TARGETS.length];
                aiCounter += 1;
                routeKind = target.kind;
                routeDisplay = target.name;
            } else {
                routeKind = 'human';
                routeDisplay = item.assignedTo ?? '';
            }
            return {
                id: item.id,
                priorityRank: PRIORITY_RANK[item.priority] ?? 3,
                customerName: CUSTOMER_NAMES[index % CUSTOMER_NAMES.length],
                subject: CONVERSATION_SUMMARIES[index % CONVERSATION_SUMMARIES.length],
                channel: item.channel,
                routeKind,
                routeDisplay,
                isAgent: item.isAgent,
                assignedTo: item.assignedTo,
                avatarUrl: item.avatarUrl,
                sentiment: item.sentiment,
                workSize: item.workSize,
                isInterruptible: item.isInterruptible,
                status: item.status,
                priority: item.priority,
                waitTime: item.handleTime,
                requestedTime: item.assignedTime,
                acceptBy: ACCEPT_BY[index % ACCEPT_BY.length],
            };
        });
    }

    get backlogCount() {
        return this.backlogItems.length;
    }

    // ── Rep view toggle (Accordion / Panel) ───────────────────────────────
    get isRepViewAccordion()    { return this.repView === 'accordion'; }
    get isRepViewPanel()        { return this.repView === 'panel'; }
    get accordionBtnVariant()   { return this.repView === 'accordion' ? 'brand' : 'neutral'; }
    get panelBtnVariant()       { return this.repView === 'panel'     ? 'brand' : 'neutral'; }

    handleRepViewChange(event) {
        const view = event.currentTarget.dataset.view;
        if (view) this.repView = view;
    }

    // ── Tab bar getters ────────────────────────────────────────────────────
    get isWallboard()   { return this.activeTab === 'wallboard'; }
    get isServiceReps() { return this.activeTab === 'service-reps'; }
    get isInProgress()  { return this.activeTab === 'in-progress'; }
    get isBacklog()     { return this.activeTab === 'backlog'; }

    get tabClassWallboard()   { return this._tabClass('wallboard'); }
    get tabClassServiceReps() { return this._tabClass('service-reps'); }
    get tabClassInProgress()  { return this._tabClass('in-progress'); }
    get tabClassBacklog()     { return this._tabClass('backlog'); }

    _tabClass(tab) {
        return `sr-tab${this.activeTab === tab ? ' sr-tab--active' : ''}`;
    }

    handleTabClick(event) {
        const tab = event.currentTarget.dataset.tab;
        if (tab && tab !== this.activeTab) this._onTabActivated(tab);
    }

    _onTabActivated(tab) {
        this.activeTab = tab;

        if (tab === 'in-progress') {
            const arrival = NEW_IP_ARRIVALS[this._ipArrivalIdx % NEW_IP_ARRIVALS.length];
            this._ipArrivalIdx += 1;
            this._extraIpRow  = null;
            this._ipNewRowId  = null;
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(() => {
                this._extraIpRow = arrival;
                this._ipNewRowId = arrival.id;
            }, 800);
        }

        if (tab === 'backlog') {
            const arrival = NEW_BKT_ARRIVALS[this._bktArrivalIdx % NEW_BKT_ARRIVALS.length];
            this._bktArrivalIdx += 1;
            this._extraBktRow = null;
            this._bktNewRowId = null;
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(() => {
                this._extraBktRow = arrival;
                this._bktNewRowId = arrival.id;
            }, 800);
        }
    }

    // Mutually-exclusive quick-toggles: turning AI on turns Human off (and
    // vice versa). Third click of the same button switches it off. This is
    // the same UX the toolbar had before the filter drawer was introduced.
    handleAiFilterToggle() {
        this.aiFilterActive    = !this.aiFilterActive;
        if (this.aiFilterActive) this.humanFilterActive = false;
    }
    handleHumanFilterToggle() {
        this.humanFilterActive = !this.humanFilterActive;
        if (this.humanFilterActive) this.aiFilterActive = false;
    }

    // Toolbar filter button -> imperative @api on <ui-in-progress-table>. The
    // table component owns the filter panel + applied state; the page only
    // forwards the click. `toggleFilterPanel` so the same button closes the
    // drawer on second click. Guarded with optional chaining since the table
    // is only rendered when the In-Progress tab is the active one.
    handleToggleInProgressFilter() {
        const table = this.template.querySelector('ui-in-progress-table');
        table?.toggleFilterPanel?.();
    }

    handleInProgressPanelChange(event) {
        this.inProgressFilterOpen = !!event.detail?.open;
    }

    handleInProgressFilterChange(event) {
        this.inProgressFilterChips = event.detail?.chips ?? [];
        // Reset to show all so renderedCallback can re-measure.
        this._visibleChipCount = 999;
    }

    // lightning-pill fires onremove with event.detail.item.name = the pill's name attr.
    handleChipRemove(event) {
        const id = event.detail?.item?.name ?? event.currentTarget?.dataset?.facet;
        if (!id) return;
        const table = this.template.querySelector('ui-in-progress-table');
        table?.clearFacet?.(id);
    }

    handleChipClearAll() {
        const table = this.template.querySelector('ui-in-progress-table');
        table?.clearAllFilters?.();
    }

    renderedCallback() {
        // Use rAF to measure after paint so pill widths are finalised.
        // _measureScheduled prevents stacking multiple rAF calls per render.
        if (this._measureScheduled) return;
        this._measureScheduled = true;
        requestAnimationFrame(() => {
            this._measureScheduled = false;
            this._measureChipOverflow();
        });
    }

    _measureChipOverflow() {
        if (!this.hasInProgressFilterChips) return;
        const left = this.template.querySelector('.ipt-toolbar-left');
        const controls = this.template.querySelector('.ipt-controls');
        if (!left || !controls) return;

        const leftRect = left.getBoundingClientRect();
        const controlsRect = controls.getBoundingClientRect();
        // Available width = space between the left section and the controls,
        // minus 100px clearance required by the spec.
        const available = controlsRect.left - leftRect.left - 100;

        const countEl = this.template.querySelector('.ipt-toolbar-count');
        let usedWidth = countEl ? countEl.getBoundingClientRect().width + 4 : 0;

        const pills = this.template.querySelectorAll('.ipt-pill');
        let fits = 0;
        for (let i = 0; i < pills.length; i++) {
            const w = pills[i].getBoundingClientRect().width + 4; // 4px gap
            if (usedWidth + w <= available) {
                usedWidth += w;
                fits = i + 1;
            } else {
                break;
            }
        }

        const total = this.inProgressFilterChips.length;
        const next = fits < total ? fits : total;
        if (next !== this._visibleChipCount) {
            this._visibleChipCount = next;
        }
    }
}
