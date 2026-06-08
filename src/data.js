// ─── COUNTERS ───────────────────────────────────
let _id = 1000;
export const uid = () => String(++_id);

// ─── HELPERS ────────────────────────────────────
export function parseDollar(v) {
  const n = parseFloat(String(v || '').replace(/[^0-9.]/g, ''));
  return isNaN(n) ? null : n;
}
export function fmt$(v) {
  const n = parseDollar(v);
  return n === null ? '—' : '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}
export function fmtHrs(v) {
  const n = parseFloat(String(v || '').replace(/[^0-9.]/g, ''));
  return isNaN(n) ? '—' : n + ' hrs';
}

// ─── CONFIG ─────────────────────────────────────
export const PRIORITY = {
  emergency: { label: '🔴 Emergency', color: '#b50000', bg: '#fff0f0', border: '#ffaaaa' },
  soon:      { label: '🟡 Soon',      color: '#9a5500', bg: '#fff8ee', border: '#f5c842' },
  whenever:  { label: '🟢 Whenever',  color: '#1a6b3a', bg: '#eaf5ee', border: '#80c8a0' },
};
export const STATUS = {
  todo:       { label: 'Not Started', color: '#777' },
  inprogress: { label: 'In Progress', color: '#9a5500' },
  done:       { label: 'Done',        color: '#1a6b3a' },
};
export const STATUS_BADGE = {
  primary:   { label: '⭐ Primary',    bg: '#fff8ee', color: '#9a5500', border: '#f5c842' },
  alternate: { label: '🔄 Alternate',  bg: '#eef3ff', color: '#1a3a6b', border: '#aac0f0' },
  exploring: { label: '🔍 Exploring',  bg: '#eaf5ee', color: '#1a6b3a', border: '#80c8a0' },
  paused:    { label: '⏸ Paused',     bg: '#f8f8f8', color: '#888',    border: '#ccc' },
  eliminated:{ label: '✕ Eliminated', bg: '#fff0f0', color: '#b50000', border: '#ffaaaa' },
};
export const DRAWING_TYPES = ['Architectural Rendering', 'Blueprint / Floor Plan', 'Site Plan', 'Survey', 'Structural Drawing', 'Electrical Plan', 'Plumbing Plan', 'Permit Document', 'Other'];
export const REL = {
  primary:       { label: '🏛 Primary Building',     color: '#1a3a6b', bg: '#eef3ff' },
  connected:     { label: '🔗 Connected / Attached', color: '#1a6b3a', bg: '#eaf5ee' },
  adjacent:      { label: '📐 Adjacent Lot',         color: '#9a5500', bg: '#fff8ee' },
  across_street: { label: '🅿 Across the Street',    color: '#555',    bg: '#f4f0e8' },
  other:         { label: '📍 Other Parcel',         color: '#888',    bg: '#f8f8f8' },
};
export const CONS = {
  anchor:               { label: '⚓ Anchor Parcel',             color: '#1a3a6b' },
  recommended:          { label: '✅ Consolidation Recommended', color: '#1a6b3a' },
  easement_recommended: { label: '📝 Easement Needed',          color: '#9a5500' },
  not_applicable:       { label: '—',                           color: '#aaa' },
  done:                 { label: '✓ Consolidated',              color: '#1a6b3a' },
};
export const CHECKLIST_ITEMS = [
  { id:'cv',  label:'Open Violations / Municipal Summons',           cat:'Legal & Compliance' },
  { id:'cp',  label:'Permits – Pull & File All Required',            cat:'Legal & Compliance' },
  { id:'cz',  label:'Zoning Confirmation & Certificate of Occupancy',cat:'Legal & Compliance' },
  { id:'ct',  label:'Title Search & Lien Review',                    cat:'Legal & Compliance' },
  { id:'ci',  label:'Property Insurance – Current & Adequate',       cat:'Legal & Compliance' },
  { id:'cx',  label:'Property Taxes – Confirm Current / Arrears',    cat:'Legal & Compliance' },
  { id:'ce',  label:'Electrical – Inspection & Panel Review',        cat:'Building Systems' },
  { id:'cpl', label:'Plumbing – Leaks, Fixtures, Sewer',             cat:'Building Systems' },
  { id:'ch',  label:'HVAC – Heating & Cooling Condition',            cat:'Building Systems' },
  { id:'cr',  label:'Roof – Condition, Leaks, Drainage',             cat:'Building Systems' },
  { id:'cs',  label:'Structural – Foundation, Walls, Floors',        cat:'Building Systems' },
  { id:'cl',  label:'Lighting – Interior & Exterior',                cat:'Building Systems' },
  { id:'ck',  label:'Security – Locks, Cameras, Fencing',            cat:'Building Systems' },
  { id:'cf',  label:'Fire Safety – Sprinklers, Alarms',              cat:'Building Systems' },
  { id:'cm',  label:'Environmental – Mold, Asbestos, Hazmat',        cat:'Environmental' },
  { id:'cu',  label:'Underground Storage Tanks – Confirm Status',    cat:'Environmental' },
  { id:'cd',  label:'Site Drainage & Grading',                       cat:'Environmental' },
  { id:'ctr', label:'Trash Removal & Dumpster Service',              cat:'Exterior & Site' },
  { id:'cla', label:'Landscaping & Grounds Cleanup',                 cat:'Exterior & Site' },
  { id:'cpa', label:'Parking Lot – Condition, Striping, Lighting',   cat:'Exterior & Site' },
  { id:'csg', label:'Signage – Existing Condition / Removal',        cat:'Exterior & Site' },
  { id:'cfa', label:'Facade & Exterior Repairs',                     cat:'Exterior & Site' },
  { id:'cut', label:'Utilities – Water, Gas, Electric Confirmed',    cat:'Utilities' },
  { id:'cit', label:'Internet / Telecom – Service Available',        cat:'Utilities' },
  { id:'ctn', label:'Tenant Status – Leases, Holdovers, Vacancies',  cat:'Occupancy' },
  { id:'cco', label:'Key Contacts – Contractor, Attorney, Inspector',cat:'Occupancy' },
];
export const CHECKLIST_CATS = [...new Set(CHECKLIST_ITEMS.map(i => i.cat))];
export const COMPARE_ROWS = [
  { key:'summary',      label:'Concept Summary',         type:'text'   },
  { key:'status',       label:'Status',                  type:'badge'  },
  { key:'capex',        label:'Est. Upfront Capital',    type:'text'   },
  { key:'timeline',     label:'Timeline to Revenue',     type:'text'   },
  { key:'monthlyIncome',label:'Est. Monthly Income',     type:'text'   },
  { key:'roi',          label:'Est. ROI / Cap Rate',     type:'text'   },
  { key:'difficulty',   label:'Execution Difficulty',    type:'rating' },
  { key:'permitRisk',   label:'Permitting / Zoning Risk',type:'rating' },
  { key:'marketDemand', label:'Market Demand',           type:'rating' },
  { key:'bossInterest', label:'Boss Interest Level',     type:'rating' },
  { key:'pros',         label:'✅ Pros',                 type:'list'   },
  { key:'cons',         label:'❌ Cons',                 type:'list'   },
  { key:'notes',        label:'Additional Notes',        type:'text'   },
];
export const FIN_FIELDS = [
  { key:'purchasePrice',      label:'Purchase Price',              group:'Value'     },
  { key:'currentValue',       label:'Current Market Value',        group:'Value'     },
  { key:'projectedValue',     label:'Projected Value (Post-Impr)', group:'Value'     },
  { key:'mortgageBalance',    label:'Mortgage / Debt Balance',     group:'Debt'      },
  { key:'monthlyDebtService', label:'Monthly Debt Service',        group:'Debt'      },
  { key:'monthlyIncome',      label:'Monthly Gross Income',        group:'Cash Flow' },
  { key:'monthlyExpenses',    label:'Monthly Operating Expenses',  group:'Cash Flow' },
  { key:'repairBudget',       label:'Total Repair / Rehab Budget', group:'Rehab'     },
  { key:'spentToDate',        label:'Money Spent to Date',         group:'Rehab'     },
];
export const FIN_GROUPS = [...new Set(FIN_FIELDS.map(f => f.group))];

// ─── DEFAULT BUILDERS ───────────────────────────
export function defChecklist() {
  return CHECKLIST_ITEMS.map(i => ({ ...i, done: false, na: false, note: '' }));
}
export function defFinancials() {
  return { purchasePrice:'', currentValue:'', projectedValue:'', mortgageBalance:'',
           monthlyDebtService:'', monthlyIncome:'', monthlyExpenses:'', repairBudget:'', spentToDate:'', notes:'' };
}
export function defStrategy(name = 'New Strategy', status = 'exploring') {
  return { id: uid(), name, status, summary:'', capex:'', timeline:'', monthlyIncome:'', roi:'',
           difficulty:0, permitRisk:0, marketDemand:0, bossInterest:0, pros:'', cons:'', notes:'' };
}
export function defParcel(idx) {
  return { id: uid(), label:`Parcel ${idx+1}`, address:'', blockLot:'', zone:'', sqft:'',
           use:'', relationship:'adjacent', consolidationStatus:'not_applicable', notes:'' };
}
export function defDrawing() {
  return { id: uid(), label:'', type:'Architectural Rendering', date:'', link:'', notes:'' };
}
export function defWorker(name, role, payType) {
  return { id: uid(), name, role, paymentType: payType, phone:'', notes:'',
           advances:[], assignments:[] };
}
export function defProperty(id, name, location) {
  return { id, name, location, zone:'', strategy:'', notes:'',
           docs:[], drawings:[], photos:[], tasks:[], checklist: defChecklist(),
           financials: defFinancials(), strategies:[], parcels:[], neighbors:[] };
}

// ─── FINANCIAL CALCS ────────────────────────────
export const calcNOI = fin => {
  const i = parseDollar(fin.monthlyIncome), e = parseDollar(fin.monthlyExpenses);
  return i !== null && e !== null ? (i - e) * 12 : null;
};
export const calcEquity = fin => {
  const v = parseDollar(fin.currentValue), d = parseDollar(fin.mortgageBalance);
  return v !== null && d !== null ? v - d : null;
};
export const calcRehabLeft = fin => {
  const b = parseDollar(fin.repairBudget), s = parseDollar(fin.spentToDate);
  return b !== null && s !== null ? b - s : null;
};
export const calcSavings = task => {
  const m = parseDollar(task.marketRate), a = parseDollar(task.actualCost);
  return m !== null && a !== null ? m - a : null;
};
export const calcTimeSaved = task => {
  const p = parseFloat(task.proTime || ''), a = parseFloat(task.actualTime || '');
  return !isNaN(p) && !isNaN(a) ? p - a : null;
};

// ─── GOOGLE DRIVE URL CONVERTER ─────────────────
export function convertDriveUrl(url) {
  const m = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return `https://drive.google.com/uc?export=view&id=${m[1]}`;
  const m2 = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (m2) return `https://drive.google.com/uc?export=view&id=${m2[1]}`;
  return url;
}

// ─── SEED DATA ──────────────────────────────────
function t(text, priority = 'soon', assignee = 'Moshe', note = '', cost = '',
           marketRate = '', actualCost = '', proTime = '', actualTime = '') {
  return { id: uid(), text, priority, status: 'todo', assignee, note, cost,
           marketRate, actualCost, proTime, actualTime };
}
function s(name, status = 'exploring') { return { ...defStrategy(name, status) }; }

export function seedData() {
  const properties = [
    { ...defProperty('ARM','Atlantic Ave Armory','Atlantic City, NJ'),
      zone:'RM-1', strategy:'🏛 Anchor Property | Entitlement Flip',
      notes:'One of two anchor properties in AC. RM-1 zoned armory. Boss confirmed entitlement-and-sell strategy.',
      tasks:[
        t('Finalize entitlement/permitting scope','soon','Moshe'),
        t('Identify potential buyers post-entitlement','whenever','Boss'),
      ],
      strategies:[s('Entitlement & Sell','primary'),s('Self-Storage Conversion'),s('Maker Campus')],
    },
    { ...defProperty('NCA','S. North Carolina Ave Complex','Atlantic City, NJ – Boardwalk-adjacent'),
      zone:'CRDA Corridor', strategy:'🚨 UNSAFE BUILDING NOTICE — ACT NOW | 🎱 Billiards Club',
      notes:'🚨 URGENT: City has posted Unsafe Building notice on main building. Respond before deadline.\n\n36-year anchor property. Boss vision: billiards club + restaurant + bar. Does NOT want to operate — wants to package for developer + backer + operator. 5-parcel complex. CRDA priority corridor.',
      tasks:[
        t('🚨 PHOTOGRAPH the unsafe building notice today','emergency','Moshe','Record date posted',''),
        t('🚨 READ notice — record case number and deadline','emergency','Moshe','',''),
        t('🚨 HIRE licensed NJ structural engineer','emergency','Moshe','Satisfies city + assesses floor load','$3,500–$7,000'),
        t('🚨 RESPOND IN WRITING to city before deadline','emergency','Moshe + Attorney','',''),
        t('🚨 ENGAGE Atlantic City land use attorney','emergency','Moshe','','TBD'),
        t('Get Block/Lot numbers for all 5 parcels','soon','Moshe','',''),
        t('Research lot consolidation — AC planning board','soon','Moshe','','$1,500–$4,000'),
        t('Draft parking easement for lot across street','soon','Moshe','','$800–$2,000'),
        t('🚶 Pursue crosswalk with median refuge island','soon','Moshe','Start with CRDA then AC Dept of Public Works','$15K–$60K'),
        t('Commission architectural concept renderings','soon','Moshe','','$3,000–$8,000'),
        t('Walk all buildings with Boss — floor-by-floor plan','soon','Boss + Moshe','',''),
        t('Initiate liquor license inquiry — Atlantic City ABC','soon','Moshe','',''),
        t('Build revenue pro forma — billiards F&B events','soon','Moshe','',''),
        t('Draft Concept One-Pager / Teaser document','soon','Moshe','',''),
      ],
      parcels:[
        {id:uid(),label:'Main Building',address:'14 S. North Carolina Ave',blockLot:'TBD',zone:'CRDA Corridor',sqft:'',use:'4-story dormant. Owned 36 years. 🚨 Unsafe notice posted.',relationship:'primary',consolidationStatus:'anchor',notes:''},
        {id:uid(),label:'Slim / Connector Building',address:'Adjacent',blockLot:'TBD',zone:'CRDA Corridor',sqft:'',use:'Connected to main building.',relationship:'connected',consolidationStatus:'recommended',notes:''},
        {id:uid(),label:'Former Restaurant Bldg #1',address:'Adjacent',blockLot:'TBD',zone:'CRDA Corridor',sqft:'',use:'Formerly a restaurant. Dormant.',relationship:'adjacent',consolidationStatus:'recommended',notes:''},
        {id:uid(),label:'Former Restaurant Bldg #2',address:'Adjacent',blockLot:'TBD',zone:'CRDA Corridor',sqft:'',use:'Second former restaurant. Dormant.',relationship:'adjacent',consolidationStatus:'recommended',notes:''},
        {id:uid(),label:'Parking Lot (~1/3 block)',address:'Across street',blockLot:'TBD',zone:'CRDA Corridor',sqft:'',use:'Critical parking. 🚶 Crosswalk initiative in progress.',relationship:'across_street',consolidationStatus:'easement_recommended',notes:''},
      ],
      financials:{...defFinancials(),currentValue:'5000000',projectedValue:'22000000'},
      strategies:[s('🎱 Billiards Club + Restaurant + Bar','primary'),s('Boutique Hotel','alternate'),s('Billiards + Hotel Hybrid')],
    },
    { ...defProperty('PLV','Pleasantville Warehouses','Pleasantville, NJ'),
      zone:'Industrial', strategy:'Lease / Hold',
      notes:'Two warehouse buildings. Active leak causing mold risk — emergency. Must clear accumulated inventory before leasing.',
      tasks:[
        t('Emergency leak repair – roof/interior','emergency','Boss','Active mold risk','TBD – get 3 bids'),
        t('Mold remediation assessment','emergency','Moshe','Need licensed inspector','$500–$1,500'),
        t('Inventory catalog — photograph all items','soon','Moshe','Must clear before leasing',''),
        t('Exterior visual patching & cleanup','soon','','',''),
        t('Code compliance walkthrough','whenever','','',''),
      ],
      strategies:[s('Industrial Lease / Hold','primary'),s('Last-Mile Distribution')],
    },
    { ...defProperty('FAI','Fairmount Ave Lots','Fairmount Avenue, Atlantic City, NJ'),
      zone:'TBD', strategy:'TBD – Confirm Details with Boss First',
      notes:'Vacant lots on Fairmount Avenue, Atlantic City. Separate from the Armory. Exact address, block/lot numbers, and zoning need to be confirmed.',
      tasks:[
        t('Confirm exact address and block/lot numbers with Boss','soon','Moshe','',''),
        t('Walk the lots with Boss — assess size and condition','soon','Boss + Moshe','',''),
        t('Confirm zoning with Atlantic City planning dept','soon','Moshe','',''),
        t('Pull AC tax records — ownership and liens','soon','Moshe','',''),
        t('Photograph lots — current condition','soon','Moshe','Add to Photos tab',''),
      ],
      strategies:[s('Hold & Entitle'),s('Surface Parking Lot'),s('Sell As-Is')],
    },
    { ...defProperty('GS1','Gas Station – Absecon','White Horse Pike, Absecon, NJ'),
      zone:'Commercial / Highway Corridor', strategy:'TBD – Phase I ESA Required First',
      notes:'Former gas station on White Horse Pike. High-traffic highway corridor. USTs presumed on-site. NEVI grant window closing 2026.',
      tasks:[
        t('Phase I Environmental Site Assessment','emergency','Moshe','Cannot decide without this','$1,500–$3,000'),
        t('Confirm UST status — NJ DEP database','emergency','Moshe','',''),
        t('Consult environmental attorney — both gas stations together','soon','Moshe','',''),
        t('Research NEVI EV charging grant eligibility','soon','Moshe','Highway corridor = ideal NEVI site',''),
      ],
      strategies:[s('EV Charging Hub'),s('Cannabis Dispensary (Drive-Thru)'),s('EPA Brownfield & Sell'),s('Coffee / QSR Food')],
    },
    { ...defProperty('GS2','Gas Station – Egg Harbor Twp','Tilton Road, Egg Harbor Township, NJ'),
      zone:'Commercial', strategy:'TBD – Phase I ESA Required First',
      notes:'Former gas station on Tilton Road, EHT. Smaller footprint. Order both gas station ESAs simultaneously to reduce cost.',
      tasks:[
        t('Phase I Environmental Site Assessment','emergency','Moshe','Order simultaneously with Absecon','$1,500–$3,000'),
        t('Confirm UST status — NJ DEP database','emergency','Moshe','',''),
        t('Research EHT cannabis zoning — is Tilton Rd eligible?','whenever','Moshe','',''),
      ],
      strategies:[s('Cannabis Dispensary (Drive-Thru)'),s('EV Charging Hub'),s('EPA Brownfield & Sell')],
    },
    { ...defProperty('MUL','Mullica – 13 Acres (Malka Property)','Mullica, NJ – off White Horse Pike'),
      zone:'TBD', strategy:'🏗 Clear & Stage (Immediate) | 🔧 Auto Shop | Long-Term TBD',
      notes:'13 wooded acres. Unfinished structure on-site — 3 walls, no floor poured, was designed as hotel ballroom by prior owner.\n\nImmediate priority: clear section of land for centralized staging and inventory hub — addresses portfolio-wide problem of accumulated auction purchases.\n\nBoss regularly buys vehicles, forklifts, tools at auction. Needs permanent home base.',
      tasks:[
        t('Walk full property with Boss — assess structure','emergency','Boss + Moshe','3 walls no floor — engineer must assess',''),
        t('Structural engineer assessment of unfinished building','emergency','Moshe','Complete expand or demolish?','$500–$1,500'),
        t('🗂 BEGIN PORTFOLIO-WIDE INVENTORY — all items all properties','emergency','Moshe','Category location condition estimated value',''),
        t('Get land clearing quote','soon','Moshe','Get 3 bids','$15K–$60K est.'),
        t('Design staging area layout','soon','Moshe','Gravel pad fencing gate cameras',''),
        t('Sit with Boss — review inventory: sell / keep / discard','soon','Boss + Moshe','Boss open to selling significant portion',''),
        t('Set up liquidation channels — IronPlanet FB Marketplace','soon','Moshe','',''),
        t('Get pole barn / mechanic shop quote','soon','Moshe','Vehicle lifts power lighting','$40K–$120K'),
        t('Wetlands delineation','whenever','','Required before long-term development','$2,000–$4,000'),
      ],
      strategies:[s('🏗 Staging Hub & Inventory Center','primary'),s('🔧 Personal Auto / Mechanical Shop','primary'),s('🎉 Event Venue / Ballroom'),s('☀️ Solar Farm Ground Lease'),s('🏘 Entitle & Sell')],
    },
    { ...defProperty('BKL','Brooklyn Mixed-Use','Brooklyn, NY'),
      zone:'Mixed-Use', strategy:'Close Sale @ $5M — Resolve Holdover First',
      notes:'In contract at $5M. Holdover occupants complicating closing. NY attorney engaged.',
      tasks:[
        t('Resolve holdover/squatter — legal action','emergency','Boss','Complicating $5M closing','Legal fees TBD'),
        t('Confirm contract status with buyer','soon','Boss','',''),
        t('Coordinate with NY closing attorney','soon','Moshe','',''),
      ],
      financials:{...defFinancials(),currentValue:'5000000',projectedValue:'5000000'},
      strategies:[s('Close Sale at $5M','primary'),s('Renegotiate / Lease Instead','alternate')],
    },
    { ...defProperty('WLM','Williamstown Warehouse','Williamstown, NJ'),
      zone:'Industrial', strategy:'TBD – Inspect First',
      notes:'Single warehouse. Strategy TBD pending inspection and market rent analysis. Contains accumulated inventory to be cleared.',
      tasks:[
        t('Physical inspection & condition report','soon','','',''),
        t('Inventory catalog — photograph all items','soon','Moshe','Must clear before leasing',''),
        t('Market rent comp analysis','whenever','Moshe','',''),
      ],
      strategies:[s('Industrial Lease','primary'),s('Last-Mile / Fulfillment')],
    },
  ];

  const workers = [
    { ...defWorker('Jeffrey','Primary Laborer','day_labor'),
      yearsWithBoss: 30, age: 75, phone: '',
      notes: 'Knows where everything is across all properties. 30 years with the Boss. Institutional knowledge — critical to document. Works across all properties.',
      advances: [], assignments: [],
    },
    { ...defWorker('Nicot','Day Laborer','day_labor'),
      yearsWithBoss: 1, phone: '',
      notes: 'Approximately 1 year with the Boss. Paid as day labor basis.',
      advances: [], assignments: [],
    },
  ];

  return { properties, workers };
}
