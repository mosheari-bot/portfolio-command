import { useState, useEffect, useCallback, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

// ─── FIREBASE CONFIG ────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyBHIktmREJS4FoZB9XqNclsCD9hAE2-8CY",
  authDomain: "portfolio-command.firebaseapp.com",
  projectId: "portfolio-command",
  storageBucket: "portfolio-command.firebasestorage.app",
  messagingSenderId: "594502999319",
  appId: "1:594502999319:web:7cdf400dfb91b222e9ab52",
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const DATA_DOC = doc(db, "portfolio", "main");

// ─── STORAGE KEYS ───────────────────────────────
const STORAGE_KEY = "portfolio_v1";

// ─── CONFIG ─────────────────────────────────────
const PRIORITY = {
  emergency: { label: "🔴 Emergency", color: "#b50000", bg: "#fff0f0", border: "#ffaaaa" },
  soon:      { label: "🟡 Soon",      color: "#9a5500", bg: "#fff8ee", border: "#f5c842" },
  whenever:  { label: "🟢 Whenever",  color: "#1a6b3a", bg: "#eaf5ee", border: "#80c8a0" },
};
const STATUS = {
  todo:       { label: "Not Started", color: "#444" },
  inprogress: { label: "In Progress", color: "#9a5500" },
  done:       { label: "Done",        color: "#1a6b3a" },
};
const REL = {
  primary:       { label: "🏛 Primary Building",      color: "#1a3a6b", bg: "#eef3ff" },
  connected:     { label: "🔗 Connected / Attached",  color: "#1a6b3a", bg: "#eaf5ee" },
  adjacent:      { label: "📐 Adjacent Lot",          color: "#9a5500", bg: "#fff8ee" },
  across_street: { label: "🅿 Across the Street",     color: "#555",    bg: "#f4f0e8" },
  other:         { label: "📍 Other Parcel",          color: "#888",    bg: "#f8f8f8" },
};
const CONS = {
  anchor:               { label: "⚓ Anchor Parcel",              color: "#1a3a6b" },
  recommended:          { label: "✅ Consolidation Recommended",  color: "#1a6b3a" },
  easement_recommended: { label: "📝 Easement Needed",           color: "#9a5500" },
  not_applicable:       { label: "—",                            color: "#aaa" },
  done:                 { label: "✓ Consolidated",               color: "#1a6b3a" },
};
const STATUS_BADGE = {
  primary:   { label: "⭐ Primary",    bg: "#fff8ee", color: "#9a5500", border: "#f5c842" },
  alternate: { label: "🔄 Alternate",  bg: "#eef3ff", color: "#1a3a6b", border: "#aac0f0" },
  exploring: { label: "🔍 Exploring",  bg: "#eaf5ee", color: "#1a6b3a", border: "#80c8a0" },
  paused:    { label: "⏸ Paused",     bg: "#f8f8f8", color: "#888",    border: "#ccc" },
  eliminated:{ label: "✕ Eliminated", bg: "#fff0f0", color: "#b50000", border: "#ffaaaa" },
};

const CHECKLIST_ITEMS = [
  { id:"cv", label:"Open Violations / Municipal Summons",            cat:"Legal & Compliance" },
  { id:"cp", label:"Permits – Pull & File All Required",             cat:"Legal & Compliance" },
  { id:"cz", label:"Zoning Confirmation & Certificate of Occupancy", cat:"Legal & Compliance" },
  { id:"ct", label:"Title Search & Lien Review",                     cat:"Legal & Compliance" },
  { id:"ci", label:"Property Insurance – Current & Adequate",        cat:"Legal & Compliance" },
  { id:"cx", label:"Property Taxes – Confirm Current / Arrears",     cat:"Legal & Compliance" },
  { id:"ce", label:"Electrical – Inspection & Panel Review",         cat:"Building Systems" },
  { id:"cpl",label:"Plumbing – Leaks, Fixtures, Sewer",              cat:"Building Systems" },
  { id:"ch", label:"HVAC – Heating & Cooling Condition",             cat:"Building Systems" },
  { id:"cr", label:"Roof – Condition, Leaks, Drainage",              cat:"Building Systems" },
  { id:"cs", label:"Structural – Foundation, Walls, Floors",         cat:"Building Systems" },
  { id:"cl", label:"Lighting – Interior & Exterior",                 cat:"Building Systems" },
  { id:"ck", label:"Security – Locks, Cameras, Fencing",             cat:"Building Systems" },
  { id:"cf", label:"Fire Safety – Sprinklers, Extinguishers, Alarms",cat:"Building Systems" },
  { id:"cm", label:"Environmental – Mold, Asbestos, Hazmat Screen",  cat:"Environmental" },
  { id:"cu", label:"Underground Storage Tanks – Confirm Status",     cat:"Environmental" },
  { id:"cd", label:"Site Drainage & Grading",                        cat:"Environmental" },
  { id:"ctr",label:"Trash Removal & Dumpster Service",               cat:"Exterior & Site" },
  { id:"cla",label:"Landscaping & Grounds Cleanup",                  cat:"Exterior & Site" },
  { id:"cpa",label:"Parking Lot – Condition, Striping, Lighting",    cat:"Exterior & Site" },
  { id:"csg",label:"Signage – Existing Condition / Removal",         cat:"Exterior & Site" },
  { id:"cfa",label:"Facade & Exterior Repairs",                      cat:"Exterior & Site" },
  { id:"cut",label:"Utilities – Water, Gas, Electric Confirmed",     cat:"Utilities" },
  { id:"cit",label:"Internet / Telecom – Service Available",         cat:"Utilities" },
  { id:"ctn",label:"Tenant Status – Leases, Holdovers, Vacancies",   cat:"Occupancy" },
  { id:"cco",label:"Key Contacts – Contractor, Attorney, Inspector", cat:"Occupancy" },
];
const CHECKLIST_CATS = [...new Set(CHECKLIST_ITEMS.map(i => i.cat))];

const COMPARE_ROWS = [
  { key:"summary",      label:"Concept Summary",         type:"text"   },
  { key:"status",       label:"Status",                  type:"badge"  },
  { key:"capex",        label:"Est. Upfront Capital",    type:"text"   },
  { key:"timeline",     label:"Timeline to Revenue",     type:"text"   },
  { key:"monthlyIncome",label:"Est. Monthly Income",     type:"text"   },
  { key:"roi",          label:"Est. ROI / Cap Rate",     type:"text"   },
  { key:"difficulty",   label:"Execution Difficulty",    type:"rating" },
  { key:"permitRisk",   label:"Permitting / Zoning Risk",type:"rating" },
  { key:"marketDemand", label:"Market Demand",           type:"rating" },
  { key:"bossInterest", label:"Boss Interest Level",     type:"rating" },
  { key:"pros",         label:"✅ Pros",                 type:"list"   },
  { key:"cons",         label:"❌ Cons",                 type:"list"   },
  { key:"notes",        label:"Additional Notes",        type:"text"   },
];

const FIN_FIELDS = [
  { key:"purchasePrice",      label:"Purchase Price",              group:"Value"     },
  { key:"currentValue",       label:"Current Market Value",        group:"Value"     },
  { key:"projectedValue",     label:"Projected Value (Post-Impr)", group:"Value"     },
  { key:"mortgageBalance",    label:"Mortgage / Debt Balance",     group:"Debt"      },
  { key:"monthlyDebtService", label:"Monthly Debt Service",        group:"Debt"      },
  { key:"monthlyIncome",      label:"Monthly Gross Income",        group:"Cash Flow" },
  { key:"monthlyExpenses",    label:"Monthly Operating Expenses",  group:"Cash Flow" },
  { key:"repairBudget",       label:"Total Repair / Rehab Budget", group:"Rehab"     },
  { key:"spentToDate",        label:"Money Spent to Date",         group:"Rehab"     },
];
const FIN_GROUPS = [...new Set(FIN_FIELDS.map(f => f.group))];

// ─── HELPERS ────────────────────────────────────
function parseDollar(v) {
  const n = parseFloat(String(v||"").replace(/[^0-9.]/g,""));
  return isNaN(n) ? null : n;
}
function fmt$(v) {
  const n = parseDollar(v);
  return n === null ? "—" : "$" + n.toLocaleString("en-US",{maximumFractionDigits:0});
}
function calcNOI(fin) {
  const i = parseDollar(fin.monthlyIncome), e = parseDollar(fin.monthlyExpenses);
  return i !== null && e !== null ? (i-e)*12 : null;
}
function calcEquity(fin) {
  const v = parseDollar(fin.currentValue), d = parseDollar(fin.mortgageBalance);
  return v !== null && d !== null ? v-d : null;
}
function calcRehabLeft(fin) {
  const b = parseDollar(fin.repairBudget), s = parseDollar(fin.spentToDate);
  return b !== null && s !== null ? b-s : null;
}

// ─── DEFAULTS ───────────────────────────────────
let _uid = 1000;
const uid = () => ++_uid;

function defChecklist() {
  return CHECKLIST_ITEMS.map(i => ({ ...i, done: false, na: false, note: "" }));
}
function defFinancials() {
  return { purchasePrice:"", currentValue:"", projectedValue:"", mortgageBalance:"",
           monthlyDebtService:"", monthlyIncome:"", monthlyExpenses:"",
           repairBudget:"", spentToDate:"", notes:"" };
}
function defStrategy(name="New Strategy", status="exploring") {
  return { id:uid(), name, status,
    summary:"", capex:"", timeline:"", monthlyIncome:"", roi:"",
    difficulty:0, permitRisk:0, marketDemand:0, bossInterest:0,
    pros:"", cons:"", notes:"" };
}
function defParcel(idx) {
  return { id:uid(), label:`Parcel ${idx+1}`, address:"", blockLot:"",
    zone:"", sqft:"", use:"", relationship:"adjacent",
    consolidationStatus:"not_applicable", notes:"" };
}
function defProperty(id, name, location) {
  return { id, name, location, zone:"", strategy:"",
    notes:"", docs:[], tasks:[], checklist:defChecklist(),
    financials:defFinancials(), strategies:[], parcels:[], photos:[] };
}

// ─── SEED DATA ──────────────────────────────────
function seedProperties() {
  const t = (text, priority="soon", assignee="Moshe", note="", cost="") =>
    ({ id:uid(), text, priority, status:"todo", assignee, note, cost });
  const s = (name, status="exploring") => ({
    ...defStrategy(name, status),
  });
  return [
    { ...defProperty("ARM","Atlantic Ave Armory","Atlantic City, NJ"),
      zone:"RM-1", strategy:"🏛 Anchor Property | Entitlement Flip",
      notes:"One of two anchor properties in AC. RM-1 zoned armory. Boss confirmed entitlement-and-sell strategy — invest in permitting to achieve appreciation, then find a buyer.",
      tasks:[
        t("Finalize entitlement/permitting scope","soon","Moshe","",""),
        t("Identify potential buyers post-entitlement","whenever","Boss","",""),
      ],
      strategies:[s("Entitlement & Sell","primary"),s("Self-Storage Conversion"),s("Maker Campus / Creator Studios")],
    },
    { ...defProperty("NCA","S. North Carolina Ave Complex","Atlantic City, NJ – Boardwalk-adjacent"),
      zone:"CRDA Corridor", strategy:"🚨 UNSAFE BUILDING NOTICE — ACT NOW | 🎱 Billiards Club – Package for Dev + Backer + Operator",
      notes:"🚨 City has posted Unsafe Building notice on main building — legal action with a deadline. Respond in writing before deadline. Hire licensed NJ structural engineer immediately.\n\nAnchor property. Boss has owned main building 36 years. Vision: billiards club + restaurant + bar. He does NOT want to operate it — wants to package it for a developer + financial backer + operator. Multi-parcel complex: main building + slim connector building + 2 former restaurant buildings + parking lot across street (~1/3 block). CRDA priority corridor. EB-5 eligible.",
      docs:[
        {label:"Unsafe Building Notice (photograph)",url:""},
        {label:"CRDA Incentive Programs",url:""},
        {label:"Billiards Concept Sketch",url:""},
        {label:"EB-5 Financing Overview",url:""},
        {label:"Concept One-Pager (Draft)",url:""},
      ],
      tasks:[
        t("🚨 PHOTOGRAPH the unsafe building notice today","emergency","Moshe","Record date posted",""),
        t("🚨 READ notice — record case number, deadline, department","emergency","Moshe","",""),
        t("🚨 HIRE licensed NJ structural engineer","emergency","Moshe","Satisfies city + assesses floor load for pool tables","$3,500–$7,000"),
        t("🚨 RESPOND IN WRITING to city before deadline","emergency","Moshe + Attorney","Letter confirming owner awareness stops escalation",""),
        t("🚨 ENGAGE Atlantic City land use attorney","emergency","Moshe","","TBD"),
        t("Get all Block/Lot numbers for all 5 parcels — AC tax records","soon","Moshe","",""),
        t("Research lot consolidation — AC planning board","soon","Moshe","Merge connected buildings into one parcel","$1,500–$4,000"),
        t("Draft parking easement for lot across street","soon","Moshe","Cannot formally merge — easement is correct tool","$800–$2,000"),
        t("🚶 Pursue crosswalk / median cut — parking lot to venue","soon","Moshe","Start with CRDA, then AC Dept of Public Works","$15K–$60K"),
        t("Commission architectural concept renderings","soon","Moshe","Needed before any investor conversation","$3,000–$8,000"),
        t("Walk all buildings with Boss — floor-by-floor use plan","soon","Boss + Moshe","",""),
        t("Initiate liquor license inquiry — Atlantic City ABC","soon","Moshe","NJ licenses can take 6–18 months",""),
        t("Build revenue pro forma — billiards, F&B, events","soon","Moshe","Needed for investor pitch",""),
        t("Draft Concept One-Pager / Teaser document","soon","Moshe","1-page summary for initial conversations",""),
        t("Research EB-5 financing structure","whenever","Moshe","",""),
        t("Draft CIM / Pitch Book","whenever","Moshe","Full investor package",""),
      ],
      parcels:[
        {id:uid(),label:"Main Building",address:"14 S. North Carolina Ave",blockLot:"TBD",zone:"CRDA Corridor",sqft:"",use:"4-story dormant building. Owned 36 years. 🚨 Unsafe building notice posted.",relationship:"primary",consolidationStatus:"anchor",notes:"Heart of the project."},
        {id:uid(),label:"Slim / Connector Building",address:"Adjacent – S. North Carolina Ave",blockLot:"TBD",zone:"CRDA Corridor",sqft:"",use:"Narrow building connected to main building.",relationship:"connected",consolidationStatus:"recommended",notes:"Merge with main building."},
        {id:uid(),label:"Former Restaurant Bldg #1",address:"Adjacent – S. North Carolina Ave",blockLot:"TBD",zone:"CRDA Corridor",sqft:"",use:"Formerly a successful restaurant. Dormant.",relationship:"adjacent",consolidationStatus:"recommended",notes:"May retain F&B infrastructure."},
        {id:uid(),label:"Former Restaurant Bldg #2",address:"Adjacent – S. North Carolina Ave",blockLot:"TBD",zone:"CRDA Corridor",sqft:"",use:"Second former restaurant building. Dormant.",relationship:"adjacent",consolidationStatus:"recommended",notes:"Private dining or bar annex candidate."},
        {id:uid(),label:"Parking Lot (~1/3 block)",address:"Across street – S. North Carolina Ave",blockLot:"TBD",zone:"CRDA Corridor",sqft:"",use:"Large parking lot across the divided street.",relationship:"across_street",consolidationStatus:"easement_recommended",notes:"🚶 CROSSWALK INITIATIVE: Pursue crosswalk with median refuge island connecting lot to venue. Start with CRDA, then AC Dept of Public Works."},
      ],
      financials:{...defFinancials(),currentValue:"5000000",projectedValue:"22000000"},
      strategies:[s("🎱 Billiards Club + Restaurant + Bar","primary"),s("Boutique Hotel","alternate"),s("Billiards + Hotel Hybrid")],
    },
    { ...defProperty("PLV","Pleasantville Warehouses","Pleasantville, NJ"),
      zone:"Industrial", strategy:"Lease / Hold",
      notes:"Two warehouse buildings. Active leak causing mold risk — emergency. Must clear accumulated inventory before leasing. Boss open to selling surplus items.",
      tasks:[
        t("Emergency leak repair — roof/interior","emergency","Boss","Active leak causing mold risk","TBD – get 3 bids"),
        t("Mold remediation assessment","emergency","Moshe","Need licensed inspector","$500–$1,500"),
        t("Inventory catalog — photograph all items in both buildings","soon","Moshe","Must clear before leasing",""),
        t("Exterior visual patching & cleanup","soon","","",""),
        t("Code compliance walkthrough","whenever","","",""),
      ],
      strategies:[s("Industrial Lease / Hold","primary"),s("Last-Mile Distribution")],
    },
    { ...defProperty("FAI","Fairmount Ave Lots","Fairmount Avenue, Atlantic City, NJ"),
      zone:"TBD", strategy:"TBD – Confirm Details with Boss First",
      notes:"Vacant lots on Fairmount Avenue, Atlantic City. Separate property from the Armory. Details including exact address, block/lot numbers, dimensions, and zoning need to be confirmed with the Boss.",
      tasks:[
        t("Confirm exact address and block/lot numbers with Boss","soon","Moshe","Pull from AC tax records once confirmed",""),
        t("Walk the lots with Boss — assess size, access, condition","soon","Boss + Moshe","Note structures, fencing, encroachments",""),
        t("Confirm zoning with Atlantic City planning dept","soon","Moshe","",""),
        t("Pull AC tax records — ownership, assessed value, liens","soon","Moshe","",""),
        t("Photograph lots — current condition and surroundings","soon","Moshe","Add to Photos tab",""),
      ],
      strategies:[s("Hold & Entitle"),s("Surface Parking Lot"),s("Sell As-Is")],
    },
    { ...defProperty("GS1","Gas Station – Absecon","White Horse Pike, Absecon, NJ"),
      zone:"Commercial / Highway Corridor", strategy:"TBD – Phase I ESA Required First",
      notes:"Former gas station on White Horse Pike. High-traffic highway corridor. USTs presumed on-site. Phase I ESA must be completed before any redevelopment or sale decision. NEVI grant window closing 2026.",
      tasks:[
        t("Phase I Environmental Site Assessment","emergency","Moshe","Cannot make decisions without this","$1,500–$3,000"),
        t("Confirm UST status — NJ DEP database","emergency","Moshe","",""),
        t("Consult environmental attorney — both gas stations together","soon","Moshe","",""),
        t("Research NEVI EV charging grant eligibility","soon","Moshe","Highway corridor = ideal NEVI site. Closing 2026.",""),
      ],
      strategies:[s("EV Charging Hub"),s("Cannabis Dispensary (Drive-Thru)"),s("EPA Brownfield & Sell"),s("Coffee / QSR Food")],
    },
    { ...defProperty("GS2","Gas Station – Egg Harbor Twp","Tilton Road, Egg Harbor Township, NJ"),
      zone:"Commercial", strategy:"TBD – Phase I ESA Required First",
      notes:"Former gas station on Tilton Road, EHT. Smaller footprint than Absecon site. EHT is a fast-growing municipality. Order both gas station ESAs simultaneously to reduce cost.",
      tasks:[
        t("Phase I Environmental Site Assessment","emergency","Moshe","Order simultaneously with Absecon","$1,500–$3,000"),
        t("Confirm UST status — NJ DEP database","emergency","Moshe","",""),
        t("Research EHT cannabis zoning — is Tilton Rd eligible?","whenever","Moshe","",""),
      ],
      strategies:[s("Cannabis Dispensary (Drive-Thru)"),s("EV Charging Hub"),s("EPA Brownfield & Sell")],
    },
    { ...defProperty("MUL","Mullica – 13 Acres (Malka Property)","Mullica, NJ – off White Horse Pike"),
      zone:"TBD", strategy:"🏗 Clear & Stage (Immediate) | 🔧 Auto Shop | Long-Term TBD",
      notes:"13 wooded acres off White Horse Pike. Unfinished structure on-site — 3 walls, no floor poured, open on one side. Was designed to be a hotel ballroom by the prior landowner.\n\nImmediate priority: clear section of land for centralized staging and inventory hub — addresses portfolio-wide problem of accumulated auction purchases at every property. Boss regularly buys vehicles, forklifts, and tools at auction. Needs a permanent home base for this.\n\nLong-term: auto/mechanical shop for Boss's vehicles, event venue (finish the ballroom), solar farm ground lease, or entitle and sell.",
      tasks:[
        t("Walk full property with Boss — assess structure and clearing scope","emergency","Boss + Moshe","3 walls, no floor — engineer must assess",""),
        t("Structural engineer assessment of unfinished building","emergency","Moshe","Complete, expand, or demolish?","$500–$1,500"),
        t("🗂 BEGIN PORTFOLIO-WIDE INVENTORY — all items at all properties","emergency","Moshe","Category, location, condition, estimated value",""),
        t("Get land clearing / tree removal bid","soon","Moshe","Get 3 bids","$15K–$60K est."),
        t("Design staging area — vehicle, materials, tool zones","soon","Moshe","Gravel pad, fencing, gate, cameras",""),
        t("Sit with Boss — review inventory: sell / keep / discard","soon","Boss + Moshe","Boss open to selling significant portion",""),
        t("Set up liquidation channels — IronPlanet, FB Marketplace","soon","Moshe","",""),
        t("Get pole barn / mechanic shop quote","soon","Moshe","Vehicle lifts, power, lighting","$40K–$120K"),
        t("Wetlands delineation","whenever","","Required before long-term development","$2,000–$4,000"),
        t("Survey & zoning confirmation","whenever","Moshe","","$1,200–$2,500"),
      ],
      strategies:[s("🏗 Staging Hub & Inventory Center","primary"),s("🔧 Personal Auto / Mechanical Shop","primary"),s("🎉 Event Venue / Ballroom"),s("☀️ Solar Farm Ground Lease"),s("🏘 Entitle & Sell")],
    },
    { ...defProperty("BKL","Brooklyn Mixed-Use","Brooklyn, NY"),
      zone:"Mixed-Use", strategy:"Close Sale @ $5M — Resolve Holdover First",
      notes:"In contract at $5M. Holdover occupants complicating closing. NY attorney engaged. Every month of delay risks the buyer walking.",
      tasks:[
        t("Resolve holdover/squatter — legal action","emergency","Boss","Complicating $5M sale closing","Legal fees TBD"),
        t("Confirm contract status with buyer","soon","Boss","",""),
        t("Coordinate with NY closing attorney","soon","Moshe","",""),
      ],
      financials:{...defFinancials(),currentValue:"5000000",projectedValue:"5000000"},
      strategies:[s("Close Sale at $5M","primary"),s("Renegotiate / Lease Instead","alternate")],
    },
    { ...defProperty("WLM","Williamstown Warehouse","Williamstown, NJ"),
      zone:"Industrial", strategy:"TBD – Inspect First",
      notes:"Single warehouse. Strategy TBD pending physical inspection and market rent analysis. Like all Boss properties, likely contains accumulated inventory that will need to be cleared.",
      tasks:[
        t("Physical inspection & condition report","soon","","",""),
        t("Inventory catalog — photograph all items","soon","Moshe","Must clear before leasing",""),
        t("Market rent comp analysis","whenever","Moshe","",""),
      ],
      strategies:[s("Industrial Lease","primary"),s("Last-Mile / Fulfillment")],
    },
  ];
}

// ─── STORAGE HELPERS ────────────────────────────
async function saveData(data) {
  try {
    await setDoc(DATA_DOC, { properties: data, updatedAt: Date.now() });
  } catch(e) {
    // Fallback to localStorage if Firebase fails
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
    console.error("Firebase save error:", e);
  }
}

// ─── MAIN APP ───────────────────────────────────
export default function App() {
  const [props, setProps] = useState(null);
  const [activeId, setActiveId] = useState("NCA");
  const [view, setView] = useState("dashboard");
  const [tab, setTab] = useState("tasks");
  const [saving, setSaving] = useState(false);
  const [showAddProp, setShowAddProp] = useState(false);
  const [newPropForm, setNewPropForm] = useState({ id:"", name:"", location:"", zone:"", strategy:"" });

  const justSaved = useRef(false);

  useEffect(() => {
    const unsub = onSnapshot(
      DATA_DOC,
      (snap) => {
        if (justSaved.current) return; // skip echo from our own save
        if (snap.exists()) {
          setProps(snap.data().properties);
        } else {
          // First time ever — seed the database
          const seed = seedProperties();
          setProps(seed);
          saveData(seed);
        }
      },
      (error) => {
        // Firebase unreachable — fall back to localStorage
        console.error("Firebase sync error:", error);
        try {
          const local = localStorage.getItem(STORAGE_KEY);
          setProps(local ? JSON.parse(local) : seedProperties());
        } catch { setProps(seedProperties()); }
      }
    );
    return () => unsub();
  }, []);

  const persist = useCallback(async (updated) => {
    setProps(updated);       // instant local update
    setSaving(true);
    justSaved.current = true;
    await saveData(updated);
    setTimeout(() => {
      setSaving(false);
      justSaved.current = false;
    }, 1200);
  }, []);

  function updateProp(id, changes) {
    persist(props.map(p => p.id === id ? { ...p, ...changes } : p));
  }

  function addProperty() {
    const f = newPropForm;
    if (!f.name.trim()) return;
    const rawId = f.id.trim().toUpperCase() || f.name.trim().toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,5);
    const id = props.some(p => p.id === rawId) ? rawId + (props.length+1) : rawId;
    const np = { ...defProperty(id, f.name.trim(), f.location.trim()), zone: f.zone.trim(), strategy: f.strategy.trim() };
    persist([...props, np]);
    setActiveId(id);
    setView("property");
    setTab("tasks");
    setShowAddProp(false);
    setNewPropForm({ id:"", name:"", location:"", zone:"", strategy:"" });
  }

  function deleteProperty(id) {
    const updated = props.filter(p => p.id !== id);
    persist(updated);
    if (activeId === id) setActiveId(updated[0]?.id || null);
  }

  if (!props) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"#f4f0e8", fontFamily:"Georgia, serif", fontSize:18, color:"#555" }}>
      Loading portfolio…
    </div>
  );

  const active = props.find(p => p.id === activeId);
  const allTasks = props.flatMap(p => p.tasks.map(t => ({ ...t, propId:p.id, propName:p.name })));
  const urgentCount = allTasks.filter(t => t.priority === "emergency" && t.status !== "done").length;
  const openCount = allTasks.filter(t => t.status !== "done").length;
  const totalValue = props.reduce((s,p) => s + (parseDollar(p.financials.currentValue)||0), 0);

  return (
    <div style={T.root}>
      {/* HEADER */}
      <div style={T.header}>
        <div>
          <div style={T.brand}>PORTFOLIO COMMAND</div>
          <div style={T.brandSub}>Boss Property Management System {saving && <span style={{color:"#9a5500",fontSize:11}}> · Saving…</span>}</div>
        </div>
        <div style={T.stats}>
          {urgentCount > 0 && <Stat val={urgentCount} label="URGENT" color="#b50000" />}
          <Stat val={openCount} label="OPEN TASKS" color="#9a5500" />
          <Stat val={props.length} label="PROPERTIES" color="#1a6b3a" />
          {totalValue > 0 && <Stat val={fmt$(String(totalValue))} label="PORTFOLIO VALUE" color="#1a3a6b" small />}
        </div>
      </div>

      {/* NAV */}
      <div style={T.nav}>
        <NavBtn active={view==="dashboard"} onClick={() => setView("dashboard")}>⬛ Dashboard</NavBtn>
        <NavBtn active={view==="property"} onClick={() => setView("property")}>🏗 Properties</NavBtn>
      </div>

      {/* URGENT BANNER */}
      {view === "dashboard" && urgentCount > 0 && (
        <div style={T.urgentBanner}>
          <div style={T.urgentTitle}>🚨 URGENT — NEEDS IMMEDIATE ATTENTION</div>
          {allTasks.filter(t => t.priority==="emergency" && t.status!=="done").map(t => (
            <div key={t.id} style={T.urgentRow} onClick={() => { setActiveId(t.propId); setView("property"); setTab("tasks"); }}>
              <span style={T.urgentProp}>{t.propName}</span>
              <span style={T.urgentTask}>{t.text}</span>
              {t.cost && <span style={T.urgentCost}>💰 {t.cost}</span>}
            </div>
          ))}
        </div>
      )}

      {view === "dashboard" ? (
        <div>
          {/* ADD PROPERTY BUTTON + FORM */}
          <div style={{ padding:"16px 24px 0", display:"flex", justifyContent:"flex-end" }}>
            <button style={T.addPropBtn} onClick={() => setShowAddProp(v => !v)}>
              {showAddProp ? "✕ Cancel" : "+ Add Property"}
            </button>
          </div>
          {showAddProp && (
            <div style={T.addPropForm}>
              <div style={T.addPropTitle}>New Property</div>
              <div style={U.formRow}>
                <div style={{ display:"flex", flexDirection:"column", gap:4, flex:2, minWidth:180 }}>
                  <label style={U.lbl}>Property Name *</label>
                  <input style={U.input} placeholder="e.g. Main Street Warehouse" value={newPropForm.name} onChange={e => setNewPropForm({...newPropForm, name:e.target.value})} />
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:4, flex:1, minWidth:100 }}>
                  <label style={U.lbl}>Short Code (ID)</label>
                  <input style={U.input} placeholder="e.g. MSW" value={newPropForm.id} onChange={e => setNewPropForm({...newPropForm, id:e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,6)})} />
                </div>
              </div>
              <div style={U.formRow}>
                <div style={{ display:"flex", flexDirection:"column", gap:4, flex:2, minWidth:200 }}>
                  <label style={U.lbl}>Location / Address</label>
                  <input style={U.input} placeholder="e.g. 123 Main St, Atlantic City, NJ" value={newPropForm.location} onChange={e => setNewPropForm({...newPropForm, location:e.target.value})} />
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:4, flex:1, minWidth:120 }}>
                  <label style={U.lbl}>Zoning</label>
                  <input style={U.input} placeholder="e.g. RM-1, Commercial" value={newPropForm.zone} onChange={e => setNewPropForm({...newPropForm, zone:e.target.value})} />
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                <label style={U.lbl}>Strategy / Current Status</label>
                <input style={U.input} placeholder="e.g. TBD, Lease / Hold, Entitlement Flip…" value={newPropForm.strategy} onChange={e => setNewPropForm({...newPropForm, strategy:e.target.value})} />
              </div>
              <div style={{ display:"flex", gap:10, marginTop:4 }}>
                <button style={U.saveBtn} onClick={addProperty}>Add to Portfolio</button>
                <button style={U.cancelBtn} onClick={() => setShowAddProp(false)}>Cancel</button>
              </div>
            </div>
          )}
          <div style={T.dashGrid}>
            {props.map(p => (
              <PropertyCard key={p.id} prop={p} onClick={() => { setActiveId(p.id); setView("property"); setTab("tasks"); }} />
            ))}
          </div>
        </div>
      ) : (
        <div style={T.propLayout}>
          {/* Property selector */}
          <div style={T.propTabs}>
            {props.map(p => {
              const hasUrgent = p.tasks.some(t => t.priority==="emergency" && t.status!=="done");
              return (
                <button key={p.id}
                  style={{ ...T.propTab, ...(p.id===activeId ? T.propTabActive : {}) }}
                  onClick={() => { setActiveId(p.id); setTab("tasks"); }}>
                  {hasUrgent && <span style={{color:"#b50000"}}>🔴 </span>}{p.id}
                </button>
              );
            })}
          </div>

          {active && <PropertyDetail prop={active} tab={tab} setTab={setTab} updateProp={updateProp} deleteProperty={deleteProperty} />}
        </div>
      )}
    </div>
  );
}

// ─── SMALL UI PIECES ────────────────────────────
function Stat({ val, label, color, small }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
      <span style={{ color, fontSize: small ? 16 : 24, fontWeight:700 }}>{val}</span>
      <span style={{ fontSize:9, color:"#555", letterSpacing:"0.08em", fontFamily:"'Courier New',monospace" }}>{label}</span>
    </div>
  );
}
function NavBtn({ active, onClick, children }) {
  return (
    <button style={{ ...T.navBtn, ...(active ? T.navBtnActive : {}) }} onClick={onClick}>{children}</button>
  );
}

function PropertyCard({ prop, onClick }) {
  const urgent = prop.tasks.filter(t => t.priority==="emergency" && t.status!=="done").length;
  const done   = prop.tasks.filter(t => t.status==="done").length;
  const open   = prop.tasks.filter(t => t.status!=="done").length;
  const clDone = prop.checklist.filter(c => c.done).length;
  const val    = parseDollar(prop.financials.currentValue);
  const eq     = calcEquity(prop.financials);
  return (
    <div style={{ ...T.card, borderTop: urgent > 0 ? "3px solid #b50000" : "3px solid #ddd" }} onClick={onClick}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
        <span style={T.cardId}>{prop.id}</span>
        {urgent > 0 && <span style={{ color:"#b50000", fontWeight:700, fontSize:13 }}>{urgent} 🔴</span>}
      </div>
      <div style={T.cardName}>{prop.name}</div>
      <div style={T.cardLoc}>{prop.location}</div>
      <div style={T.cardStrat}>{prop.strategy}</div>
      {val && <div style={T.cardFin}>💵 {fmt$(prop.financials.currentValue)}{eq!==null && <span style={{color:"#1a6b3a"}}> · Eq: {fmt$(String(eq))}</span>}</div>}
      <div style={T.cardMeta}>
        <span style={{color:"#9a5500",fontWeight:600}}>{open} open</span>
        <span style={{color:"#1a6b3a",fontWeight:600}}>{done} done</span>
        <span style={{color:"#666"}}>☑ {clDone}/{prop.checklist.length}</span>
      </div>
      <div style={T.progOuter}><div style={{ ...T.progInner, width: prop.tasks.length ? `${(done/prop.tasks.length)*100}%`:"0%" }} /></div>
    </div>
  );
}

// ─── PROPERTY DETAIL ────────────────────────────
function PropertyDetail({ prop, tab, setTab, updateProp, deleteProperty }) {
  const clDone = prop.checklist.filter(c => c.done).length;
  const [editingHeader, setEditingHeader] = useState(false);
  const [hBuf, setHBuf] = useState({});

  const TABS = [
    { key:"tasks",      label:"✅ Tasks" },
    { key:"photos",     label:`📷 Photos (${(prop.photos||[]).length})` },
    { key:"compare",    label:"⚖️ Compare" },
    { key:"financials", label:"💵 Financials" },
    { key:"parcels",    label:`🗺 Parcels (${(prop.parcels||[]).length})` },
    { key:"checklist",  label:`☑ Checklist (${clDone}/${prop.checklist.length})` },
    { key:"notes",      label:"📋 Notes" },
    { key:"docs",       label:`📎 Docs (${prop.docs.length})` },
  ];
  return (
    <div style={T.detail}>
      <div style={T.detailHeader}>
        {editingHeader ? (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <div style={U.formRow}>
              <div style={{ flex:2, minWidth:180 }}>
                <label style={U.lbl}>Property Name</label>
                <input style={U.input} value={hBuf.name||""} onChange={e => setHBuf({...hBuf,name:e.target.value})} />
              </div>
              <div style={{ flex:1, minWidth:120 }}>
                <label style={U.lbl}>Location / Address</label>
                <input style={U.input} value={hBuf.location||""} onChange={e => setHBuf({...hBuf,location:e.target.value})} />
              </div>
            </div>
            <div style={U.formRow}>
              <div style={{ flex:1, minWidth:120 }}>
                <label style={U.lbl}>Zoning</label>
                <input style={U.input} value={hBuf.zone||""} onChange={e => setHBuf({...hBuf,zone:e.target.value})} />
              </div>
              <div style={{ flex:2, minWidth:180 }}>
                <label style={U.lbl}>Strategy / Status</label>
                <input style={U.input} value={hBuf.strategy||""} onChange={e => setHBuf({...hBuf,strategy:e.target.value})} />
              </div>
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
              <button style={U.saveBtn} onClick={() => { updateProp(prop.id, hBuf); setEditingHeader(false); }}>Save Changes</button>
              <button style={U.cancelBtn} onClick={() => setEditingHeader(false)}>Cancel</button>
              <button style={{ ...U.smBtn, color:"#b50000", marginLeft:"auto" }}
                onClick={() => { if(window.confirm("Remove this property from the portfolio?")) { deleteProperty(prop.id); setEditingHeader(false); } }}>
                🗑 Remove Property
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
            <div>
              <div style={T.detailName}>{prop.name}</div>
              <div style={T.detailMeta}>{prop.location}{prop.zone && <span> · <strong>{prop.zone}</strong></span>}</div>
              {prop.strategy && <div style={{ fontSize:13, color:"#9a5500", fontStyle:"italic", marginTop:4 }}>{prop.strategy}</div>}
            </div>
            <button style={U.smBtn} onClick={() => { setHBuf({name:prop.name,location:prop.location,zone:prop.zone,strategy:prop.strategy}); setEditingHeader(true); }}>
              ✎ Edit Property
            </button>
          </div>
        )}
      </div>
      <div style={T.tabBar}>
        {TABS.map(t => (
          <button key={t.key} style={{ ...T.tabBtn, ...(tab===t.key ? T.tabBtnActive : {}) }} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>
      <div style={T.tabContent}>
        {tab==="tasks"      && <TasksTab      prop={prop} updateProp={updateProp} />}
        {tab==="photos"     && <PhotosTab     prop={prop} updateProp={updateProp} />}
        {tab==="compare"    && <CompareTab     prop={prop} updateProp={updateProp} />}
        {tab==="financials" && <FinancialsTab  prop={prop} updateProp={updateProp} />}
        {tab==="parcels"    && <ParcelsTab     prop={prop} updateProp={updateProp} />}
        {tab==="checklist"  && <ChecklistTab   prop={prop} updateProp={updateProp} />}
        {tab==="notes"      && <NotesTab       prop={prop} updateProp={updateProp} />}
        {tab==="docs"       && <DocsTab        prop={prop} updateProp={updateProp} />}
      </div>
    </div>
  );
}

// ─── TASKS TAB ──────────────────────────────────
function TasksTab({ prop, updateProp }) {
  const [filter, setFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ text:"", priority:"soon", assignee:"", note:"", cost:"" });
  const [editId, setEditId] = useState(null);

  const filtered = prop.tasks.filter(t => filter==="all" || t.status===filter);

  function addTask() {
    if (!form.text.trim()) return;
    updateProp(prop.id, { tasks: [...prop.tasks, { id:uid(), ...form, status:"todo" }] });
    setForm({ text:"", priority:"soon", assignee:"", note:"", cost:"" });
    setShowAdd(false);
  }
  function updateTask(id, changes) {
    updateProp(prop.id, { tasks: prop.tasks.map(t => t.id===id ? {...t,...changes} : t) });
  }
  function deleteTask(id) {
    updateProp(prop.id, { tasks: prop.tasks.filter(t => t.id!==id) });
  }

  return (
    <div>
      <div style={U.row}>
        <div style={U.filterRow}>
          {["all","todo","inprogress","done"].map(s => (
            <button key={s} style={{ ...U.filterBtn, ...(filter===s ? U.filterBtnActive : {}) }} onClick={() => setFilter(s)}>
              {s==="all" ? "All" : STATUS[s]?.label}
            </button>
          ))}
        </div>
        <button style={U.addBtn} onClick={() => setShowAdd(v => !v)}>{showAdd ? "✕ Cancel" : "+ Add Task"}</button>
      </div>
      {showAdd && (
        <div style={U.form}>
          <input style={U.input} placeholder="Task description…" value={form.text} onChange={e => setForm({...form,text:e.target.value})} />
          <div style={U.formRow}>
            <select style={U.select} value={form.priority} onChange={e => setForm({...form,priority:e.target.value})}>
              {Object.entries(PRIORITY).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <input style={U.input} placeholder="Assigned to…" value={form.assignee} onChange={e => setForm({...form,assignee:e.target.value})} />
            <input style={U.input} placeholder="Cost estimate…" value={form.cost} onChange={e => setForm({...form,cost:e.target.value})} />
          </div>
          <div style={U.formRow}>
            <input style={U.input} placeholder="Notes (optional)…" value={form.note} onChange={e => setForm({...form,note:e.target.value})} />
            <button style={U.saveBtn} onClick={addTask}>Save Task</button>
          </div>
        </div>
      )}
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {filtered.length===0 && <div style={U.empty}>No tasks in this filter.</div>}
        {filtered.map(task => (
          <TaskRow key={task.id} task={task} editId={editId} setEditId={setEditId} updateTask={updateTask} deleteTask={deleteTask} />
        ))}
      </div>
    </div>
  );
}
function TaskRow({ task, editId, setEditId, updateTask, deleteTask }) {
  const isEdit = editId === task.id;
  const [buf, setBuf] = useState({});
  const p = PRIORITY[task.priority] || PRIORITY.soon;
  const s = STATUS[task.status] || STATUS.todo;
  return (
    <div style={{ ...U.taskRow, borderLeft:`4px solid ${p.color}`, opacity: task.status==="done" ? 0.55 : 1 }}>
      <div style={U.taskTop}>
        <select style={{ ...U.statusSel, color:s.color, fontWeight:700 }} value={task.status} onChange={e => updateTask(task.id, {status:e.target.value})}>
          {Object.entries(STATUS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        {isEdit
          ? <input style={{...U.input,flex:1}} value={buf.text} onChange={e => setBuf({...buf,text:e.target.value})} />
          : <span style={{ ...U.taskText, textDecoration: task.status==="done" ? "line-through" : "none" }}>{task.text}</span>
        }
        <span style={{ ...U.priBadge, background:p.bg, color:p.color, border:`1px solid ${p.border}` }}>{p.label}</span>
        {isEdit
          ? <button style={U.iconBtn} onClick={() => { updateTask(task.id, buf); setEditId(null); }}>✓</button>
          : <button style={U.iconBtn} onClick={() => { setBuf({...task}); setEditId(task.id); }}>✎</button>
        }
        <button style={{ ...U.iconBtn, color:"#b50000" }} onClick={() => deleteTask(task.id)}>✕</button>
      </div>
      {isEdit ? (
        <div style={{ ...U.formRow, marginTop:8, paddingLeft:4 }}>
          <input style={{...U.input,fontSize:13}} placeholder="Assigned to…" value={buf.assignee} onChange={e => setBuf({...buf,assignee:e.target.value})} />
          <input style={{...U.input,fontSize:13}} placeholder="Cost estimate…" value={buf.cost} onChange={e => setBuf({...buf,cost:e.target.value})} />
          <input style={{...U.input,fontSize:13}} placeholder="Note…" value={buf.note} onChange={e => setBuf({...buf,note:e.target.value})} />
        </div>
      ) : (
        <div style={U.taskMeta}>
          {task.assignee && <span style={U.badge}>👤 {task.assignee}</span>}
          {task.cost     && <span style={{ ...U.badge, color:"#1a4a2a", background:"#eaf5ee" }}>💰 {task.cost}</span>}
          {task.note     && <span style={{ fontSize:12, color:"#555", fontStyle:"italic" }}>📝 {task.note}</span>}
        </div>
      )}
    </div>
  );
}

// ─── COMPARE TAB ────────────────────────────────
function CompareTab({ prop, updateProp }) {
  const strategies = (prop.strategies && prop.strategies.length) ? prop.strategies : [defStrategy("Option 1","exploring")];
  const [editCell, setEditCell] = useState(null);

  function updateStrat(idx, changes) {
    const updated = strategies.map((s,i) => i===idx ? {...s,...changes} : s);
    updateProp(prop.id, { strategies: updated });
  }
  function addStrat() {
    updateProp(prop.id, { strategies: [...strategies, defStrategy(`Option ${strategies.length+1}`,"exploring")] });
  }
  function removeStrat(idx) {
    updateProp(prop.id, { strategies: strategies.filter((_,i) => i!==idx) });
  }

  const RDOT = ["difficulty","permitRisk"];
  const GDOT = ["marketDemand","bossInterest"];
  const DOT_COLORS = { risk:[null,"#1a6b3a","#4a9b6a","#9a5500","#c06000","#b50000"], good:[null,"#b50000","#c06000","#9a5500","#4a9b6a","#1a6b3a"] };

  function dotColor(key, val) {
    if (!val) return "#ddd";
    if (RDOT.includes(key)) return DOT_COLORS.risk[val];
    if (GDOT.includes(key)) return DOT_COLORS.good[val];
    return "#999";
  }
  const DOT_LABEL = ["—","Low","Mod-Low","Moderate","Mod-High","High"];

  function Cell({ row, strat, idx }) {
    const val = strat[row.key];
    const isEditing = editCell?.idx===idx && editCell?.key===row.key;

    if (row.type==="badge") {
      return (
        <select value={val||"exploring"} onChange={e => updateStrat(idx,{[row.key]:e.target.value})}
          style={{ border:"1px solid #ddd", borderRadius:4, padding:"4px 8px", fontSize:12, fontWeight:700,
                   background:STATUS_BADGE[val]?.bg||"#f8f8f8", color:STATUS_BADGE[val]?.color||"#555", cursor:"pointer" }}>
          {Object.entries(STATUS_BADGE).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      );
    }
    if (row.type==="rating") {
      return (
        <div style={{ display:"flex", gap:4, alignItems:"center", justifyContent:"center" }}>
          {[1,2,3,4,5].map(n => (
            <div key={n} onClick={() => updateStrat(idx,{[row.key]: val===n ? 0 : n})}
              style={{ width:14,height:14,borderRadius:"50%",cursor:"pointer",border:"1px solid #ccc",
                       background: n<=(val||0) ? dotColor(row.key,val||0) : "#eee" }} />
          ))}
          <span style={{ fontSize:11, color:dotColor(row.key,val||0), marginLeft:4 }}>{DOT_LABEL[val||0]}</span>
        </div>
      );
    }
    if (isEditing) {
      return (
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
          <textarea style={C.cellInput} value={val||""} autoFocus
            onChange={e => updateStrat(idx,{[row.key]:e.target.value})} />
          <button style={C.cellSave} onClick={() => setEditCell(null)}>Done</button>
        </div>
      );
    }
    return (
      <div onClick={() => setEditCell({idx,key:row.key})} style={C.cellClick}>
        {val
          ? (row.type==="list"
              ? val.split("\n").filter(Boolean).map((item,i) => <div key={i} style={{fontSize:13,color:"#222",padding:"1px 0"}}>{item}</div>)
              : <span style={{fontSize:13,color:"#222"}}>{val}</span>)
          : <span style={{color:"#bbb",fontSize:12,fontStyle:"italic"}}>Click to add…</span>
        }
      </div>
    );
  }

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div>
          <div style={{ fontSize:16, fontWeight:700, color:"#1a1a1a" }}>Strategy Comparison</div>
          <div style={{ fontSize:13, color:"#555" }}>Compare use cases side by side. Click any cell to edit.</div>
        </div>
        <button style={U.addBtn} onClick={addStrat}>+ Add Strategy</button>
      </div>
      <div style={{ overflowX:"auto", borderRadius:8, border:"1px solid #ddd" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>
              <th style={C.rowHead}>CRITERIA</th>
              {strategies.map((s,i) => {
                const b = STATUS_BADGE[s.status]||STATUS_BADGE.exploring;
                return (
                  <th key={i} style={{ ...C.colHead, background:b.bg, borderBottom:`3px solid ${b.border}`, minWidth:200 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:6 }}>
                      <input value={s.name} onChange={e => updateStrat(i,{name:e.target.value})}
                        style={{ border:"none", background:"transparent", fontWeight:700, fontSize:14, color:b.color, fontFamily:"inherit", width:"100%", cursor:"text" }} />
                      <button onClick={() => { if(window.confirm(`Remove "${s.name}" strategy?`)) removeStrat(i); }}
                        style={{ background:"#fff0f0", border:"1px solid #ffaaaa", color:"#b50000", cursor:"pointer", fontSize:11, padding:"2px 7px", borderRadius:4, flexShrink:0, fontFamily:"inherit", fontWeight:700, whiteSpace:"nowrap" }}>
                        🗑 Remove
                      </button>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {COMPARE_ROWS.map((row,ri) => (
              <tr key={row.key} style={{ background: ri%2===0 ? "#fff" : "#faf8f5" }}>
                <td style={C.rowHead}>{row.label}</td>
                {strategies.map((s,ci) => (
                  <td key={ci} style={C.cell}><Cell row={row} strat={s} idx={ci} /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize:12, color:"#888", marginTop:8 }}>💡 Click any text cell to edit · Click dots to rate · Edit strategy name directly in the column header</div>
    </div>
  );
}

// ─── FINANCIALS TAB ─────────────────────────────
function FinancialsTab({ prop, updateProp }) {
  const fin = prop.financials;
  function upd(k,v) { updateProp(prop.id, { financials: {...fin,[k]:v} }); }
  const eq  = calcEquity(fin);
  const n   = calcNOI(fin);
  const rem = calcRehabLeft(fin);
  const up  = parseDollar(fin.projectedValue) && parseDollar(fin.currentValue)
              ? parseDollar(fin.projectedValue) - parseDollar(fin.currentValue) : null;
  return (
    <div>
      <div style={U.kpiRow}>
        <KPI label="Equity"          val={eq}  fmt={fmt$} color={eq!==null?(eq>=0?"#1a6b3a":"#b50000"):"#aaa"} sub="Value minus Debt" />
        <KPI label="Annual NOI"      val={n}   fmt={fmt$} color={n!==null?(n>=0?"#1a6b3a":"#b50000"):"#aaa"}  sub="Income minus Expenses ×12" />
        <KPI label="Rehab Remaining" val={rem} fmt={fmt$} color={rem!==null?(rem>0?"#9a5500":"#1a6b3a"):"#aaa"} sub="Budget minus Spent" />
        <KPI label="Upside"          val={up}  fmt={fmt$} color="#1a3a6b" sub="Projected minus Current" />
      </div>
      {FIN_GROUPS.map(grp => (
        <div key={grp} style={{ marginBottom:20 }}>
          <div style={U.groupTitle}>{grp}</div>
          <div style={U.finGrid}>
            {FIN_FIELDS.filter(f => f.group===grp).map(f => (
              <div key={f.key} style={{ display:"flex", flexDirection:"column", gap:4 }}>
                <label style={{ fontSize:13, color:"#333", fontWeight:600 }}>{f.label}</label>
                <div style={U.finWrap}>
                  <span style={U.finPrefix}>$</span>
                  <input style={U.finInput} type="text" placeholder="0" value={fin[f.key]} onChange={e => upd(f.key,e.target.value)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div style={U.groupTitle}>Financial Notes</div>
      <textarea style={{ ...U.input, minHeight:80, resize:"vertical", marginTop:6 }}
        placeholder="Financing terms, lender info, deal notes, assumptions…"
        value={fin.notes} onChange={e => upd("notes",e.target.value)} />
    </div>
  );
}
function KPI({ label, val, fmt, color, sub }) {
  return (
    <div style={U.kpiCard}>
      <div style={U.kpiLabel}>{label}</div>
      <div style={{ ...U.kpiVal, color }}>{val !== null ? fmt(String(val)) : "—"}</div>
      <div style={U.kpiSub}>{sub}</div>
    </div>
  );
}

// ─── PARCELS TAB ────────────────────────────────
function ParcelsTab({ prop, updateProp }) {
  const parcels = prop.parcels || [];
  const [editId, setEditId] = useState(null);
  const [buf, setBuf] = useState({});

  function addParcel() {
    const np = defParcel(parcels.length);
    updateProp(prop.id, { parcels:[...parcels,np] });
    setEditId(np.id); setBuf({...np});
  }
  function save() {
    updateProp(prop.id, { parcels: parcels.map(p => p.id===editId ? {...buf} : p) });
    setEditId(null);
  }
  function del(id) {
    updateProp(prop.id, { parcels: parcels.filter(p => p.id!==id) });
  }

  const needsCons   = parcels.filter(p => p.consolidationStatus==="recommended").length;
  const needsEase   = parcels.filter(p => p.consolidationStatus==="easement_recommended").length;
  const totalSF     = parcels.reduce((s,p) => s+(parseFloat(String(p.sqft).replace(/\D/g,""))||0), 0);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div>
          <div style={{ fontSize:16, fontWeight:700 }}>Parcels & Associated Lots</div>
          <div style={{ fontSize:13, color:"#555" }}>All tax parcels, adjacent lots, and associated land in this complex.</div>
        </div>
        <button style={U.addBtn} onClick={addParcel}>+ Add Parcel</button>
      </div>
      {parcels.length > 0 && (
        <div style={U.summBar}>
          <SummItem val={parcels.length} label="Parcels" />
          {totalSF > 0 && <SummItem val={totalSF.toLocaleString()+" SF"} label="Combined SF" />}
          {needsCons > 0 && <SummItem val={needsCons} label="Consolidate" color="#1a6b3a" />}
          {needsEase > 0 && <SummItem val={needsEase} label="Easement Needed" color="#9a5500" />}
        </div>
      )}
      {(needsCons > 0 || needsEase > 0) && (
        <div style={U.guidanceBox}>
          <strong>⚖️ NJ Lot Consolidation:</strong> Combine adjacent same-owner lots via the local planning board ("lot merger"). Takes 2–6 months. Simplifies permits and strengthens financing.{" "}
          <strong>Across-street lots:</strong> Formal merger not possible if a public street separates them — use a recorded parking easement or shared-use covenant instead. CRDA can facilitate this in a priority corridor.
        </div>
      )}
      {parcels.length===0 && <div style={U.empty}>No parcels added yet.</div>}
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {parcels.map(p => {
          const rel = REL[p.relationship]||REL.other;
          const con = CONS[p.consolidationStatus]||CONS.not_applicable;
          const isEdit = editId===p.id;
          return (
            <div key={p.id} style={{ ...U.parcelCard, borderLeft:`4px solid ${rel.color}` }}>
              {isEdit ? (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  <div style={U.formRow}>
                    <div style={{ flex:1 }}><label style={U.lbl}>Label</label><input style={U.input} value={buf.label} onChange={e => setBuf({...buf,label:e.target.value})} /></div>
                    <div style={{ flex:1 }}><label style={U.lbl}>Address</label><input style={U.input} value={buf.address} onChange={e => setBuf({...buf,address:e.target.value})} /></div>
                  </div>
                  <div style={U.formRow}>
                    <div style={{ flex:1 }}><label style={U.lbl}>Block / Lot #</label><input style={U.input} value={buf.blockLot} onChange={e => setBuf({...buf,blockLot:e.target.value})} /></div>
                    <div style={{ flex:1 }}><label style={U.lbl}>Zone</label><input style={U.input} value={buf.zone} onChange={e => setBuf({...buf,zone:e.target.value})} /></div>
                    <div style={{ flex:1 }}><label style={U.lbl}>Sq Ft</label><input style={U.input} value={buf.sqft} onChange={e => setBuf({...buf,sqft:e.target.value})} /></div>
                  </div>
                  <div style={U.formRow}>
                    <div style={{ flex:1 }}><label style={U.lbl}>Relationship</label>
                      <select style={U.input} value={buf.relationship} onChange={e => setBuf({...buf,relationship:e.target.value})}>
                        {Object.entries(REL).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select></div>
                    <div style={{ flex:1 }}><label style={U.lbl}>Consolidation</label>
                      <select style={U.input} value={buf.consolidationStatus} onChange={e => setBuf({...buf,consolidationStatus:e.target.value})}>
                        {Object.entries(CONS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select></div>
                  </div>
                  <div><label style={U.lbl}>Use / Description</label><textarea style={{...U.input,minHeight:50,resize:"vertical"}} value={buf.use} onChange={e => setBuf({...buf,use:e.target.value})} /></div>
                  <div><label style={U.lbl}>Notes</label><textarea style={{...U.input,minHeight:50,resize:"vertical"}} value={buf.notes} onChange={e => setBuf({...buf,notes:e.target.value})} /></div>
                  <div style={{ display:"flex", gap:8 }}>
                    <button style={U.saveBtn} onClick={save}>Save Parcel</button>
                    <button style={U.cancelBtn} onClick={() => setEditId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div>
                      <span style={{ fontSize:11, fontWeight:700, color:rel.color, background:rel.bg, padding:"2px 8px", borderRadius:10, display:"inline-block", marginBottom:5 }}>{rel.label}</span>
                      <div style={{ fontSize:15, fontWeight:700, color:"#1a1a1a" }}>{p.label}</div>
                      {p.address && <div style={{ fontSize:13, color:"#555" }}>{p.address}</div>}
                    </div>
                    <div style={{ display:"flex", gap:6 }}>
                      <button style={U.smBtn} onClick={() => { setBuf({...p}); setEditId(p.id); }}>✎ Edit</button>
                      <button style={{ ...U.smBtn, color:"#b50000" }} onClick={() => del(p.id)}>✕</button>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:16, flexWrap:"wrap", margin:"8px 0" }}>
                    {p.blockLot && <Detail label="Block/Lot" val={p.blockLot} />}
                    {p.zone     && <Detail label="Zone" val={p.zone} />}
                    {p.sqft     && <Detail label="Est. SF" val={p.sqft} />}
                    <Detail label="Consolidation" val={con.label} color={con.color} />
                  </div>
                  {p.use   && <div style={{ fontSize:13, color:"#333", lineHeight:1.6 }}>{p.use}</div>}
                  {p.notes && <div style={{ fontSize:12, color:"#555", fontStyle:"italic", marginTop:4 }}>📝 {p.notes}</div>}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
function SummItem({ val, label, color="#1a3a6b" }) {
  return <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
    <span style={{ fontSize:18, fontWeight:700, color }}>{val}</span>
    <span style={{ fontSize:10, color:"#666", textTransform:"uppercase", letterSpacing:"0.06em", fontFamily:"'Courier New',monospace" }}>{label}</span>
  </div>;
}
function Detail({ label, val, color="#1a1a1a" }) {
  return <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
    <span style={{ fontSize:10, color:"#888", textTransform:"uppercase", letterSpacing:"0.05em", fontFamily:"'Courier New',monospace" }}>{label}</span>
    <span style={{ fontSize:13, fontWeight:600, color }}>{val}</span>
  </div>;
}

// ─── CHECKLIST TAB ──────────────────────────────
function ChecklistTab({ prop, updateProp }) {
  const cl = prop.checklist;
  const done = cl.filter(c => c.done).length;
  const pct  = Math.round((done/cl.length)*100);

  function upd(id, changes) {
    updateProp(prop.id, { checklist: cl.map(c => c.id===id ? {...c,...changes} : c) });
  }

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <span style={{ fontSize:16, fontWeight:700 }}>Property Condition Checklist</span>
        <span style={{ fontSize:13, fontWeight:700, color:"#1a6b3a" }}>{pct}% Complete</span>
      </div>
      <div style={{ height:8, background:"#e0e0e0", borderRadius:4, marginBottom:18 }}>
        <div style={{ height:8, background:"#1a6b3a", borderRadius:4, width:`${pct}%`, transition:"width 0.4s" }} />
      </div>
      {CHECKLIST_CATS.map(cat => {
        const items = cl.filter(c => c.cat===cat);
        const catDone = items.filter(c => c.done).length;
        return (
          <div key={cat} style={{ marginBottom:18 }}>
            <div style={{ display:"flex", justifyContent:"space-between", borderBottom:"2px solid #eee", paddingBottom:6, marginBottom:6 }}>
              <span style={U.groupTitle}>{cat}</span>
              <span style={{ fontSize:12, color: catDone===items.length ? "#1a6b3a" : "#888" }}>{catDone}/{items.length}</span>
            </div>
            {items.map(item => (
              <CheckRow key={item.id} item={item} onUpdate={changes => upd(item.id,changes)} />
            ))}
          </div>
        );
      })}
    </div>
  );
}
function CheckRow({ item, onUpdate }) {
  const [showNote, setShowNote] = useState(false);
  const [noteBuf, setNoteBuf] = useState(item.note||"");
  return (
    <div style={{ ...U.checkRow, background: item.done ? "#f0faf4" : item.na ? "#f8f8f8" : "#fff" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <input type="checkbox" checked={item.done} onChange={() => onUpdate({done:!item.done})}
          style={{ width:18, height:18, cursor:"pointer", accentColor:"#1a6b3a", flexShrink:0 }} />
        <span style={{ fontSize:14, color: item.done ? "#888" : item.na ? "#bbb" : "#1a1a1a",
                       textDecoration: item.done ? "line-through" : "none", flex:1 }}>{item.label}</span>
        <div style={{ display:"flex", gap:6 }}>
          <button style={{ ...U.smBtn, color: item.na ? "#b50000" : "#888", fontSize:11 }}
            onClick={() => onUpdate({na:!item.na})}>{item.na ? "Restore" : "N/A"}</button>
          <button style={{ ...U.smBtn, fontSize:11 }} onClick={() => setShowNote(v=>!v)}>
            {showNote ? "Close" : item.note ? "📝 Note" : "+ Note"}
          </button>
        </div>
      </div>
      {showNote && (
        <div style={{ display:"flex", gap:8, marginTop:8, paddingLeft:28 }}>
          <input style={{...U.input,fontSize:13}} placeholder="Add note…" value={noteBuf} onChange={e => setNoteBuf(e.target.value)} />
          <button style={U.saveBtn} onClick={() => { onUpdate({note:noteBuf}); setShowNote(false); }}>Save</button>
        </div>
      )}
      {!showNote && item.note && <div style={{ paddingLeft:28, marginTop:4, fontSize:12, color:"#555", fontStyle:"italic" }}>📝 {item.note}</div>}
    </div>
  );
}

// ─── NOTES TAB ──────────────────────────────────
function NotesTab({ prop, updateProp }) {
  const [editing, setEditing] = useState(false);
  const [buf, setBuf] = useState(prop.notes||"");
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <span style={{ fontSize:16, fontWeight:700 }}>Property Notes</span>
        <button style={U.smBtn} onClick={() => { setEditing(v=>!v); setBuf(prop.notes||""); }}>
          {editing ? "Cancel" : "Edit"}
        </button>
      </div>
      {editing ? (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <textarea style={{ ...U.input, minHeight:200, resize:"vertical", lineHeight:1.7 }} value={buf} onChange={e => setBuf(e.target.value)} />
          <button style={{ ...U.saveBtn, alignSelf:"flex-start" }} onClick={() => { updateProp(prop.id,{notes:buf}); setEditing(false); }}>Save Notes</button>
        </div>
      ) : (
        <div style={{ fontSize:14, color:"#222", lineHeight:1.8, whiteSpace:"pre-wrap" }}>
          {prop.notes || <em style={{color:"#888"}}>No notes yet. Click Edit to add.</em>}
        </div>
      )}
    </div>
  );
}

// ─── PHOTOS TAB ─────────────────────────────────
function convertDriveUrl(url) {
  // Convert Google Drive share links to direct image URLs
  // Format: https://drive.google.com/file/d/FILE_ID/view?... → https://drive.google.com/uc?export=view&id=FILE_ID
  const match = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  // Handle open?id= format
  const match2 = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (match2) return `https://drive.google.com/uc?export=view&id=${match2[1]}`;
  return url;
}

function PhotosTab({ prop, updateProp }) {
  const photos = prop.photos || [];
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ url:"", caption:"" });
  const [lightbox, setLightbox] = useState(null); // index of photo in lightbox
  const [editIdx, setEditIdx] = useState(null);
  const [editCapBuf, setEditCapBuf] = useState("");
  const [imgErrors, setImgErrors] = useState({});

  function add() {
    if (!form.url.trim()) return;
    const converted = convertDriveUrl(form.url.trim());
    updateProp(prop.id, { photos: [...photos, { id:uid(), url:converted, rawUrl:form.url.trim(), caption:form.caption.trim() }] });
    setForm({ url:"", caption:"" });
    setShowAdd(false);
  }
  function remove(i) {
    if (window.confirm("Remove this photo?"))
      updateProp(prop.id, { photos: photos.filter((_,idx) => idx!==i) });
    if (lightbox === i) setLightbox(null);
  }
  function saveCaption(i) {
    updateProp(prop.id, { photos: photos.map((p,idx) => idx===i ? {...p, caption:editCapBuf} : p) });
    setEditIdx(null);
  }
  function onImgError(i) {
    setImgErrors(prev => ({...prev, [i]: true}));
  }

  const isDrive = (url) => url && url.includes("drive.google.com");

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div>
          <div style={{ fontSize:16, fontWeight:700 }}>Property Photos</div>
          <div style={{ fontSize:13, color:"#555", marginTop:2 }}>Paste a Google Drive link or any direct image URL.</div>
        </div>
        <button style={U.addBtn} onClick={() => { setShowAdd(v=>!v); setEditIdx(null); }}>
          {showAdd ? "✕ Cancel" : "📷 Add Photo"}
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{ ...U.form, marginBottom:20 }}>
          <div>
            <label style={U.lbl}>Image URL or Google Drive Link</label>
            <input style={U.input} placeholder="Paste URL here…"
              value={form.url} onChange={e => setForm({...form, url:e.target.value})} />
            {isDrive(form.url) && (
              <div style={{ fontSize:12, color:"#1a6b3a", marginTop:5 }}>
                ✓ Google Drive link detected — will be auto-converted to display format
              </div>
            )}
          </div>
          <div>
            <label style={U.lbl}>Caption / Label (optional)</label>
            <input style={U.input} placeholder="e.g. Front exterior, Roof damage, Parking lot aerial…"
              value={form.caption} onChange={e => setForm({...form, caption:e.target.value})} />
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button style={U.saveBtn} onClick={add}>Add Photo</button>
            <button style={U.cancelBtn} onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
          {/* Instructions */}
          <div style={PH.instructions}>
            <div style={{ fontWeight:700, marginBottom:6, color:"#555" }}>📌 How to get links from Google Drive:</div>
            <div style={PH.step}><span style={PH.stepNum}>1</span> Open Google Drive and find the photo</div>
            <div style={PH.step}><span style={PH.stepNum}>2</span> Right-click the file → "Get link"</div>
            <div style={PH.step}><span style={PH.stepNum}>3</span> Set sharing to "Anyone with the link" (viewer)</div>
            <div style={PH.step}><span style={PH.stepNum}>4</span> Copy the link and paste it above — it converts automatically</div>
            <div style={{ fontSize:12, color:"#888", marginTop:6 }}>
              Also works with any direct .jpg / .png / .webp URL from the web.
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {photos.length === 0 && !showAdd && (
        <div style={{ ...U.empty, border:"2px dashed #ddd", borderRadius:8, padding:48 }}>
          <div style={{ fontSize:32, marginBottom:12 }}>📷</div>
          <div style={{ fontWeight:700, color:"#555", marginBottom:6 }}>No photos yet</div>
          <div style={{ fontSize:13, color:"#888" }}>Add photos of the property, exterior, interior, or site conditions.</div>
        </div>
      )}

      {/* Photo grid */}
      {photos.length > 0 && (
        <div style={PH.grid}>
          {photos.map((photo, i) => (
            <div key={photo.id || i} style={PH.card}>
              {/* Thumbnail */}
              <div style={PH.imgWrap} onClick={() => !imgErrors[i] && setLightbox(i)}>
                {imgErrors[i] ? (
                  <div style={PH.imgError}>
                    <div style={{ fontSize:28, marginBottom:6 }}>⚠️</div>
                    <div style={{ fontSize:12, color:"#888", textAlign:"center", padding:"0 8px" }}>
                      Image couldn't load.<br/>Check the URL or Drive sharing settings.
                    </div>
                  </div>
                ) : (
                  <img
                    src={photo.url}
                    alt={photo.caption || `Photo ${i+1}`}
                    style={PH.img}
                    onError={() => onImgError(i)}
                    onLoad={() => setImgErrors(prev => ({...prev, [i]:false}))}
                  />
                )}
                {!imgErrors[i] && (
                  <div style={PH.imgOverlay}>🔍 View full size</div>
                )}
              </div>

              {/* Caption + controls */}
              <div style={PH.cardBottom}>
                {editIdx === i ? (
                  <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                    <input style={{ ...U.input, fontSize:13, padding:"5px 8px" }}
                      value={editCapBuf}
                      onChange={e => setEditCapBuf(e.target.value)}
                      placeholder="Caption…"
                      autoFocus />
                    <button style={{ ...U.saveBtn, padding:"5px 10px", fontSize:12 }} onClick={() => saveCaption(i)}>✓</button>
                    <button style={{ ...U.cancelBtn, padding:"5px 10px", fontSize:12 }} onClick={() => setEditIdx(null)}>✕</button>
                  </div>
                ) : (
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:6 }}>
                    <span style={{ fontSize:13, color: photo.caption ? "#1a1a1a" : "#aaa", fontStyle: photo.caption ? "normal" : "italic", flex:1 }}>
                      {photo.caption || "No caption"}
                    </span>
                    <div style={{ display:"flex", gap:4, flexShrink:0 }}>
                      <button style={{ ...U.smBtn, fontSize:11 }} onClick={() => { setEditIdx(i); setEditCapBuf(photo.caption||""); }}>✎</button>
                      <button style={{ ...U.smBtn, fontSize:11, color:"#b50000" }} onClick={() => remove(i)}>🗑</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LIGHTBOX */}
      {lightbox !== null && photos[lightbox] && (
        <div style={PH.lightboxBg} onClick={() => setLightbox(null)}>
          <div style={PH.lightboxBox} onClick={e => e.stopPropagation()}>
            {/* Nav buttons */}
            {lightbox > 0 && (
              <button style={PH.navBtn} onClick={() => setLightbox(lightbox-1)}>‹</button>
            )}
            <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:12, minWidth:0 }}>
              <img
                src={photos[lightbox].url}
                alt={photos[lightbox].caption || `Photo ${lightbox+1}`}
                style={{ maxWidth:"100%", maxHeight:"70vh", objectFit:"contain", borderRadius:6 }}
              />
              {photos[lightbox].caption && (
                <div style={{ fontSize:15, color:"#fff", fontStyle:"italic", textAlign:"center" }}>
                  {photos[lightbox].caption}
                </div>
              )}
              <div style={{ fontSize:12, color:"#aaa" }}>{lightbox+1} of {photos.length}</div>
            </div>
            {lightbox < photos.length-1 && (
              <button style={PH.navBtn} onClick={() => setLightbox(lightbox+1)}>›</button>
            )}
            <button style={PH.closeBtn} onClick={() => setLightbox(null)}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}

const PH = {
  grid:        { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:16 },
  card:        { background:"#fff", border:"1px solid #ddd", borderRadius:8, overflow:"hidden", boxShadow:"0 2px 6px rgba(0,0,0,0.07)" },
  imgWrap:     { position:"relative", paddingBottom:"70%", background:"#f4f0e8", cursor:"pointer", overflow:"hidden" },
  img:         { position:"absolute", top:0, left:0, width:"100%", height:"100%", objectFit:"cover" },
  imgError:    { position:"absolute", top:0, left:0, width:"100%", height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"#f8f5ee" },
  imgOverlay:  { position:"absolute", bottom:0, left:0, right:0, background:"rgba(0,0,0,0.5)", color:"#fff", fontSize:12, textAlign:"center", padding:"6px 0", opacity:0, transition:"opacity 0.2s" },
  cardBottom:  { padding:"10px 12px" },
  instructions:{ background:"#f8f8f8", border:"1px solid #eee", borderRadius:6, padding:"12px 14px", marginTop:8 },
  step:        { display:"flex", alignItems:"center", gap:8, fontSize:13, color:"#444", marginBottom:4 },
  stepNum:     { background:"#9a5500", color:"#fff", borderRadius:"50%", width:20, height:20, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, flexShrink:0 },
  lightboxBg:  { position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.88)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:20 },
  lightboxBox: { display:"flex", alignItems:"center", gap:16, maxWidth:"90vw", position:"relative", width:"100%" },
  navBtn:      { background:"rgba(255,255,255,0.15)", border:"none", color:"#fff", fontSize:36, width:50, height:50, borderRadius:"50%", cursor:"pointer", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1 },
  closeBtn:    { position:"absolute", top:-44, right:0, background:"none", border:"none", color:"#fff", fontSize:24, cursor:"pointer", padding:8 },
};

// ─── DOCS TAB ───────────────────────────────────
function DocsTab({ prop, updateProp }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ label:"", url:"" });
  const [editIdx, setEditIdx] = useState(null);
  const [editBuf, setEditBuf] = useState({ label:"", url:"" });

  function add() {
    if (!form.label.trim()) return;
    updateProp(prop.id, { docs: [...prop.docs, {...form}] });
    setForm({label:"",url:""}); setShowAdd(false);
  }
  function del(i) {
    if (window.confirm(`Remove "${prop.docs[i].label}"?`))
      updateProp(prop.id, { docs: prop.docs.filter((_,idx) => idx!==i) });
  }
  function startEdit(i) {
    setEditIdx(i);
    setEditBuf({ ...prop.docs[i] });
  }
  function saveEdit() {
    if (!editBuf.label.trim()) return;
    updateProp(prop.id, { docs: prop.docs.map((d,i) => i===editIdx ? {...editBuf} : d) });
    setEditIdx(null);
  }

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <span style={{ fontSize:16, fontWeight:700 }}>Documents & Links</span>
        <button style={U.smBtn} onClick={() => { setShowAdd(v=>!v); setEditIdx(null); }}>{showAdd ? "Cancel" : "+ Add Doc"}</button>
      </div>
      {showAdd && (
        <div style={{ ...U.form, marginBottom:14 }}>
          <div style={U.formRow}>
            <input style={U.input} placeholder="Label (e.g. Phase I Report)" value={form.label} onChange={e => setForm({...form,label:e.target.value})} />
            <input style={U.input} placeholder="URL or file path (optional)" value={form.url} onChange={e => setForm({...form,url:e.target.value})} />
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button style={U.saveBtn} onClick={add}>Save Doc</button>
            <button style={U.cancelBtn} onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}
      {prop.docs.length===0 && !showAdd && <div style={U.empty}>No documents linked yet.</div>}
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {prop.docs.map((d,i) => (
          <div key={i} style={{ background:"#fdfcfa", border:"1px solid #ddd", borderRadius:6, padding:"10px 14px" }}>
            {editIdx===i ? (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                <div style={U.formRow}>
                  <input style={U.input} placeholder="Label" value={editBuf.label} onChange={e => setEditBuf({...editBuf,label:e.target.value})} />
                  <input style={U.input} placeholder="URL (optional)" value={editBuf.url} onChange={e => setEditBuf({...editBuf,url:e.target.value})} />
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button style={U.saveBtn} onClick={saveEdit}>Save</button>
                  <button style={U.cancelBtn} onClick={() => setEditIdx(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                <span style={{ flex:1 }}>
                  {d.url
                    ? <a href={d.url} target="_blank" rel="noopener noreferrer" style={{ color:"#9a5500", textDecoration:"none", fontWeight:600, fontSize:14 }}>📄 {d.label}</a>
                    : <span style={{ color:"#333", fontWeight:600, fontSize:14 }}>📄 {d.label}</span>
                  }
                  {d.url && <span style={{ fontSize:11, color:"#aaa", marginLeft:8, wordBreak:"break-all" }}>{d.url}</span>}
                </span>
                <div style={{ display:"flex", gap:6 }}>
                  <button style={U.smBtn} onClick={() => startEdit(i)}>✎ Edit</button>
                  <button style={{ ...U.smBtn, color:"#b50000" }} onClick={() => del(i)}>🗑 Remove</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── STYLES ─────────────────────────────────────
const T = {
  root:        { minHeight:"100vh", background:"#f4f0e8", color:"#1a1a1a", fontFamily:"'Georgia',serif", paddingBottom:60 },
  header:      { background:"#fff", borderBottom:"2px solid #ccc", padding:"18px 24px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 },
  brand:       { fontSize:22, fontWeight:700, letterSpacing:"0.12em", fontFamily:"'Courier New',monospace" },
  brandSub:    { fontSize:12, color:"#888", marginTop:3 },
  stats:       { display:"flex", gap:20, flexWrap:"wrap", alignItems:"center" },
  nav:         { display:"flex", background:"#fff", borderBottom:"1px solid #ccc" },
  navBtn:      { background:"none", border:"none", color:"#888", padding:"12px 22px", cursor:"pointer", fontFamily:"inherit", fontSize:14, borderBottom:"3px solid transparent" },
  navBtnActive:{ color:"#1a1a1a", borderBottom:"3px solid #9a5500", fontWeight:700 },
  urgentBanner:{ background:"#fff5f5", borderBottom:"2px solid #e08080", padding:"14px 24px" },
  urgentTitle: { color:"#b50000", fontWeight:700, fontSize:14, letterSpacing:"0.06em", marginBottom:10 },
  urgentRow:   { display:"flex", gap:12, alignItems:"center", padding:"7px 0", borderTop:"1px solid #f0c0c0", cursor:"pointer", flexWrap:"wrap" },
  urgentProp:  { color:"#9a5500", fontSize:13, fontWeight:700, minWidth:120 },
  urgentTask:  { color:"#1a1a1a", fontSize:13, flex:1 },
  urgentCost:  { color:"#1a6b3a", fontSize:12, fontWeight:600 },
  dashGrid:    { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:16, padding:24 },
  card:        { background:"#fff", border:"1px solid #ccc", borderRadius:8, padding:"16px 18px", cursor:"pointer", boxShadow:"0 2px 6px rgba(0,0,0,0.07)" },
  cardId:      { color:"#777", fontSize:11, letterSpacing:"0.12em", fontWeight:700, fontFamily:"'Courier New',monospace" },
  cardName:    { color:"#1a1a1a", fontSize:15, fontWeight:700, margin:"5px 0 3px" },
  cardLoc:     { color:"#555", fontSize:12, marginBottom:2 },
  cardStrat:   { color:"#9a5500", fontSize:12, fontStyle:"italic", marginBottom:8 },
  cardFin:     { fontSize:12, color:"#333", marginBottom:4 },
  cardMeta:    { display:"flex", gap:12, fontSize:12, marginBottom:8 },
  progOuter:   { height:4, background:"#e0e0e0", borderRadius:2 },
  progInner:   { height:4, background:"#1a6b3a", borderRadius:2, transition:"width 0.3s" },
  propLayout:  { padding:20 },
  addPropBtn:  { background:"#1a3a6b", border:"none", color:"#fff", padding:"9px 20px", borderRadius:6, cursor:"pointer", fontFamily:"inherit", fontSize:14, fontWeight:700, letterSpacing:"0.03em" },
  addPropForm: { background:"#fff", border:"2px solid #1a3a6b", borderRadius:8, padding:"20px 24px", margin:"12px 24px", display:"flex", flexDirection:"column", gap:12, boxShadow:"0 4px 12px rgba(26,58,107,0.12)" },
  addPropTitle:{ fontSize:16, fontWeight:700, color:"#1a3a6b", marginBottom:4 },
  propTabs:    { display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 },
  propTab:     { background:"#fff", border:"1px solid #ccc", color:"#666", padding:"6px 13px", borderRadius:5, cursor:"pointer", fontFamily:"'Courier New',monospace", fontSize:11, fontWeight:600 },
  propTabActive:{ background:"#fff8ee", border:"2px solid #9a5500", color:"#9a5500" },
  detail:      { background:"#fff", border:"1px solid #ddd", borderRadius:8, padding:"20px", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" },
  detailHeader:{ paddingBottom:14, borderBottom:"2px solid #eee", marginBottom:16 },
  detailName:  { fontSize:22, fontWeight:700, marginBottom:4 },
  detailMeta:  { fontSize:13, color:"#555" },
  tabBar:      { display:"flex", borderBottom:"2px solid #eee", marginBottom:18, flexWrap:"wrap" },
  tabBtn:      { background:"none", border:"none", borderBottom:"3px solid transparent", color:"#888", padding:"9px 14px", cursor:"pointer", fontFamily:"inherit", fontSize:13, marginBottom:-2 },
  tabBtnActive:{ color:"#9a5500", borderBottom:"3px solid #9a5500", fontWeight:700 },
  tabContent:  {},
};
const U = {
  row:       { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, flexWrap:"wrap", gap:8 },
  filterRow: { display:"flex", gap:6, flexWrap:"wrap" },
  filterBtn: { background:"none", border:"1px solid #ccc", color:"#555", padding:"5px 12px", borderRadius:4, cursor:"pointer", fontFamily:"inherit", fontSize:13 },
  filterBtnActive:{ border:"2px solid #9a5500", color:"#9a5500", background:"#fff8ee", fontWeight:700 },
  addBtn:    { background:"#fff8ee", border:"2px solid #9a5500", color:"#9a5500", padding:"6px 14px", borderRadius:4, cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:700 },
  smBtn:     { background:"#f4f0e8", border:"1px solid #bbb", color:"#444", padding:"4px 10px", borderRadius:4, cursor:"pointer", fontFamily:"inherit", fontSize:12 },
  saveBtn:   { background:"#eaf5ee", border:"2px solid #1a6b3a", color:"#1a6b3a", padding:"7px 16px", borderRadius:4, cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:700, whiteSpace:"nowrap" },
  cancelBtn: { background:"#f4f0e8", border:"1px solid #bbb", color:"#555", padding:"7px 14px", borderRadius:4, cursor:"pointer", fontFamily:"inherit", fontSize:13 },
  form:      { background:"#fafafa", border:"1px solid #ddd", borderRadius:6, padding:"14px 16px", marginBottom:14, display:"flex", flexDirection:"column", gap:10 },
  formRow:   { display:"flex", gap:8, flexWrap:"wrap" },
  input:     { background:"#fff", border:"1px solid #bbb", color:"#1a1a1a", padding:"8px 12px", borderRadius:4, fontFamily:"inherit", fontSize:14, flex:1, minWidth:120, boxSizing:"border-box" },
  select:    { background:"#fff", border:"1px solid #bbb", color:"#1a1a1a", padding:"8px 12px", borderRadius:4, fontFamily:"inherit", fontSize:14 },
  lbl:       { fontSize:12, fontWeight:700, color:"#444", display:"block", marginBottom:3 },
  taskRow:   { background:"#fdfcfa", borderRadius:6, padding:"11px 14px", borderLeft:"4px solid #ccc", boxShadow:"0 1px 3px rgba(0,0,0,0.05)" },
  taskTop:   { display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" },
  statusSel: { background:"#fff", border:"1px solid #ccc", padding:"4px 8px", borderRadius:4, fontFamily:"inherit", fontSize:12, cursor:"pointer" },
  taskText:  { flex:1, fontSize:14, color:"#1a1a1a", minWidth:100, fontWeight:500 },
  priBadge:  { padding:"3px 9px", borderRadius:4, fontSize:11, fontWeight:700, whiteSpace:"nowrap" },
  iconBtn:   { background:"none", border:"none", color:"#999", cursor:"pointer", fontSize:16, padding:"0 3px" },
  taskMeta:  { display:"flex", gap:8, marginTop:7, flexWrap:"wrap", alignItems:"center" },
  badge:     { fontSize:12, color:"#333", background:"#efefef", padding:"3px 9px", borderRadius:10, fontWeight:600 },
  empty:     { color:"#888", fontSize:14, textAlign:"center", padding:32 },
  kpiRow:    { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:12, marginBottom:22 },
  kpiCard:   { background:"#f8f5ee", border:"1px solid #ddd", borderRadius:8, padding:"13px 15px" },
  kpiLabel:  { fontSize:10, color:"#777", fontFamily:"'Courier New',monospace", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 },
  kpiVal:    { fontSize:19, fontWeight:700, marginBottom:4 },
  kpiSub:    { fontSize:11, color:"#999" },
  groupTitle:{ fontSize:12, fontWeight:700, color:"#666", textTransform:"uppercase", letterSpacing:"0.07em", fontFamily:"'Courier New',monospace", marginBottom:10 },
  finGrid:   { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12 },
  finWrap:   { display:"flex", alignItems:"center", border:"1px solid #bbb", borderRadius:4, background:"#fff", overflow:"hidden" },
  finPrefix: { padding:"8px 10px", background:"#f0ede6", color:"#666", fontSize:14, fontWeight:700, borderRight:"1px solid #ccc" },
  finInput:  { border:"none", outline:"none", padding:"8px 10px", fontSize:14, color:"#1a1a1a", flex:1, fontFamily:"inherit", background:"transparent" },
  summBar:   { display:"flex", gap:20, background:"#f8f5ee", border:"1px solid #ddd", borderRadius:6, padding:"12px 18px", marginBottom:14, flexWrap:"wrap" },
  guidanceBox:{ background:"#fffef5", border:"1px solid #e8d080", borderRadius:6, padding:"12px 16px", marginBottom:16, fontSize:13, color:"#333", lineHeight:1.7 },
  parcelCard:{ background:"#fdfcfa", border:"1px solid #ddd", borderRadius:6, padding:"13px 16px", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" },
  checkRow:  { display:"flex", flexDirection:"column", padding:"9px 12px", borderRadius:5, marginBottom:4, border:"1px solid #eee" },
  docChip:   { display:"flex", alignItems:"center", background:"#f5f0e8", border:"1px solid #ccc", borderRadius:20, padding:"6px 14px", fontSize:13 },
};
const C = {
  rowHead: { background:"#f4f0e8", color:"#555", fontSize:11, fontWeight:700, fontFamily:"'Courier New',monospace", textTransform:"uppercase", letterSpacing:"0.05em", padding:"11px 14px", textAlign:"left", verticalAlign:"top", whiteSpace:"nowrap", borderRight:"2px solid #ddd", borderBottom:"1px solid #eee", minWidth:160 },
  colHead: { padding:"13px 14px", textAlign:"left", verticalAlign:"top", borderRight:"1px solid #ddd", borderBottom:"1px solid #eee" },
  cell:    { padding:"11px 14px", verticalAlign:"top", borderRight:"1px solid #eee", borderBottom:"1px solid #eee" },
  cellClick:{ cursor:"pointer", minHeight:28, borderRadius:4, padding:"3px 4px" },
  cellInput:{ width:"100%", border:"1px solid #bbb", borderRadius:4, padding:"7px 10px", fontFamily:"inherit", fontSize:13, color:"#1a1a1a", resize:"vertical", boxSizing:"border-box", minHeight:60 },
  cellSave: { background:"#eaf5ee", border:"1px solid #1a6b3a", color:"#1a6b3a", padding:"4px 12px", borderRadius:4, cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:700 },
};
