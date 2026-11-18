// Builds the feature tables and challenge descriptions in the brief from features.js.
for (const target of document.querySelectorAll("[data-catalog]")) {
  const group = target.dataset.catalog;
  const members = features.filter(f => f.group === group);
  if (group === "Challenges") {
    for (const f of members) {
      const article = document.createElement("article");
      article.id = f.id;
      article.className = "challenge";
      const heading = document.createElement("h3");
      heading.textContent = f.label + ": " + f.title;
      const facts = document.createElement("dl");
      facts.className = "facts";
      for (const [term, value] of [["Needs", f.needs || "Core"], ["Baseline", f.baseline],
        ["Replay checks", f.replay], ["Physical tests check", f.physical], ["Proposed minimum (provisional)", f.target]]) {
        if (!value) continue;
        const dt = document.createElement("dt"), dd = document.createElement("dd");
        dt.textContent = term; dd.textContent = value; facts.append(dt, dd);
      }
      const body = document.createElement("div");
      body.innerHTML = f.body;
      article.append(heading, facts, body);
      target.append(article);
    }
    continue;
  }
  const table = document.createElement("table");
  table.className = group === "Core" ? "catalog core" : "catalog";
  const row = table.createTHead().insertRow();
  const headers = group === "Core" ? ["ID","Feature"] : ["ID","Feature","Needs","Note"];
  for (const title of headers) {
    const th = document.createElement("th");
    th.scope = "col"; th.textContent = title; row.append(th);
  }
  const body = table.createTBody();
  for (const f of members) {
    const tr = body.insertRow();
    tr.id = f.id;
    const fields = [f.label, f.title];
    if (group !== "Core") fields.push(f.settingsSources ? "Two other features with settings" : (f.needs || "Core"), f.note || "");
    for (const value of fields) tr.insertCell().textContent = value;
  }
  target.append(table);
}
