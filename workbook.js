const $ = selector => document.querySelector(selector);
// Books saved before 17 November lack the new sections and the access field. Old serial-protocol text is kept under Additional imported text.
function upgrade(saved) {
  const old=saved.project["Extra state fields and event kinds"];
  saved.project={...projectSections,...saved.project};
  delete saved.project["Extra state fields and event kinds"];
  if(old && old.trim()) saved.extra=[saved.extra,"Extra state fields and event kinds (old serial protocol)\n"+old.trim()].filter(Boolean).join("\n\n");
  for(const f of saved.items) {
    f.access ??= "";f.manual ??= "";
    if(f.changes?.trim()) f.notes=[f.notes,f.changes].filter(Boolean).join("\n\n");
    delete f.changes;
  }
  return preserveEarlierDetails(saved);
}
const legacyKey = "setu.tm.2026.workbook.v1";
const params = new URLSearchParams(location.search);
const part = params.get("part") === "2" || (!params.has("part") && params.has("features")) ? 2 : 1;
const storageKey = "setu.tm.2026.workbook.part" + part;
const inPart = f => part === 1 ? partOneIDs.has(f.id) : f.group === "Core" || plannedIDs.has(f.id);
const plannedIDs = new Set((params.get("features") ?? loadList("plan").join(",")).split(","));
function includeDependencies(id) {
  const f=features.find(x=>x.id===id);
  if(f?.needs) {plannedIDs.add(f.needs);includeDependencies(f.needs);}
}
[...plannedIDs].forEach(includeDependencies);
const chosen=features.filter(inPart);
function scopeTitle(f) {
  return part===1 ? partOneTitles[f.id] || f.title : f.title;
}
function pickedRecord(f) {
  const record=featureRecord(f.id,f.label,scopeTitle(f));
  if(f.settingsSources) {
    const settings=params.has("settings") ? params.get("settings").split(",") : loadList("menu-settings");
    if(settings.filter(Boolean).length) record.notes="Planned menu settings from "+settings.join(", ")+".";
  }
  return record;
}
function setPart(book) {
  const details=book.project["Student details"];
  book.project["Student details"]=/^- Submission:.*$/m.test(details)
    ? details.replace(/^- Submission:.*$/m,"- Submission: Part "+part)
    : details+"\n- Submission: Part "+part;
  return book;
}
function newBook() {
  const draft=setPart(emptyBook());
  draft.items=chosen.map(pickedRecord);
  return draft;
}
let book=newBook();
let announcedWarning="", lastStored=null, downloaded="", savedAt="", changed=true, conflict=false, warning="", pending=false;
let active=book.items[0].id, tab="Requirements", view="feature";
function node(tag,text,cls) {
  const el=document.createElement(tag);
  if(text!==undefined) el.textContent=text;
  if(cls) el.className=cls;
  return el;
}
function button(label,fn,cls) {
  const el=node("button",label,cls);el.type="button";el.onclick=fn;return el;
}
// "- Label: value" lines in Student details.
function listLines(text) {
  const lines=text.split("\n").filter(line=>line.trim());
  const pairs=lines.map(line=>line.match(/^- ([^:]+):[ \t]?(.*)$/));
  return lines.length && pairs.every(Boolean) ? pairs.map(m=>[m[1],m[2]]) : null;
}
function detail(label) {
  const found=(listLines(book.project["Student details"])||[]).find(([key])=>key.toLowerCase()===label);
  const value=found ? found[1].trim() : "";
  return /^<[^>]*>$/.test(value) ? "" : value;
}
const clock=iso=>new Date(iso).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
const dayAndClock=iso=>new Date(iso).toLocaleDateString([], {day:"numeric",month:"short"})+" at "+clock(iso);
function updateStatus() {
  const name=detail("name"), number=detail("student number");
  $("#owner").textContent = name || number
    ? "Workbook of "+[name,number].filter(Boolean).join(", ")+". If this is not you, choose Start new workbook."
    : "This workbook has no name yet. Add your name and student number in Project details.";
  const backupText = !downloaded ? "No backup downloaded yet."
    : changed ? "You have changes since your last backup ("+dayAndClock(downloaded)+")."
    : "Backup downloaded "+dayAndClock(downloaded)+" holds your latest work.";
  $("#save-state").textContent = (warning || "Saved in this browser"+(savedAt ? " at "+clock(savedAt) : "")+".")+" "+backupText;
  document.querySelector(".wb-owner").classList.toggle("warn",!!warning);
  // The save line changes on every keystroke, so it is not a live region. A new saving problem is announced once in the notice area.
  if(warning && warning!==announcedWarning) {$("#notice").textContent=warning;$("#notice").classList.add("warn");}
  announcedWarning=warning;
}
function persist(edit=true) {
  if(edit) changed=true;
  try {
    if(conflict || localStorage.getItem(storageKey)!==lastStored) {
      conflict=true;throw Error("Another draft is stored in this browser. Download this copy before reloading.");
    }
    const now=new Date().toISOString();
    const value=JSON.stringify({book,downloaded,changed,savedAt:now});
    localStorage.setItem(storageKey,value);lastStored=value;savedAt=now;warning="";
  } catch(error) {warning=conflict ? error.message : "Browser saving is unavailable. Keep this tab open and download a backup.";}
  updateStatus();refreshMeta();
}
try {
  lastStored=localStorage.getItem(storageKey);
  if(lastStored) {
    const saved=JSON.parse(lastStored);
    if(!saved.book?.items?.length || !saved.book.project) throw Error();
    const upgraded=upgrade(saved.book);
    for (const entry of upgraded.items) {
      const definition=features.find(f=>f.id===entry.id);
      if(definition) {
        entry.label=definition.label;
        entry.title=scopeTitle(definition);
      }
    }
    markdown(upgraded);
    book=upgraded;active=book.items[0].id;downloaded=saved.downloaded||"";changed=saved.changed!==false;savedAt=saved.savedAt||"";
  }
} catch {warning="Could not open the browser draft. Open a Markdown backup to recover it.";conflict=true;}
// The browser asks before leaving only when the draft could not be saved in this browser.
window.addEventListener("beforeunload",event=>{
  if(warning && changed) {event.preventDefault();event.returnValue="";}
});
function stamp(now) {
  const two=n=>String(n).padStart(2,"0");
  return now.getFullYear()+"-"+two(now.getMonth()+1)+"-"+two(now.getDate())+"_"+two(now.getHours())+two(now.getMinutes());
}
function downloadBook(draft, filename) {
  const url=URL.createObjectURL(new Blob([markdown(draft)],{type:"text/markdown;charset=utf-8"}));
  const link=node("a");
  link.download=filename;link.href=url;document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),30000);
}
const submissionName="PART_"+part+"_REQUIREMENTS_AND_TESTS.md";
function backup(submission=false) {
  const now=new Date();
  const number=detail("student number").replace(/[^A-Za-z0-9]/g,"");
  downloadBook(book,submission===true ? submissionName : submissionName.replace(".md","_"+(number?number+"_":"")+stamp(now)+".md"));
  downloaded=now.toISOString();changed=false;persist(false);
}
$("#backup").onclick=backup;
function selectedFeature() {return book.items.find(f=>f.id===active) || book.items[0];}
function authored(text) {return !!text.trim() && !/^<[^>]*>$/.test(text.trim());}
function linked(t,id) {return t.covers.split(/[\s,]+/).includes(id);}
function issues(f) {
  const gaps=[];
  if(!f.requirements.length) gaps.push("Write a requirement.");
  for(const r of f.requirements) if(!authored(r.text)) gaps.push("Write the behaviour for "+r.id+".");
  for(const r of f.requirements) if(!f.tests.some(t=>linked(t,r.id))) gaps.push("Link a test to "+r.id+".");
  if(!f.access.trim()) gaps.push("Say how to reach or observe "+f.label+" on the device.");
  for(const t of f.tests) {
    if(!f.requirements.some(r=>linked(t,r.id))) gaps.push("Choose a requirement for "+t.id+".");
    if(!t.expected.trim()) gaps.push("Give an expected result for "+t.id+".");
    if(!t.setup.trim()) gaps.push("Give a starting state for "+t.id+".");
    if(!t.how.trim() || !t.actions.trim()) gaps.push("Describe how to run "+t.id+".");
    if(t.status==="Not yet run" || !t.status) gaps.push("Record the outcome or explain why "+t.id+" could not be run.");
    if(!t.observed.trim()) gaps.push("Record the observation or limitation for "+t.id+".");
  }
  return gaps;
}
function tally(f) {
  return {pass:f.tests.filter(t=>t.status==="Pass").length, fail:f.tests.filter(t=>t.status==="Fail").length,
    open:f.tests.filter(t=>!t.status||t.status==="Not yet run").length};
}
// One word on where a feature stands, shown in the feature list and the review table.
function standing(f) {
  const {pass,fail}=tally(f);
  if(f.status==="Dropped") return ["Dropped",""];
  if(fail) return [fail+" failed","fail"];
  if(!f.requirements.length && !f.tests.length) return ["Not started",""];
  if(issues(f).length) return ["Incomplete","part"];
  if(pass===f.tests.length) return ["All passed","pass"];
  return [f.tests.some(t=>t.status==="Unable to test")?"Test limitation recorded":"Ready to test","ready"];
}
$("#scope-link").href=part===1 ? "brief.html#early" : "brief.html#core";
$("#scope-link").textContent=part===1 ? "Read the nine Part 1 features" : "Read the four Part 2A additions and their workbook IDs";
$("#scope-note").textContent=part===1 ? "Record requirements, tests and results for your basic monitor. Record how to observe each feature." : "Carry forward your Part 1 work, then update the requirements and record results for the final binary. Record gyro work under C03 and C12, tilt under C06 and C07, Home and navigation under C09 and C10, and editable limits under C13.";
const panel=$("#editor");
function showList() {
  const list=$("#feature-list"), select=$("#feature-select");
  list.replaceChildren();select.replaceChildren();
  // Core features first, then the student's own choices, each under a heading with its count.
  const isCore=f=>features.find(x=>x.id===f.id)?.group==="Core";
  const groups=[
    [part===1 ? "Part 1 basic monitor" : "Part 1 features to retain and retest",book.items.filter(f=>partOneIDs.has(f.id))],
    ["Part 2A additional feature records",book.items.filter(f=>isCore(f) && !partOneIDs.has(f.id))],
    ["Part 2 optional features",book.items.filter(f=>!isCore(f))]
  ].filter(([,items])=>items.length);
  for(const [name,items] of groups) {
    list.append(node("p",name+" ("+items.length+")","wb-group"));
    const optgroup=document.createElement("optgroup");optgroup.label=name+" ("+items.length+")";select.append(optgroup);
  for(const f of items) {
    const [word,cls]=standing(f);
    const pick=button(undefined,()=>{active=f.id;view="feature";render("feature");});
    pick.title=f.title;pick.setAttribute("aria-label",f.label+" "+f.title+", "+word);pick.dataset.id=f.id;
    pick.append(node("span",f.label,"feature-id"),node("span",word,"badge "+cls),node("span",f.title,"feature-name"),
      node("small",f.requirements.length+" req · "+f.tests.length+" tests","feature-count"));
    if(f.id===active && view==="feature") pick.setAttribute("aria-current","true");
    list.append(pick);
    optgroup.append(new Option(f.label+" · "+word+" · "+f.title,f.id));
  }
  }
  for(const [id,name] of [["features-view","feature"],["project","project"],["review","review"]]) $("#"+id).setAttribute("aria-pressed",String(view===name));
  if(view==="feature") select.value=active; else select.selectedIndex=-1;
}
$("#feature-select").onchange=event=>{active=event.target.value;view="feature";render();};
// Refreshes the status words while the student types, without redrawing the form.
function refreshMeta() {
  for(const pick of document.querySelectorAll("#feature-list button")) {
    const f=book.items.find(x=>x.id===pick.dataset.id);if(!f) continue;
    const [word,cls]=standing(f);
    pick.querySelector(".badge").textContent=word;pick.querySelector(".badge").className="badge "+cls;
    pick.querySelector(".feature-count").textContent=f.requirements.length+" req · "+f.tests.length+" tests";
  }
}
// The "Still to do" box is a live region, so it is refreshed when the student leaves a field, and only if its list changed.
panel.addEventListener("focusout",()=>{
  const box=panel.querySelector(".wb-check[role=status]");
  if(box && view==="feature") fillCheck(box,selectedFeature());
});
function fillCheck(box,f) {
  const gaps=issues(f), key=gaps.join("|");
  if(box.dataset.gaps===key && box.childElementCount) return;
  box.dataset.gaps=key;
  box.replaceChildren();box.classList.toggle("done",!gaps.length);
  if(!gaps.length) {box.append(node("b","Requirements, linked tests and the access route are present."),node("span","Check their wording and expected results."));return;}
  box.append(node("b","Still to do for "+f.label));
  const ul=node("ul");for(const msg of gaps.slice(0,6)) ul.append(node("li",msg));
  if(gaps.length>6) ul.append(node("li","And "+(gaps.length-6)+" more."));
  box.append(ul);
}
let hintCount=0;
function field(parent,label,obj,key,options=null,hint="") {
  const wrap=node("label",undefined,"wb-field");wrap.append(node("span",label));
  const input=node(options?"select":"textarea");
  input.setAttribute("aria-label",label);
  if(options) for(const value of [...new Set([...(obj[key]?[obj[key]]:[]),...options])]) input.add(new Option(value||"Not decided",value));
  input.value=obj[key]||"";
  if(!options) input.rows=["manual","access","notes"].includes(key)||obj===book.project?4:2;
  if(hint) {const small=node("small",hint);small.id="hint-"+(++hintCount);input.setAttribute("aria-describedby",small.id);wrap.append(small);}
  input.addEventListener(options?"change":"input",()=>{obj[key]=input.value;persist();});
  wrap.append(input);parent.append(wrap);return input;
}
function addRecord(f,type,requirement="") {
  const req=type==="requirement";
  const entries=req?f.requirements:f.tests;
  const id=nextID(entries,f.id+(req?"-R":"-T"));
  const added=req?{id,text:""}:newTest(id);
  if(requirement) added.covers=requirement;
  entries.push(added);persist();render();
  const last=panel.querySelectorAll(".entry");last[last.length-1]?.querySelector("textarea,input,select")?.focus();
}
function entry(id) {
  const box=node("article",undefined,"entry");box.append(node("h3",id));panel.append(box);return box;
}
function removeEntry(f,arr,item) {
  if(!confirm("Remove "+item.id+" from this workbook?")) return;
  arr.splice(arr.indexOf(item),1);
  if(arr===f.requirements) for(const t of f.tests) t.covers=t.covers.split(/[\s,]+/).filter(id=>id && id!==item.id).join(", ");
  persist();render("heading");
}
function example() {
  const box=node("details");box.className="example";
  box.append(node("summary","See example requirements (EX1, an invented feature)"));
  box.append(node("p","EX1 is humidity hysteresis. It is not in the project. Each line gives exact values, the boundary, the behaviour with invalid data, or how the user reaches the feature."));
  const ul=node("ul");
  for(const line of [
    "EX1-R1: The humidity alarm HUMID_HIGH starts when relative humidity is greater than humidity_max_pct.",
    "EX1-R2: Once HUMID_HIGH is active, it clears only when relative humidity is less than or equal to humidity_clear_pct.",
    "EX1-R3: humidity_clear_pct has a default of 65%, a step of 1%, and must be at least 1 percentage point below humidity_max_pct. The menu refuses a value that breaks this rule, shows why, and keeps the old value.",
    "EX1-R4: If humidity is unavailable at startup, report the humidity sensor fault and mark the humidity reading unavailable. Keep the humidity alarm inactive until a valid reading permits evaluation.",
    "EX1-R5: The user sets humidity_clear_pct from Home under Settings > Limits > Humidity clear."
  ]) ul.append(node("li",line));
  const more=node("p");const link=node("a","Read the full EX1 example with its tests");link.href="resources.html#read-ex1";more.append(link,".");
  box.append(ul,more);return box;
}
function featureEditor(f) {
  panel.append(node("p",f.label,"feature-code"),node("h2",f.title));
  const meta=node("div",undefined,"wb-meta");
  field(meta,"Feature status",f,"status",["Planned","Implemented","Partly implemented",...(features.some(item=>item.id===f.id && item.group==="Core")?[]:["Dropped"])]).addEventListener("change",showList);
  const final=part===2;
  if(final) {
    field(meta,"Claim this feature for final marking?",f,"claimed",["","Yes","No"]);
    meta.append(node("small","Claim only features your own tests show working."));
  }
  panel.append(meta);
  const tabs=node("div",undefined,"wb-tabs");
  for(const name of ["Requirements","Tests","Results","Access","Notes"]) {
    const b=button(name,()=>{tab=name;render("tab");});b.setAttribute("aria-pressed",String(tab===name));tabs.append(b);
  }
  panel.append(tabs);
  if(tab==="Requirements") {
    panel.append(node("p","What must the monitor do? Give the values, units and boundaries. Include behaviour on invalid data where relevant. Record the route or observation instructions in Access. Write each requirement so that another engineer could test it."));
    if(f.id.startsWith("X")) panel.append(node("p","Describe your method, the baseline you compare against, your justified performance objectives and what your replay and physical tests will show."));
    panel.append(example());
    for(const r of f.requirements) {
      const box=entry(r.id);field(box,"Required behaviour",r,"text");
      {
        box.append(node("small","Linked tests: "+(f.tests.filter(t=>linked(t,r.id)).map(t=>t.id).join(", ")||"None yet")));
        box.append(node("br"),button("Add a test for "+r.id,()=>{tab="Tests";addRecord(f,"test",r.id);},"quiet"));
      }
      box.append(button("Remove requirement",()=>removeEntry(f,f.requirements,r),"quiet"));
    }
    panel.append(button("Add requirement",()=>addRecord(f,"requirement"),"primary"));
  } else if(tab==="Tests") {
    panel.append(node("p","Link each test to the requirements it checks. Give the starting state, what you do, how you measure it and the result that counts as a pass."));
    for(const t of f.tests) {
      const box=entry(t.id), group=node("fieldset");group.append(node("legend","Requirements covered"));
      if(!f.requirements.length) group.append(node("p","Add a requirement in the Requirements tab."));
      for(const r of f.requirements) {
        const label=node("label"),cb=node("input");cb.type="checkbox";cb.checked=linked(t,r.id);
        cb.onchange=()=>{
          const ids=new Set(t.covers.split(/[\s,]+/).filter(Boolean));
          if(cb.checked)ids.add(r.id);else ids.delete(r.id);
          t.covers=[...ids].join(", ");persist();
        };
        label.append(cb," "+r.id+" "+r.text.slice(0,80));group.append(label);
      }
      box.append(group);field(box,"Test method",t,"how",null,f.id.startsWith("X")?"For example serial replay with the supplied replay case identified, or a physical test with a stated measurement method.":"For example tilt the board and measure its angle with a phone inclinometer, or observe a named value in the serial monitor.");
      field(box,"Starting state",t,"setup");field(box,"Actions or inputs",t,"actions",null,"Give the steps another person needs to repeat this test.");
      field(box,"Expected result",t,"expected");box.append(button("Remove test",()=>removeEntry(f,f.tests,t),"quiet"));
    }
    panel.append(button("Add test",()=>addRecord(f,"test"),"primary"));
    field(panel,"Test procedures",f,"manual",null,"Use this optional space if a test needs a longer procedure. Refer to its test ID.");
  } else if(tab==="Notes") {
    field(panel,"Implementation notes",f,"notes",null,"Record design decisions, errors, fixes or questions to revisit.");

  } else if(tab==="Access") {
    panel.append(node("p",final ? "Give the route from Home for a feature you operate. For an automatic feature, explain how to trigger or observe it." : "Explain how to observe this feature on your Part 1 monitor."));
    field(panel,"How to access or observe the feature",f,"access",null,"Explain where to see the behaviour, how to trigger it and what appears on the TFT or serial output. Include button presses if the feature uses them.");
  } else {
    if(!f.tests.length) panel.append(node("p","Add a test in the Tests tab to record its result."));
    for(const t of f.tests) {
      const box=entry(t.id);box.append(node("p","Expected: "+(t.expected||"Enter an expected result in Tests.")));
      field(box,"Test result",t,"status",["Not yet run","Pass","Fail","Unable to test"]);
      field(box,"Actual observation or error",t,"observed");
      if(t.log.trim()) field(box,"Supporting data from an earlier draft",t,"log");
    }
  }
  const check=node("div",undefined,"wb-check");check.setAttribute("role","status");fillCheck(check,f);
  panel.append(check);
}
// Project details: one box per "- Label: value" line. Text that does not fit that layout stays editable as plain text.
function lineEditor(key,hint) {
  panel.append(node("h3",key,"section"));
  if(hint) panel.append(node("p",hint,"wb-hint"));
  const pairs=listLines(book.project[key]);
  if(!pairs) {field(panel,key,book.project,key);return;}
  const grid=node("div",undefined,"wb-kv");
  const write=()=>{book.project[key]=pairs.map(([label,value])=>"- "+label+": "+value.replace(/\n/g," ")).join("\n");persist();};
  pairs.forEach((pair,i)=>{
    const id="kv-"+key.replace(/\W/g,"")+"-"+i, label=node("label",pair[0]);label.htmlFor=id;
    const input=node("input");input.id=id;
    input.value=pair[1];
    input.readOnly=pair[0]==="Submission";
    input.addEventListener("input",()=>{pair[1]=input.value;write();});
    grid.append(label,input);
  });
  panel.append(grid);
}
function reviewTable() {
  const grid=node("table",undefined,"review");
  const head=grid.createTHead().insertRow();
  for(const title of ["Feature","Stands at","Req","Tests","Passed","Failed","Next thing to do"]) {const th=node("th",title);th.scope="col";head.append(th);}
  const body=grid.createTBody(), totals={pass:0,fail:0,open:0};
  for(const f of book.items) {
    const tr=body.insertRow(), counts=tally(f), [word,cls]=standing(f), gaps=issues(f);
    if(f.status==="Dropped") tr.className="dropped";
    for(const key of Object.keys(totals)) totals[key]+=counts[key];
    tr.insertCell().append(button(f.label+" · "+f.title,()=>{active=f.id;view="feature";tab="Requirements";render("heading");}));
    tr.insertCell().append(node("span",word,"badge "+cls));
    for(const value of [f.requirements.length,f.tests.length,counts.pass,counts.fail]) tr.insertCell().textContent=value;
    tr.insertCell().textContent=f.status==="Dropped" ? "This feature is outside your current selection." : (counts.fail ? "Keep the observed failure. If you fix it, rerun the test and record the new result." : gaps[0] || (counts.open ? "Run the tests and record the results." : "Nothing outstanding."));
  }
  return [grid,totals];
}
// render() rebuilds the list and the editor, which removes the control the student just used.
// Focus then moves to its replacement, or to the editor heading, so keyboard users keep their place.
function focusHeading() {
  const heading=panel.querySelector("h2");if(!heading) return;
  heading.tabIndex=-1;heading.focus();
}
function restoreFocus(target) {
  const control=target==="tab" ? panel.querySelector(".wb-tabs button[aria-pressed=true]")
    : target==="feature" ? $("#feature-list button[aria-current]") : null;
  if(control) control.focus();
  if(!control || document.activeElement!==control) focusHeading();
}
// A notice reports what just happened, so the next redraw after it clears it. The first draw keeps picker news.
let keepNotice=true;
function render(focusTarget) {
  if(!keepNotice) {$("#notice").replaceChildren();$("#notice").classList.remove("warn");}
  keepNotice=false;
  panel.replaceChildren();showList();
  if(view==="feature") featureEditor(selectedFeature());
  if(view==="project") {
    panel.append(node("h2","Project details"),node("p","Update the details used on your board. These sections appear in your Markdown document."));
    lineEditor("Student details","The build ID must match the build ID your firmware prints on the serial port at start-up.");
    panel.append(node("h3","Optional setup instructions","section"));
    field(panel,"Optional setup instructions",book.project,"Optional setup instructions",null,"Give any steps or settings specific to your submission that the lecturer needs before running the tests. Leave blank if the standard lab setup works.");
    for(const wrap of panel.querySelectorAll("h3.section + .wb-field")) wrap.classList.add("plain");
    if(book.project["Earlier feature entries"]) panel.append(node("p","Earlier features are preserved in this file and available when you carry it into Part 2."));
    if(book.extra) field(panel,"Imported text and earlier results",book,"extra",null,"Check preserved entries and results here. Record fresh outcomes in the Results tab.");
  }
  if(view==="review") {
    const [grid,totals]=reviewTable();
    const started=book.items.filter(f=>f.requirements.length||f.tests.length).length;
    panel.append(node("h2","Review document"),
      node("p",started+" of "+book.items.length+" features started. Tests: "+totals.pass+" passed, "+totals.fail+" failed, "+totals.open+" not yet run. Select a feature to work on it."),
      grid,
      node("h3","Download the file for Blackboard","section"),
      node("p","Upload "+submissionName+", your source code and one full merged firmware image (*.ino.merged.bin) on Blackboard."));
    // Check before the file that is marked: details filled in, and every planned feature complete for this submission.
    const missing=[["name","Name"],["student number","Student number"],["build id","Build ID"]].filter(([key])=>!detail(key)).map(([,label])=>label);
    const gapped=book.items.filter(f=>f.status!=="Dropped" && issues(f).length);
    const check=node("div",undefined,"wb-check");
    check.classList.toggle("done",!missing.length && !gapped.length);
    const list=node("ul");
    list.append(node("li",missing.length ? "Missing in Project details: "+missing.join(", ")+"." : "Name, student number and build ID are filled in."));
    const what="requirements, linked tests, recorded results and instructions for accessing or observing the feature";
    list.append(node("li",gapped.length ? (book.items.length-gapped.length)+" of "+book.items.length+" features have their "+what+". Still to finish: "+gapped.map(f=>f.label).join(", ")+"." : "Every planned feature has its "+what+"."));
    check.append(node("b",missing.length||gapped.length ? "Before you submit" : "Ready to download"),list);
    const done=node("p","",undefined);done.setAttribute("role","status");
    const download=()=>{backup(true);done.textContent="Downloaded "+submissionName+" at "+clock(new Date().toISOString())+". Upload it on Blackboard with your source code and full merged firmware image (*.ino.merged.bin).";};
    panel.append(check,button("Download "+submissionName,()=>{
      if(!missing.length && !gapped.length) {download();return;}
      promptChange("Your file is not complete yet. "+(missing.length?"Project details are missing "+missing.join(", ")+". ":"")+(gapped.length?gapped.length+" features still have gaps. ":"")+"Download it anyway?","Download anyway",download);
    },"primary"),done);
    const details=node("details");details.append(node("summary","Read full Markdown document"),node("pre",markdown(book)));panel.append(details);
  }
  if(focusTarget) restoreFocus(focusTarget);
}
$("#features-view").onclick=()=>{view="feature";render();};
$("#project").onclick=()=>{view="project";render();};
$("#review").onclick=()=>{view="review";render();};
function promptChange(message,action,apply) {
  const holder=$("#pending");holder.replaceChildren();pending=true;
  // The prompt's buttons disappear when it closes, so focus returns to the control that opened it or to the editor heading.
  const opener=document.activeElement!==document.body ? document.activeElement : null;
  const close=()=>{pending=false;holder.replaceChildren();$("#import-file").value="";};
  const cancel=()=>{close();if(opener?.isConnected) opener.focus();else focusHeading();};
  holder.append(node("p",message),button("Download current backup",backup),button(action,()=>{close();apply();focusHeading();}),button("Cancel",cancel));
  holder.scrollIntoView({block:"nearest"});
}
$("#new-book").onclick=()=>{
  const written=book.items.reduce((n,f)=>n+f.requirements.length+f.tests.length,0);
  const owner=[detail("name"),detail("student number")].filter(Boolean).join(", ");
  promptChange("Start a new workbook? This removes the draft stored in this browser"+(owner?", which belongs to "+owner:"")+". It holds "+written+" requirements and tests. "+
    "If the work is yours, download a backup first. Your other draft and picker choices stay available.",
    "Remove this draft and start new",()=>{

      book=newBook();
      active=book.items[0].id;view="project";tab="Requirements";downloaded="";changed=false;
      persist(false);render();
      $("#notice").textContent="New Part "+part+" workbook started.";

    });
};
// Browser drafts and Markdown share the same workbook structure.
function readDraft(key) {
  const raw=localStorage.getItem(key);
  if(!raw) return null;
  const saved=JSON.parse(raw);
  return upgrade(saved.book);
}
function sourcePart(draft) {
  return Number(draft.project["Student details"].match(/^- Submission: Part ([12])\s*$/m)?.[1] || 0);
}
function importGuide(incoming, name, original) {
  const source=sourcePart(incoming);
  if(source===2 && part===1) throw Error("Open the Part 2 workbook to import this file.");
  const previousResults=source===1 && part===2;
  const legacy=source===0;
  const draft=structuredClone(incoming);
  if(previousResults && draft.project["Earlier feature entries"]) {
    const earlier=parseBook(draft.project["Earlier feature entries"]);
    draft.items.push(...earlier.items.filter(f=>!draft.items.some(current=>current.id===f.id)));
    draft.project["Earlier feature entries"]="";
  }
  const moved=part===1 ? draft.items.filter(f=>!partOneIDs.has(f.id)) : [];
  const reused=part===2 && (legacy || previousResults) ? draft.items.filter(f=>!inPart(features.find(item=>item.id===f.id) || f)) : [];
  draft.items=draft.items.filter(f=>!moved.includes(f));
  for(const f of chosen) {
    const record=draft.items.find(item=>item.id===f.id);
    if(!record) draft.items.push(pickedRecord(f));
    else {
      record.label=f.label;
      record.title=scopeTitle(f);
    }
  }
  const prior=[];
  for(const f of draft.items) {
    const changedScope=legacy;
    if(changedScope || previousResults) {
      if(f.claimed || f.tests.some(t=>t.status!=="Not yet run" || t.observed || t.log)) {
        prior.push(f.id+": "+JSON.stringify({claimed:f.claimed,tests:f.tests.filter(t=>t.status!=="Not yet run" || t.observed || t.log).map(({id,status,observed,log})=>({id,status,observed,log}))}));
      }
      f.claimed=reused.includes(f)?"No":"";f.status=reused.includes(f)?"Dropped":"Planned";
      for(const t of f.tests) {t.status="Not yet run";t.observed="";t.log="";}
    }
  }
  if(previousResults || legacy) {
    const details=draft.project["Student details"];
    draft.project["Student details"]=details.replace(/^- Build ID:.*$/gm,"- Build ID:");
  }
  if(moved.length) {
    const archive=structuredClone(incoming);
    archive.items=moved;
    draft.project["Earlier feature entries"]=markdown(archive);
  }
  if(prior.length) draft.extra=[draft.extra,"Previous test results for reference. Run the tests on this build.\n"+prior.join("\n")].filter(Boolean).join("\n\n");
  setPart(draft);
  const existing=book.items.filter(f=>f.requirements.length || f.tests.length || f.notes.trim() || f.access.trim()).map(f=>f.id);
  const overlap=draft.items.filter(f=>existing.includes(f.id)).map(f=>f.id);
  promptChange("Import "+name+" into Part "+part+"? This opens the imported document as the current draft. "+
    (overlap.length?"Already edited in this draft: "+overlap.join(", ")+". ":"")+
    (moved.length? "Carried forward when you open this draft in Part 2: "+moved.map(f=>f.id).join(", ")+". ":"")+
    (reused.length?"Earlier choices kept as unselected entries: "+reused.map(f=>f.id).join(", ")+". Re-select them in the picker to reuse them. ":"")+
    (legacy && part===1?"Review imported requirements against the new Part 1 scope. ":"")+
    (previousResults?"Part 1 outcomes stay historical. Enter new results for this build. ":"")+
    "Download your current draft if you need both copies.",
    "Import into Part "+part,()=>{
      try {
        const previous=localStorage.getItem(storageKey);
        if(previous && !conflict) localStorage.setItem(storageKey+".before-import",previous);
      } catch {showImportError(Error("Could not save a recovery copy. Download your current draft before continuing."));return;}
      backup();
      if(original) saveOriginal(original, "TM_ORIGINAL_"+stamp(new Date())+".md");
      book=draft;active=book.items[0].id;view="feature";tab="Requirements";downloaded="";
      persist();render();$("#recover-import").hidden=false;
      if(!warning) $("#notice").textContent="Imported into Part "+part+".";
    });
}
function saveOriginal(source, name) {
  const url=URL.createObjectURL(new Blob([source],{type:"text/markdown;charset=utf-8"}));
  const link=node("a");link.href=url;link.download=name;
  document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),30000);
}
function showImportError(error) {
  $("#notice").textContent=error.message;$("#notice").classList.add("warn");
}
function importDraft(key, label) {
  try {
    const source=readDraft(key);
    if(!source) throw Error("No "+label+" was found in this browser. Use Import previous work to open a Markdown backup.");
    importGuide(source,label);
  } catch(error) {showImportError(error);}
}
$("#recover-import").onclick=()=>importDraft(storageKey+".before-import","draft before last import");
try {$("#recover-import").hidden=!localStorage.getItem(storageKey+".before-import");} catch {}
$("#recover").onclick=()=>importDraft(legacyKey,"older browser draft");
$("#carry").onclick=()=>importDraft("setu.tm.2026.workbook.part1","Part 1 browser draft");
$("#part-"+(part===1?"one":"two")).setAttribute("aria-current","page");
$("#part-summary").textContent=part===1 ? "Part 1 · Basic monitor" : "Part 2 · Extended monitor";
$("#pick-features").hidden=part===1;
$("#carry").hidden=part!==2;
try {$("#recover").hidden=!localStorage.getItem(legacyKey);} catch {}
$("#finish").onclick=()=>{
  backup();
  promptChange("Download backups for every draft you want to keep before removing your work from this shared PC.",
    "Remove my work from this PC",()=>{
      try {
        for(const [key,name] of [[legacyKey,"OLD"],["setu.tm.2026.workbook.part"+(3-part),"PART_"+(3-part)]]) {
          const draft=readDraft(key);
          if(draft) downloadBook(draft,"TM_"+name+"_"+stamp(new Date())+".md");
        }
        for(const key of Object.keys(localStorage)) if(key.startsWith("setu.tm.2026.")) localStorage.removeItem(key);
      } catch(error) {showImportError(error);return;}
      book=newBook();active=book.items[0].id;view="feature";tab="Requirements";downloaded="";changed=false;lastStored=null;conflict=false;
      $("#recover").hidden=true;$("#recover-import").hidden=true;
      persist(false);render();
      $("#notice").textContent="Your drafts were removed from this browser. Keep your backups.";
    });
};
$("#import-file").onchange=async event=>{
  const file=event.target.files[0];if(!file)return;
  try {
    const original=await file.text();
    const incoming=parseBook(original);
    importGuide(incoming,file.name,sourcePart(incoming)===0 ? original : "");
  } catch(error) {showImportError(error);event.target.value="";}
};
if(!warning) persist(false);else updateStatus();
if(part===2 && params.has("features") && lastStored) {
  // Picker choices arrive in the address. Additions lose nothing, so they are applied at once.
  // A feature that leaves the plan is removed if it is still empty, and otherwise marked Dropped after the student agrees.
  const untouched=f=>!f.requirements.length && !f.tests.length && !f.manual.trim() && !f.notes.trim() && !f.access.trim();
  const additions=chosen.filter(f=>!book.items.some(old=>old.id===f.id));
  const restored=book.items.filter(f=>f.status==="Dropped" && chosen.some(x=>x.id===f.id));
  const leaving=book.items.filter(f=>!chosen.some(x=>x.id===f.id) && f.status!=="Dropped");
  const emptied=leaving.filter(untouched), removed=leaving.filter(f=>!untouched(f));
  const p02=chosen.find(f=>f.id==="P02");
  const settingText=p02?pickedRecord(p02).notes:"";
  additions.forEach(f=>book.items.push(pickedRecord(f)));
  restored.forEach(f=>{f.status="Planned";f.claimed="";});
  book.items=book.items.filter(f=>!emptied.includes(f));
  const menu=book.items.find(f=>f.id==="P02");
  const updateMenu=menu && settingText && !menu.notes.includes(settingText);
  if(updateMenu) menu.notes += (menu.notes?"\n":"")+settingText;
  const order=features.map(f=>f.id);
  book.items.sort((x,y)=>(order.indexOf(x.id)<0?999:order.indexOf(x.id))-(order.indexOf(y.id)<0?999:order.indexOf(y.id)));
  if(additions.length||restored.length||emptied.length||updateMenu) {
    persist();
    const parts=[];
    if(additions.length) parts.push("Added: "+additions.map(f=>f.label).join(", ")+".");
    if(restored.length) parts.push("Restored as planned: "+restored.map(f=>f.label).join(", ")+".");
    if(emptied.length) parts.push("Removed, because nothing was written for them: "+emptied.map(f=>f.label).join(", ")+".");
    $("#notice").textContent="Your picker choices are applied. "+parts.join(" ");
  }
  if(removed.length) promptChange(
    "You removed "+removed.map(f=>f.label).join(", ")+" in the picker, but you have already written requirements or tests for "+(removed.length>1?"them":"it")+
    ". Mark as dropped? The requirements, tests and results stay in the workbook.",
    "Mark as dropped",()=>{
      removed.forEach(f=>{f.status="Dropped";f.claimed="No";});
      persist();render();
    });
  history.replaceState(null,"",location.pathname+"?part=2");
}
render();
