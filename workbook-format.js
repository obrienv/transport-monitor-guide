/* The visible Markdown is the interchange format. Read the text on every import. */
const projectSections = {
  "Student details": "- Name:\n- Student number:\n- Build ID:\n- Submission: First\n- Date:",
  "Build and setup": "- Toolchain and version:\n- Libraries and versions:\n- Board settings:\n- How to build:\n- How to flash the binary:\n- Accelerometer range:\n- IMU sample rate:\n- AHT20 read interval:",
  "Button map": "| Action | Button press |\n|---|---|\n| | |",
  "Extra state fields and event kinds": "",
  "Known limitations": ""
};
const testFields = ["id","covers","how","setup","expected","status","actions","observed","log"];
const testHead = ["Test","Covers","How","Setup","Expected result","Result","Actions or inputs","Actual observation","Log or evidence"];
function featureRecord(id, label, title) {
  return {id,label,title,status:"Planned",claimed:"",requirements:[],tests:[],manual:"",notes:"",changes:""};
}
function emptyBook() { return {project:{...projectSections}, items:[], extra:""}; }
function newTest(id) {
  return Object.fromEntries(testFields.map(key => [key,key === "id" ? id : key === "status" ? "Not yet run" : ""]));
}
function nextID(entries,prefix) {
  const n = Math.max(0,...entries.map(e=>e.id.startsWith(prefix) ? Number(e.id.slice(prefix.length)) || 0 : 0));
  return prefix+(n+1);
}
function cell(value) {
  return String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
    .replaceAll("|","&#124;").replaceAll("\n","<br>").replaceAll("\t","&#9;")
    .replace(/^ +| +$/g,spaces=>"&#32;".repeat(spaces.length));
}
function uncell(value) {
  return value.replaceAll("<br>","\n").replaceAll("&#124;","|").replaceAll("&#9;","\t").replaceAll("&#32;"," ").replaceAll("&lt;","<").replaceAll("&gt;",">").replaceAll("&amp;","&");
}
function row(values) {return "| "+values.map(cell).join(" | ")+" |";}
function table(head, rows) {
  return [row(head),row(head.map(()=>"---")),...rows.map(row)].join("\n");
}
// Protect heading-like lines typed into a multiline field from becoming document headings.
function block(text) { return text.replace(/^([\\]*#)/gm,"\\$1"); }
function unblock(text) { return text.replace(/^\\([\\]*#)/gm,"$1"); }
function markdown(book) {
  const lines=["# Transport Monitor: Requirements and Tests"];
  function section(title,body) { lines.push(title,"",body,""); }
  section("## Student details",block(book.project["Student details"]));
  section("## Feature list",table(["ID","Feature","Status","Claimed"],book.items.map(f=>[f.label,f.title,f.status,f.claimed])));
  for (const key of Object.keys(projectSections).slice(1,-1)) section("## "+key,block(book.project[key]));
  lines.push("## Features","");
  for (const f of book.items) {
    lines.push("### "+f.label+": "+cell(f.title),"");
    section("#### Requirements",f.requirements.map(r=>"- "+r.id+": "+cell(r.text)).join("\n"));
    section("#### Tests",table(testHead,f.tests.map(t=>testFields.map(key=>t[key]))));
    section("#### By-hand steps",block(f.manual));
    section("#### Implementation notes",block(f.notes));
    section("#### Changes since first submission",block(f.changes));
  }
  section("## Known limitations",block(book.project["Known limitations"]));
  if(book.extra) section("## Additional imported text",block(book.extra));
  return lines.join("\n");
}
function splitSections(text,level) {
  const pattern=new RegExp("^"+"#".repeat(level)+" +([^\\n]+)$","gm");
  const matches=[...text.matchAll(pattern)];
  return {intro:text.slice(0,matches[0]?.index??text.length).trim(),
    entries:matches.map((m,i)=>[m[1].trim(),text.slice(m.index+m[0].length,matches[i+1]?.index??text.length).replace(/^\n\n?/,"").replace(/\n\n?$/,"")])};
}
function cells(line) {
  return line.startsWith("|") && line.endsWith("|") ? line.slice(1,-1).split("|").map(s=>uncell(s.trim())) : [];
}
function parseBook(source) {
  const book=emptyBook(), leftovers=[], seen=new Set();
  const doc=splitSections(source.replace(/^\uFEFF/,"").replace(/\r\n?/g,"\n"),2);
  if(!doc.entries.some(([h])=>h==="Features" || h==="Feature list")) throw Error("Choose a Transport Monitor Markdown file with a Features or Feature list heading.");
  const records=new Map();
  function keep(where,txt) { if(txt.trim()) leftovers.push(where+"\n"+txt.trim()); }
  function get(label,title) {
    const id=label.split(" ")[0];
    if(!records.has(id)) records.set(id,featureRecord(id,label,title));
    return records.get(id);
  }
  keep("Document introduction",doc.intro.replace(/^# Transport Monitor: Requirements and Tests\s*/,""));
  const idPattern=/^(?:[A-Z]+\d+)(?: \+ [A-Z]+\d+)*$/;
  for (const [heading,body] of doc.entries) {
    if(seen.has(heading)) {keep("Repeated section: "+heading,body);continue;}
    seen.add(heading);
    if(Object.hasOwn(projectSections,heading)) {book.project[heading]=unblock(body);continue;}
    if(heading==="Additional imported text") {book.extra=unblock(body);continue;}
    if(heading==="Feature list") {
      for(const line of body.split("\n")) {
        const v=cells(line);
        if(v.length===4 && idPattern.test(v[0])) {
          const f=get(v[0],v[1]); f.status=v[2];f.claimed=v[3];
        } else if(!/^\|\s*(?:ID\s*\||-)/.test(line)) keep(heading,line);
      }
      continue;
    }
    if(heading!=="Features") {keep("## "+heading,body);continue;}
    const group=splitSections(body,3);
    keep(heading,group.intro);
    for(const [name,content] of group.entries) {
      const matched=name.match(/^([^:]+):\s*(.*)$/);
      if(!matched || !idPattern.test(matched[1])) {keep("### "+name,content);continue;}
      const f=get(matched[1],uncell(matched[2]));
      const parts=splitSections(content,4);
      keep(name,parts.intro);
      for(const [part,txt] of parts.entries) {
        const fields={"By-hand steps":"manual","Implementation notes":"notes","Changes since first submission":"changes"};
        if(Object.hasOwn(fields,part)) {f[fields[part]] += (f[fields[part]]?"\n":"")+unblock(txt);continue;}
        if(part!=="Requirements" && part!=="Tests") {keep(name+" / "+part,txt);continue;}
        for(const line of txt.split("\n")) {
          if(part==="Requirements") {
            const r=line.match(/^- ([A-Z]+\d+-R\d+):\s?(.*)$/);
            if(r) {f.requirements.push({id:r[1],text:uncell(r[2])});continue;}
          } else {
            const v=cells(line);
            if([6,9].includes(v.length) && /^[A-Z]+\d+-T\d+$/.test(v[0])) {
              const t=newTest(v[0]);v.forEach((value,i)=>t[testFields[i]]=value);
              t.covers=t.covers.replace(/\bR(\d+)\b/g,(m,n,offset,str)=>offset>0 && str[offset-1]==="-" ? m : f.id+"-R"+n);
              t.status ||= "Not yet run";f.tests.push(t);continue;
            }
            if(/^\|\s*(Test\s*\||-)/.test(line)) continue;
          }
          keep(name+" / "+part,line);
        }
      }
    }
  }
  book.items=[...records.values()];
  if(!book.items.length) throw Error("No feature IDs were found. Keep your original file and check its feature headings.");
  book.extra=[book.extra,...leftovers].filter(Boolean).join("\n\n");
  return book;
}
