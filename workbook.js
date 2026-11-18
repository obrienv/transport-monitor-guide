const $ = selector => document.querySelector(selector);
// Books saved before 17 November lack the new sections and the access field. Old serial-protocol text is kept under Additional imported text.
function upgrade(saved) {
  const old=saved.project["Extra state fields and event kinds"];
  saved.project={...projectSections,...saved.project};
  delete saved.project["Extra state fields and event kinds"];
  if(old && old.trim()) saved.extra=[saved.extra,"Extra state fields and event kinds (old serial protocol)\n"+old.trim()].filter(Boolean).join("\n\n");
  for(const f of saved.items) {f.access ??= "";f.manual ??= "";f.changes ??= "";}
  return saved;
}
const storageKey = "setu.tm.2026.workbook.v1";
const params = new URLSearchParams(location.search);
const plannedIDs = new Set((params.get("features") ?? loadList("plan").join(",")).split(","));
function includeDependencies(id) {
  const f=features.find(x=>x.id===id);
  if(f?.needs) {plannedIDs.add(f.needs);includeDependencies(f.needs);}
}
[...plannedIDs].forEach(includeDependencies);
const chosen=features.filter(f=>f.group==="Core" || plannedIDs.has(f.id));
function pickedRecord(f) {
  const record=featureRecord(f.id,f.label,f.title);
  if(f.settingsSources) {
    const settings=params.has("settings") ? params.get("settings").split(",") : loadList("menu-settings");
    if(settings.filter(Boolean).length) record.notes="Planned menu settings from "+settings.join(", ")+".";
  }
  return record;
}
let book=emptyBook();
book.items=chosen.map(pickedRecord);
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
// "- Label: value" lines, as used in Student details and Build and setup.
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
function backup(submission=false) {
  const url=URL.createObjectURL(new Blob([markdown(book)],{type:"text/markdown;charset=utf-8"}));
  const a=node("a"); const now=new Date();
  const number=detail("student number").replace(/[^A-Za-z0-9]/g,"");
  a.download=submission===true ? "REQUIREMENTS_AND_TESTS.md" : "REQUIREMENTS_AND_TESTS_"+(number?number+"_":"")+stamp(now)+".md";
  a.href=url;document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),30000);
  downloaded=now.toISOString();changed=false;persist(false);
}
$("#backup").onclick=backup;
function selectedFeature() {return book.items.find(f=>f.id===active) || book.items[0];}
function authored(text) {return !!text.trim() && !/^<[^>]*>$/.test(text.trim());}
function linked(t,id) {return t.covers.split(/[\s,]+/).includes(id);}
function isFinal() {return detail("submission").toLowerCase()==="final";}
function issues(f) {
  const gaps=[];
  if(!f.requirements.length) gaps.push("Write a requirement.");
  for(const r of f.requirements) if(!authored(r.text)) gaps.push("Write the behaviour for "+r.id+".");
  if(!isFinal()) return gaps;
  for(const r of f.requirements) if(!f.tests.some(t=>linked(t,r.id))) gaps.push("Link a test to "+r.id+".");
  if(!f.access.trim()) gaps.push("Say how to reach or observe "+f.label+" from Home.");
  for(const t of f.tests) {
    if(!f.requirements.some(r=>linked(t,r.id))) gaps.push("Choose a requirement for "+t.id+".");
    if(!t.expected.trim()) gaps.push("Give an expected result for "+t.id+".");
    if(!t.how.trim() || !(t.setup.trim() || t.actions.trim())) gaps.push("Describe how to run "+t.id+".");
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
  if(!isFinal()) return ["Requirements written","ready"];
  if(pass===f.tests.length) return ["All passed","pass"];
  return ["Ready to test","ready"];
}
const panel=$("#editor");
function showList() {
  const list=$("#feature-list"), select=$("#feature-select");
  list.replaceChildren();select.replaceChildren();
  // Core features first, then the student's own choices, each under a heading with its count.
  const isCore=f=>features.find(x=>x.id===f.id)?.group==="Core";
  const groups=[["Core",book.items.filter(isCore)],["Planned",book.items.filter(f=>!isCore(f))]].filter(([,items])=>items.length);
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
  if(!gaps.length) {box.append(node("b",isFinal()?"Requirements, linked tests and the access route are present.":"Requirements are present."),node("span",isFinal()?"Check their wording and expected results.":"Check that another engineer could test each one."));return;}
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
  if(!options) input.rows=["manual","access","notes","changes"].includes(key)||obj===book.project?4:2;
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
    "EX1-R4: If the humidity reading becomes invalid while HUMID_HIGH is active, HUMID_HIGH is no longer shown as an alarm cause and the humidity fault is reported. When a valid reading returns, the alarm starts again only if the reading is greater than humidity_max_pct.",
    "EX1-R5: The user sets humidity_clear_pct from Home under Settings > Limits > Humidity clear."
  ]) ul.append(node("li",line));
  const more=node("p");const link=node("a","Read the full EX1 example with its tests");link.href="resources.html#read-ex1";more.append(link,".");
  box.append(ul,more);return box;
}
function featureEditor(f) {
  panel.append(node("p",f.label,"feature-code"),node("h2",f.title));
  const meta=node("div",undefined,"wb-meta");
  field(meta,"Feature status",f,"status",["Planned","Implemented","Partly implemented","Dropped"]).addEventListener("change",showList);
  // The claim, the Results tab and the changes note belong to the final submission.
  // They appear once Project details > Submission is set to Final; their saved values are kept either way.
  const final=isFinal();
  if(final) {
    field(meta,"Claim this feature for final marking?",f,"claimed",["","Yes","No"]);
    meta.append(node("small","Claim only features your own tests show working."));
  }
  panel.append(meta);
  if(!final && ["Tests","Results","Access"].includes(tab)) tab="Requirements";
  const tabs=node("div",undefined,"wb-tabs");
  for(const name of final ? ["Requirements","Tests","Results","Access","Notes"] : ["Requirements","Notes"]) {
    const b=button(name,()=>{tab=name;render("tab");});b.setAttribute("aria-pressed",String(tab===name));tabs.append(b);
  }
  panel.append(tabs);
  if(tab==="Requirements") {
    panel.append(node("p","What must the monitor do? Give the values, units and boundaries. Consider invalid data and how the user reaches the feature from Home. Explain any points that do not apply. Write each requirement so that another engineer could test it."));
    if(f.id.startsWith("X")) panel.append(node("p","Describe your method, the baseline you compare against, your measurable target and what your replay and physical tests will show."));
    panel.append(example());
    for(const r of f.requirements) {
      const box=entry(r.id);field(box,"Required behaviour",r,"text");
      if(final) {
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
      box.append(group);field(box,"Test method",t,"how",null,f.id.startsWith("X")?"For example Replay with your data file name, or Physical with how you measure.":"For example Physical: tilt with a phone inclinometer, Buttons and screen, or Serial log.");
      field(box,"Starting state",t,"setup");field(box,"Actions or inputs",t,"actions");
      field(box,"Expected result",t,"expected");box.append(button("Remove test",()=>removeEntry(f,f.tests,t),"quiet"));
    }
    panel.append(button("Add test",()=>addRecord(f,"test"),"primary"));
    field(panel,"Test procedures",f,"manual",null,"For each test, give numbered steps another engineer can follow on identical hardware without you there.");
  } else if(tab==="Notes") {
    field(panel,"Implementation notes",f,"notes",null,"Record design decisions, errors, fixes or questions to revisit.");
    if(final) field(panel,"Changes since first submission",f,"changes",null,"Describe what changed and why. Keep your first submission as a dated backup.");
    else panel.append(node("p","Tests, results, the access route, the claim and the changes note belong to the final submission. They appear when you set Submission to Final in Project details.","wb-hint"));
  } else if(tab==="Access") {
    panel.append(node("p","This is your Feature Access Guide entry for this feature. Start from Home."));
    field(panel,"Access from Home",f,"access",null,"Give the button presses from Home, what the screen shows, how to operate the feature and how to return to Home. For a feature that works on its own, say how to trigger it or see its effect. Then give the navigation test you ran on the final binary and its result.");
  } else {
    if(!f.tests.length) panel.append(node("p","Add a test in the Tests tab to record its result."));
    for(const t of f.tests) {
      const box=entry(t.id);box.append(node("p","Expected: "+(t.expected||"Enter an expected result in Tests.")));
      field(box,"Test result",t,"status",["Not yet run","Pass","Fail"]);
      field(box,"Actual observation or error",t,"observed");field(box,"Evidence (log file, photo, measurement)",t,"log");
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
    const choices=pair[0]==="Submission" && ["","First","Final"].includes(pair[1]) ? ["First","Final"] : null;
    const input=node(choices?"select":"input");input.id=id;
    if(choices) for(const value of choices) input.add(new Option(value,value));
    input.value=pair[1];
    input.addEventListener(choices?"change":"input",()=>{pair[1]=input.value;write();});
    grid.append(label,input);
  });
  panel.append(grid);
}
function buttonMap() {
  const key="Button map";
  panel.append(node("h3",key,"section"),node("p","Give the button press for each action your firmware supports, such as next screen, open menu, confirm or cancel.","wb-hint"));
  const lines=book.project[key].split("\n").filter(line=>line.trim());
  const parsed=lines.map(cells);
  if(!lines.length || parsed.some(v=>v.length!==2)) {field(panel,key,book.project,key);return;}
  const rows=parsed.filter(v=>!(v[0]==="Action" && v[1]==="Button press") && !/^-+$/.test(v[0])).filter(v=>v[0]||v[1]);
  if(!rows.length) rows.push(["",""]);
  const write=()=>{book.project[key]=table(["Action","Button press"],rows.length?rows:[["",""]]);persist();};
  const grid=node("table",undefined,"wb-rows");
  const head=grid.createTHead().insertRow();
  for(const title of ["Action","Button press",""]) {const th=node("th",title);th.scope="col";head.append(th);}
  const body=grid.createTBody();
  const draw=()=>{
    body.replaceChildren();
    rows.forEach((pair,i)=>{
      const tr=body.insertRow();
      [0,1].forEach(col=>{
        const input=node("input");input.value=pair[col];
        input.setAttribute("aria-label",(col?"Button press":"Action")+" "+(i+1));
        input.placeholder=col?"for example short press D2":"for example next screen";
        input.oninput=()=>{pair[col]=input.value;write();};
        tr.insertCell().append(input);
      });
      tr.insertCell().append(button("Remove",()=>{rows.splice(i,1);write();draw();},"quiet"));
    });
  };
  draw();
  panel.append(grid,button("Add action",()=>{rows.push(["",""]);draw();body.lastElementChild.querySelector("input").focus();}));
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
    tr.insertCell().textContent=f.status==="Dropped" ? "Give the reason under Notes, in Changes since first submission." : (counts.fail ? "Fix the failure, run the test again and record the new result." : gaps[0] || (counts.open ? "Run the tests and record the results." : "Nothing outstanding."));
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
    panel.append(node("h3","Plan","section"));
    field(panel,"Plan",book.project,"Plan",null,"In a few sentences, say why you chose these features and the order you will build them in.");
    lineEditor("Build and setup");
    panel.append(node("h3","Home screen","section"));
    field(panel,"Home screen",book.project,"Home screen",null,"What Home shows, and how the user gets from Home to the measurements, the settings and your other features.");
    buttonMap();
    panel.append(node("h3","Serial output","section"));
    field(panel,"Serial output",book.project,"Serial output",null,"Describe the layout of your live serial output (C12), its update rate, and an example line.");
    panel.append(node("h3","Known limitations","section"));
    field(panel,"Known limitations",book.project,"Known limitations",null,"Record anything that does not work as your requirements say, or that you could not test.");
    for(const wrap of panel.querySelectorAll("h3.section + .wb-field")) wrap.classList.add("plain");
    if(book.extra) field(panel,"Additional imported text",book,"extra",null,"Review wording from your imported file that did not fit a workbook field.");
  }
  if(view==="review") {
    const [grid,totals]=reviewTable();
    const started=book.items.filter(f=>f.requirements.length||f.tests.length).length;
    panel.append(node("h2","Review document"),
      node("p",started+" of "+book.items.length+" features started. Tests: "+totals.pass+" passed, "+totals.fail+" failed, "+totals.open+" not yet run. Select a feature to work on it."),
      grid,
      node("h3","Download the file for Blackboard","section"),
      node("p","This file is named REQUIREMENTS_AND_TESTS.md. Upload it on Blackboard. The dated backups from the toolbar are for you to keep and are not submitted."));
    // Check before the file that is marked: details filled in, and every planned feature complete for this submission.
    const missing=[["name","Name"],["student number","Student number"],["build id","Build ID"]].filter(([key])=>!detail(key)).map(([,label])=>label);
    const gapped=book.items.filter(f=>f.status!=="Dropped" && issues(f).length);
    const check=node("div",undefined,"wb-check");
    check.classList.toggle("done",!missing.length && !gapped.length);
    const list=node("ul");
    list.append(node("li",missing.length ? "Missing in Project details: "+missing.join(", ")+"." : "Name, student number and build ID are filled in."));
    const what=isFinal() ? "requirements, linked tests and an access route" : "requirements";
    list.append(node("li",gapped.length ? (book.items.length-gapped.length)+" of "+book.items.length+" features have their "+what+". Still to finish: "+gapped.map(f=>f.label).join(", ")+"." : "Every planned feature has its "+what+"."));
    check.append(node("b",missing.length||gapped.length ? "Before you submit" : "Ready to download"),list);
    const done=node("p","",undefined);done.setAttribute("role","status");
    const download=()=>{backup(true);done.textContent="Downloaded REQUIREMENTS_AND_TESTS.md at "+clock(new Date().toISOString())+". Upload it on Blackboard with your other files.";};
    panel.append(check,button("Download REQUIREMENTS_AND_TESTS.md",()=>{
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
    "If the work is yours, download a backup first. The feature choices saved in the picker are cleared as well.",
    "Remove this draft and start new",()=>{
      saveList("plan",[]);saveList("menu-settings",[]);
      book=emptyBook();book.items=features.filter(f=>f.group==="Core").map(f=>featureRecord(f.id,f.label,f.title));
      active=book.items[0].id;view="project";tab="Requirements";downloaded="";changed=false;
      persist(false);render();
      $("#notice").replaceChildren("New workbook started with the 12 core features. Enter your details below, then ");
      const link=node("a","choose your other features in the picker");link.href="picker.html";$("#notice").append(link,".");
    });
};
// Shared lab PCs: download a backup, then, once the student has checked it, remove every saved item of this site from the browser.
$("#finish").onclick=()=>{
  backup();
  promptChange("A backup has been downloaded. Check that it is in your Downloads folder, then remove your workbook, feature choices and roadmap ticks from this browser so the next student cannot see them.",
    "Remove my work from this PC",()=>{
      try {for(const key of Object.keys(localStorage)) if(key.startsWith("setu.tm.2026.")) localStorage.removeItem(key);} catch {}
      book=emptyBook();book.items=features.filter(f=>f.group==="Core").map(f=>featureRecord(f.id,f.label,f.title));
      active=book.items[0].id;view="feature";tab="Requirements";downloaded="";changed=false;lastStored=null;conflict=false;
      persist(false);render();
      $("#notice").textContent="Your work was removed from this browser. Keep your downloaded backup to continue on another computer.";
    });
};
$("#import-file").onchange=async event=>{
  const file=event.target.files[0];if(!file)return;
  try {
    const incoming=parseBook(await file.text());
    const count=incoming.items.reduce((n,f)=>n+f.requirements.length,0);
    promptChange("Open "+file.name+"? Found "+incoming.items.length+" features and "+count+" requirements. "+
      (incoming.extra?"Additional wording is preserved in Project details. ":"")+"Download your current work before replacing it.",
      "Open this workbook",()=>{
        book=incoming;active=book.items[0].id;view="feature";tab="Requirements";downloaded="";
        persist();render();$("#notice").textContent="Opened "+file.name+".";
      });
  } catch(error) {$("#notice").textContent=error.message;$("#notice").classList.add("warn");$("#import-file").value="";}
};
if(!warning) persist(false);else updateStatus();
if(params.has("features") && lastStored) {
  // Picker choices arrive in the address. Additions lose nothing, so they are applied at once.
  // A feature that leaves the plan is removed if it is still empty, and otherwise marked Dropped after the student agrees.
  const untouched=f=>!f.requirements.length && !f.tests.length && !f.manual.trim() && !f.changes.trim();
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
    ". Mark as dropped? The requirements, tests and results stay in the workbook, and you give the reason under Notes.",
    "Mark as dropped",()=>{
      removed.forEach(f=>{f.status="Dropped";f.claimed="No";});
      persist();render();
    });
  history.replaceState(null,"",location.pathname);
}
render();
