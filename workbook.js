const $ = selector => document.querySelector(selector);
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
let lastStored=null, downloaded="", changed=true, conflict=false, warning="", pending=false;
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
function updateStatus() {
  $("#save-state").textContent = (warning || "Draft saved in this browser.") + " " +
    (downloaded ? "Last backup download requested "+new Date(downloaded).toLocaleString()+". " : "") +
    (changed ? "Download a copy to keep your latest work." : "Your current edits are in the downloaded copy.");
}
function persist(edit=true) {
  if(edit) changed=true;
  try {
    if(conflict || localStorage.getItem(storageKey)!==lastStored) {
      conflict=true;throw Error("Another draft is stored in this browser. Download this copy before reloading.");
    }
    const value=JSON.stringify({book,downloaded,changed});
    localStorage.setItem(storageKey,value);lastStored=value;warning="";
  } catch(error) {warning=conflict ? error.message : "Browser saving is unavailable. Keep this tab open and download a backup.";}
  updateStatus();
}
try {
  lastStored=localStorage.getItem(storageKey);
  if(lastStored) {
    const saved=JSON.parse(lastStored);
    if(!saved.book?.items?.length || !saved.book.project) throw Error();
    markdown(saved.book);
    book=saved.book;active=book.items[0].id;downloaded=saved.downloaded||"";changed=saved.changed!==false;
  }
} catch {warning="Could not open the browser draft. Open a Markdown backup to recover it.";conflict=true;}
if(!warning) persist(false);else updateStatus();
window.addEventListener("beforeunload",event=>{
  if(changed && (warning || downloaded || book.extra || Object.keys(projectSections).some(k=>book.project[k]!==projectSections[k]) || book.items.some(f=>f.requirements.length || f.tests.length || f.manual || f.changes || f.notes))) {
    event.preventDefault();event.returnValue="";
  }
});
function backup(submission=false) {
  const url=URL.createObjectURL(new Blob([markdown(book)],{type:"text/markdown;charset=utf-8"}));
  const a=node("a"); const now=new Date();
  a.download=submission===true ? "REQUIREMENTS_AND_TESTS.md" : "REQUIREMENTS_AND_TESTS_"+now.toISOString().replace(/[:.]/g,"-")+".md";
  a.href=url;document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),30000);
  downloaded=now.toISOString();changed=false;persist(false);
}
$("#backup").onclick=backup;
function selectedFeature() {return book.items.find(f=>f.id===active);}
function authored(text) {return !!text.trim() && !/^<[^>]*>$/.test(text.trim());}
function linked(t,id) {return t.covers.split(/[\s,]+/).includes(id);}
function issues(f) {
  const gaps=[];
  if(!f.requirements.length) gaps.push("Write a requirement.");
  for(const r of f.requirements) {
    if(!authored(r.text)) gaps.push("Write the behaviour for "+r.id+".");
    if(!f.tests.some(t=>linked(t,r.id))) gaps.push("Link a test to "+r.id+".");
  }
  for(const t of f.tests) {
    if(!f.requirements.some(r=>linked(t,r.id))) gaps.push("Choose a requirement for "+t.id+".");
    if(!t.expected.trim()) gaps.push("Give an expected result for "+t.id+".");
    if(!t.how.trim() || !(t.setup.trim() || t.actions.trim())) gaps.push("Describe how to run "+t.id+".");
  }
  return gaps;
}
const panel=$("#editor");
function showList() {
  const list=$("#feature-list");list.replaceChildren();
  for(const f of book.items) {
    const pick=button(f.label,()=>{active=f.id;view="feature";render();});
    pick.title=f.title;pick.setAttribute("aria-label",f.label+" "+f.title);
    pick.append(node("small",f.requirements.length+" req · "+f.tests.length+" tests"));
    pick.append(node("span",f.title,"feature-name"));
    if(f.id===active && view==="feature") pick.setAttribute("aria-current","true");
    list.append(pick);
  }
}
function field(parent,label,obj,key,options=null,hint="") {
  const wrap=node("label",undefined,"wb-field");wrap.append(node("span",label));
  const input=node(options?"select":"textarea");
  input.setAttribute("aria-label",label);
  if(options) for(const value of [...new Set([...(obj[key]?[obj[key]]:[]),...options])]) input.add(new Option(value,value));
  input.value=obj[key]||"";
  if(!options) input.rows=["manual","notes","changes"].includes(key)||obj===book.project?4:2;
  if(hint) wrap.append(node("small",hint));
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
  persist();render();
}
function featureEditor(f) {
  panel.append(node("p",f.label,"eyebrow"),node("h2",f.title));
  const tabs=node("div",undefined,"wb-tabs");
  for(const name of ["Requirements","Tests","Notes","Results"]) {
    const b=button(name,()=>{tab=name;render();});b.setAttribute("aria-pressed",String(tab===name));tabs.append(b);
  }
  panel.append(tabs);
  if(tab==="Requirements") {
    panel.append(node("p","What must the monitor do? Give the values, units and boundaries. Consider invalid data and how the user reaches the feature. Explain any points that do not apply."));
    if(f.id.startsWith("X")) panel.append(node("p","Describe your method, comparison baseline and measurable target."));
    for(const r of f.requirements) {
      const box=entry(r.id);field(box,"Required behaviour",r,"text");
      box.append(node("small","Linked tests: "+(f.tests.filter(t=>linked(t,r.id)).map(t=>t.id).join(", ")||"None yet")));
      box.append(button("Add a test for "+r.id,()=>{tab="Tests";addRecord(f,"test",r.id);},"quiet"));
      box.append(button("Remove requirement",()=>removeEntry(f,f.requirements,r),"quiet"));
    }
    panel.append(button("Add requirement",()=>addRecord(f,"requirement"),"primary"));
  } else if(tab==="Tests") {
    panel.append(node("p","Link each test to the requirements it checks. Give the input and the observation that will count as a pass."));
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
      box.append(group);field(box,"Test method or serial test filename",t,"how");
      field(box,"Starting conditions",t,"setup");field(box,"Actions or inputs",t,"actions");
      field(box,"Expected result",t,"expected");box.append(button("Remove test",()=>removeEntry(f,f.tests,t),"quiet"));
    }
    panel.append(button("Add test",()=>addRecord(f,"test"),"primary"));
    field(panel,"By-hand steps",f,"manual",null,"Identify the test and give numbered instructions another engineer can follow.");
  } else if(tab==="Notes") {
    field(panel,"Implementation notes",f,"notes",null,"Record design decisions, errors, fixes or questions to revisit.");
    field(panel,"Changes since first submission",f,"changes",null,"Describe what changed and why. Keep your first submission as a dated backup.");
    field(panel,"Feature status",f,"status",["Planned","Implemented","Partly implemented","Dropped"]);
    field(panel,"Claim this feature for final marking?",f,"claimed",["","Yes","No"]);
  } else {
    if(!f.tests.length) panel.append(node("p","Add a test in the Tests tab to record its result."));
    for(const t of f.tests) {
      const box=entry(t.id);box.append(node("p","Expected: "+(t.expected||"Enter an expected result in Tests.")));
      field(box,"Test result",t,"status",["Not yet run","Pass","Fail"]);
      field(box,"Actual observation or error",t,"observed");field(box,"Log filename or evidence reference",t,"log");
    }
  }
  const details=node("details");details.className="wb-check";
  const summary=node("summary","Check this feature");details.append(summary);
  details.ontoggle=()=>{
    const previous=details.querySelector("ul");previous?.remove();
    if(details.open) {
      const ul=node("ul"),gaps=issues(f);
      for(const msg of (gaps.length?gaps:["Requirements and test links are present. Check their wording and expected results."])) ul.append(node("li",msg));
      details.append(ul);
    }
  };
  panel.append(details);
}
function render() {
  panel.replaceChildren();showList();
  if(view==="feature") featureEditor(selectedFeature());
  if(view==="project") {
    panel.append(node("h2","Project details"),node("p","Update the details used on your board. These sections appear in your Markdown document."));
    for(const key of Object.keys(projectSections)) field(panel,key,book.project,key);
    if(book.extra) field(panel,"Additional imported text",book,"extra",null,"Review wording from your imported file that did not fit a workbook field.");
  }
  if(view==="review") {
    panel.append(node("h2","Review document"),node("p","Select a feature to review its entries. Keep a dated Markdown copy before each Blackboard submission."));
    panel.append(button("Download REQUIREMENTS_AND_TESTS.md",()=>backup(true),"primary"),node("p","Upload this file and the other required files on Blackboard."));
    for(const f of book.items) {
      const b=button(f.label+" · "+f.title,()=>{active=f.id;view="feature";tab="Requirements";render();},"review-link");
      const gaps=issues(f),failed=f.tests.filter(t=>t.status==="Fail").length;
      panel.append(b,node("small",(gaps[0]||"Requirements and tests linked.")+" "+failed+" failed, "+f.tests.filter(t=>t.status==="Pass").length+" passed, "+f.tests.filter(t=>!t.status||t.status==="Not yet run").length+" not yet run."));
    }
    const details=node("details");details.append(node("summary","Read full Markdown document"),node("pre",markdown(book)));panel.prepend(details);
  }
}
$("#project").onclick=()=>{view="project";render();};
$("#review").onclick=()=>{view="review";render();};
function promptChange(message,action,apply) {
  const holder=$("#pending");holder.replaceChildren();pending=true;
  const close=()=>{pending=false;holder.replaceChildren();$("#import-file").value="";};
  holder.append(node("p",message),button("Download current backup",backup),button(action,()=>{close();apply();}),button("Cancel",close));
  holder.scrollIntoView({block:"nearest"});
}
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
  } catch(error) {$("#notice").textContent=error.message;$("#import-file").value="";}
};
if(params.has("features") && lastStored) {
  const additions=chosen.filter(f=>!book.items.some(old=>old.id===f.id));
  const restored=book.items.filter(f=>f.status==="Dropped" && chosen.some(x=>x.id===f.id));
  const removed=book.items.filter(f=>!chosen.some(x=>x.id===f.id) && f.status!=="Dropped");
  const p02=chosen.find(f=>f.id==="P02");
  const settingText=p02?pickedRecord(p02).notes:"";
  const menu=book.items.find(f=>f.id==="P02");
  const updateMenu=menu && settingText && !menu.notes.includes(settingText);
  if(additions.length||removed.length||restored.length||updateMenu) promptChange(
    "Apply your picker choices? Add: "+(additions.map(f=>f.label).join(", ")||"none")+". Mark as dropped: "+
    (removed.map(f=>f.label).join(", ")||"none")+". Restore as planned: "+(restored.map(f=>f.label).join(", ")||"none")+". Existing requirements, tests and results stay in the workbook. "+(updateMenu?settingText:""),
    "Apply choices",()=>{
      additions.forEach(f=>book.items.push(pickedRecord(f)));
      removed.forEach(f=>{f.status="Dropped";f.claimed="No";});
      restored.forEach(f=>{f.status="Planned";f.claimed="";});
      if(updateMenu)menu.notes += "\n"+settingText;
      persist();render();
    });
  history.replaceState(null,"",location.pathname);
}
render();
