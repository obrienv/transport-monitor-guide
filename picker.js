const byID = new Map(features.map(f => [f.id, f]));
const isCore = f => f.group === "Core";
const isChallenge = f => f.group === "Challenges";
const selected = new Set();
for (const id of loadList("plan")) {
  const f = byID.get(id);
  if (f && !isCore(f) && (!isChallenge(f) || [...selected].filter(k => isChallenge(byID.get(k))).length < 2)) selected.add(id);
}
const sources = new Set(loadList("menu-settings"));
const options = document.querySelector("#options");
const controls = new Map();
const openWorkbook = document.querySelector("#open-workbook");
let capNote;
function plan() {
  const ids = new Set(features.filter(isCore).map(f => f.id));
  function add(id) {
    if (ids.has(id)) return;
    ids.add(id);
    const need = byID.get(id).needs;
    if (need) add(need);
  }
  selected.forEach(add);
  return features.filter(f => ids.has(f.id));
}
function buildOptions() {
  for (const group of new Set(features.map(f => f.group))) {
    const members = features.filter(f => f.group === group);
    const el = document.createElement(group === "Core" ? "details" : "section");
    const heading = document.createElement(group === "Core" ? "summary" : "h2");
    heading.textContent = group === "Core" ? "View the 13 compulsory core features" : group;
    el.append(heading);
    if (group === "Challenges") {
      const intro = document.createElement("p");
      intro.textContent = "Plan at most two challenges. Each is worth about 12.5% of the final marks, and a third earns nothing.";
      capNote = document.createElement("p");
      capNote.className = "cap-note"; capNote.setAttribute("role", "status"); capNote.hidden = true;
      capNote.textContent = "You have chosen two challenges, so the others are greyed out. Untick one to choose a different challenge.";
      el.append(intro, capNote);
    }
    for (const f of members) {
      if (isCore(f)) {
        const line = document.createElement("p");
        line.textContent = f.id + " · " + f.title; el.append(line); continue;
      }
      const row = document.createElement("label");
      row.className = "option";
      const input = document.createElement("input");
      input.type = "checkbox"; input.id = "pick-" + f.id;
      const text = document.createElement("span");
      const title = document.createElement("strong");
      title.textContent = f.label + " · ";
      const detail = document.createElement("small");
      text.append(title, f.title, detail);
      row.append(input,text); el.append(row);
      if (isChallenge(f)) {
        const link = document.createElement("a");
        link.href = "brief.html#" + f.id; link.className = "option-link";
        link.textContent = "Read the " + f.id + " description, baseline and example target"; el.append(link);
      }
      controls.set(f.id, {input,detail});
      input.addEventListener("change", () => {
        if (input.checked) selected.add(f.id); else selected.delete(f.id);
        refresh();
      });
    }
    options.append(el);
  }
}
function menuSettings(items) {
  const box = document.querySelector("#settings-choice");
  const hasMenu = items.some(f => f.id === "P02");
  const candidates = items.filter(f => !isCore(f) && f.id !== "P02");
  for (const id of sources) if (!hasMenu || !candidates.some(f => f.id === id)) sources.delete(id);
  box.replaceChildren();
  if (!hasMenu) return true;
  const field = document.createElement("fieldset");
  const legend = document.createElement("legend");
  legend.textContent = "P02 menu settings"; field.append(legend);
  const note = document.createElement("p");
  note.textContent = candidates.length < 2
    ? "P02 edits settings that belong to two of your other features. Tick at least two more features in the list first."
    : "Tick at least two features below whose settings your menu will edit. To use a feature that is not shown, tick it in the list first.";
  field.append(note);
  for (const f of candidates) {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox"; input.checked = sources.has(f.id); input.id = "source-" + f.id;
    input.addEventListener("change", () => {
      if (input.checked) sources.add(f.id); else sources.delete(f.id);
      refresh(); document.getElementById(input.id)?.focus();
    });
    label.append(input, " " + f.label + " · " + f.title); field.append(label);
  }
  box.append(field);
  return sources.size >= byID.get("P02").settingsSources;
}
function marksTable(standard, challenges, hasX6) {
  const box = document.querySelector("#band");
  box.replaceChildren();
  const table = document.createElement("table");
  table.className = "marks";
  const caption = document.createElement("caption");
  caption.textContent = "Share of the final 30 marks";
  caption.style.textAlign = "left"; caption.style.fontWeight = "650"; table.append(caption);
  const rows = [
    ["Core, all 13 features", "40%", false],
    ["Standard features, " + standard + " chosen, sharing 35%", standard ? "TBA" : "0%", !standard],
    ["Challenges, " + challenges + " of 2", challenges ? "about " + challenges * 12.5 + "%" : "0%", !challenges]
  ];
  for (const [name, share, off] of rows) {
    const tr = table.insertRow(); if (off) tr.className = "off";
    tr.insertCell().textContent = name;
    const cell = tr.insertCell();
    if (share === "TBA") {
      const tag = document.createElement("span");
      tag.className = "tba"; tag.textContent = "To be announced"; cell.append(tag);
    } else cell.textContent = share;
  }
  box.append(table);
  const notes = [];
  if (standard) notes.push("Each standard feature has its own weight, which will be published later. The 35% is shared among the standard features you build.");
  if (hasX6) notes.push("The X6 share depends on the handling traces available.");
  notes.push("You earn these shares only for features that pass their tests.");
  notes.push("The first submission is marked on how complete and exact your requirements and tests are, not on how many features you plan.");
  const note = document.createElement("p");
  note.className = "note"; note.textContent = notes.join(" "); box.append(note);
}
function refresh() {
  const items = plan();
  const challenges = items.filter(isChallenge).length;
  const standard = items.filter(f => !isCore(f) && !isChallenge(f)).length;
  const added = [];
  for (const [id,{input,detail}] of controls) {
    const f = byID.get(id);
    const included = items.includes(f);
    const parents = items.filter(other => other.needs === id);
    const auto = included && !selected.has(id);
    input.checked = included;
    input.disabled = auto || (!included && isChallenge(f) && challenges === 2);
    const parts = [];
    if (f.needs) parts.push("Needs " + byID.get(f.needs).label + ".");
    if (f.settingsSources) parts.push("Needs two other features with settings.");
    if (auto) {
      const by = parents.map(p => p.id).join(", ");
      parts.push("Added for you because " + by + (parents.length > 1 ? " need it. To remove it, untick " : " needs it. To remove it, untick ") + by + ".");
      added.push(f.label + " (for " + by + ")");
    }
    detail.textContent = parts.join(" ");
  }
  capNote.hidden = challenges < 2;
  document.querySelector("#counts").textContent = "13 core · " + standard + " standard · " + challenges + " of 2 challenges";
  document.querySelector("#plan-bar-counts").textContent = standard + " standard · " + challenges + " of 2 challenges";
  document.querySelector("#dependencies").textContent = added.length ? "Added as prerequisites: " + added.join(", ") + "." : "";
  marksTable(standard, challenges, items.some(f => f.id === "X6"));
  openWorkbook.disabled = !menuSettings(items);
  const savedPlan = saveList("plan",selected);
  const savedSources = saveList("menu-settings",sources);
  document.querySelector("#download-note").textContent = openWorkbook.disabled ? "Choose the features supplying your P02 settings before you open the workbook." : (!savedPlan || !savedSources ? "Selections last for this visit only, because browser storage is unavailable." : "");
}
openWorkbook.addEventListener("click", () => {
  const params = new URLSearchParams({features:plan().map(f=>f.id).join(","), settings:[...sources].join(",")});
  location.href = "workbook.html?" + params;
});
buildOptions();
refresh();
