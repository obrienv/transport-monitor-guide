// Builds the feature tables and challenge descriptions in the brief from features.js.
for (const target of document.querySelectorAll("[data-catalog]")) {
  const group = target.dataset.catalog;
  const challengeSummary = group === "Challenge summary";
  const members = features.filter(f => f.group === (challengeSummary ? "Challenges" : group));
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
        ["Replay checks", f.replay], ["Physical tests check", f.physical], ["Performance to measure", f.metrics]]) {
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
  const headers = group === "Core" || challengeSummary ? ["ID","Feature"] : ["ID","Feature","Needs"];
  for (const title of headers) {
    const th = document.createElement("th");
    th.scope = "col"; th.textContent = title; row.append(th);
  }
  const body = table.createTBody();
  for (const f of members) {
    const tr = body.insertRow();
    tr.id = f.id;
    if (challengeSummary) {
      tr.insertCell().textContent = f.label;
      const link = document.createElement("a");
      link.href = "advanced.html#" + f.id;
      link.textContent = f.title;
      tr.insertCell().append(link, ". " + f.summary);
      continue;
    }
    tr.insertCell().textContent = f.label;
    const cell = tr.insertCell();
    if (f.description) {
      // The title opens a short description of what the feature adds.
      const more = document.createElement("details");
      const summary = document.createElement("summary");
      const text = document.createElement("p");
      summary.textContent = f.title; text.textContent = f.description;
      more.append(summary, text); cell.append(more);
    } else { cell.textContent = f.title; }
    if (group !== "Core") tr.insertCell().textContent = f.settingsSources ? "Two other features with settings" : (f.needs || "Core");
  }
  target.append(table);
}
