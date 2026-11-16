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
const download = document.querySelector("#download");
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
        link.href = "brief.html#" + f.id;
        link.textContent = "Read " + f.id + " targets and baseline"; el.append(link);
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
  note.textContent = "Select at least two other features in your plan whose settings you will edit in the menu. Add them to your plan first.";
  field.append(note);
  for (const f of candidates) {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox"; input.checked = sources.has(f.id); input.id = "source-" + f.id;
    input.addEventListener("change", () => {
      if (input.checked) sources.add(f.id); else sources.delete(f.id);
      refresh(); document.getElementById(input.id)?.focus();
    });
    label.append(input, " " + f.label); field.append(label);
  }
  box.append(field);
  return sources.size >= byID.get("P02").settingsSources;
}
function refresh() {
  const items = plan();
  const challenges = items.filter(isChallenge).length;
  const standard = items.filter(f => !isCore(f) && !isChallenge(f)).length;
  const edges = [];
  for (const [id,{input,detail}] of controls) {
    const f = byID.get(id);
    const included = items.includes(f);
    const parents = items.filter(other => other.needs === id);
    const auto = included && !selected.has(id);
    input.checked = included;
    input.disabled = auto || (!included && isChallenge(f) && challenges === 2);
    const need = f.needs ? byID.get(f.needs).label : f.settingsSources ? "two other features with settings" : "core";
    detail.textContent = "Needs " + need + ". " + (auto ? "Included for " + parents.map(p => p.id).join(", ") + "." : "");
    if (included && f.needs) edges.push(f.id + " needs " + need);
  }
  document.querySelector("#counts").textContent = "13 core · " + standard + " standard · " + challenges + " of 2 challenges";
  document.querySelector("#dependencies").textContent = edges.join(". ") + (edges.length ? "." : "");
  let band = "Passing all core tests earns 40% of the final 30 marks.";
  if (standard) band += " Standard features contribute up to 35% more. Individual weights are pending.";
  if (challenges) {
    const ceiling = 40 + (standard ? 35 : 0) + challenges * 12.5;
    band += challenges === 1 ? " One challenge can add about 12.5%." : " Two challenges can add up to 25%.";
    band += " The ceiling for this band is " + ceiling + "%.";
    if (standard) band += " Your exact ceiling depends on the weights of your selected standard features.";
  }
  if (items.some(f => f.id === "X6")) band += " The X6 share depends on the handling traces available.";
  if (!challenges && standard) band += " The core and standard band reaches 75%.";
  document.querySelector("#band").textContent = band;
  download.disabled = !menuSettings(items);
  document.querySelector("#open-workbook").disabled = download.disabled;
  const savedPlan = saveList("plan",selected);
  const savedSources = saveList("menu-settings",sources);
  document.querySelector("#download-note").textContent = download.disabled ? "Choose the features supplying your P02 settings." : (!savedPlan || !savedSources ? "Selections last for this visit." : "");
}
function outline(items) {
  const lines = ["# Transport Monitor: Requirements and Tests", "", "## Student details", "", "- Name:", "- Student number:", "- Build ID (match your firmware):", "- Submission: First", "- Date:", "",
    "## Feature list", "", "| ID | Feature | Status | Claimed |", "|---|---|---|---|"];
  for (const f of items) lines.push("| " + f.label + " | " + f.title + " | Planned | |");
  lines.push("", "## Build and setup", "", "- Toolchain and version:", "- Libraries and versions:", "- Board settings:", "- How to build:", "- How to flash the binary:", "- Accelerometer range:", "- IMU sample rate:", "- AHT20 read interval:", "",
    "## Button map", "", "| Action | Button press |", "|---|---|", "| | |", "", "## Extra state fields and event kinds", "", "<Describe each added field, its type and unit, and your event kinds.>", "",
    "## Features", "", "Use the worked EX1 example in the guide under Resources and changes. Keep the headings. Leave test results blank until you run the tests.", "");
  for (const f of items) {
    lines.push("### " + f.label + ": " + f.title, "", "#### Requirements", "", "- " + f.id + "-R1: <State the exact behaviour, values and units. Add numbered requirements for boundaries, invalid data and how the user reaches this feature.>");
    if (f.id === "P02") lines.push("", "Describe the menu settings for " + [...sources].join(", ") + ".");
    if (isChallenge(f)) lines.push("", "<Justify your method. Identify the baseline, set a numerical target and explain how you will measure both methods.>");
    lines.push("", "#### Tests", "", "| Test | Covers | How | Setup | Expected result | Result |", "|---|---|---|---|---|---|", "| " + f.id + "-T1 | " + f.id + "-R1 | | | | |", "", "<Supply a runnable file for each serial-testable feature. Identify the requirement each test covers and the input and observable result.>", "",
      "#### By-hand steps", "", "<Give the starting state, numbered actions and expected observations for each manual test.>", "", "#### Changes since first submission", "", "<For your final submission, record what changed and why.>", "");
  }
  lines.push("## Known limitations", "", "<Record anything that failed or that you could not test.>", "");
  return lines.join("\n");
}
download.addEventListener("click", () => {
  const url = URL.createObjectURL(new Blob([outline(plan())], {type:"text/markdown;charset=utf-8"}));
  const link = document.createElement("a");
  link.href = url; link.download = "REQUIREMENTS_AND_TESTS.md"; document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
  document.querySelector("#download-note").textContent = "Plan downloaded. Fill in the requirements and tests for each feature.";
});
document.querySelector("#open-workbook").addEventListener("click", () => {
  const params = new URLSearchParams({features:plan().map(f=>f.id).join(","), settings:[...sources].join(",")});
  location.href = "workbook.html?" + params;
});
buildOptions();
refresh();
