for (const target of document.querySelectorAll("[data-catalog]")) {
  const group = target.dataset.catalog;
  const members = features.filter(f => f.group === group);
  if (group === "Challenges") {
    for (const f of members) {
      const article = document.createElement("article");
      article.id = f.id;
      article.innerHTML = "<h3>" + f.label + ": " + f.title + "</h3><p><b>Needs:</b> " +
        (f.needs || "Core") + ". <b>How it is marked:</b> " + f.assessment + ".</p>" + f.body;
      target.append(article);
    }
    continue;
  }
  const table = document.createElement("table");
  const row = table.createTHead().insertRow();
  const headers = group === "Core" ? ["ID","Feature"] : ["ID","Feature","Needs","How it is marked"];
  for (const title of headers) {
    const th = document.createElement("th");
    th.scope = "col"; th.textContent = title; row.append(th);
  }
  const body = table.createTBody();
  for (const f of members) {
    const tr = body.insertRow();
    tr.id = f.id;
    const fields = [f.label, f.title];
    if (group !== "Core") fields.push(f.settingsSources ? "Two other features with settings" : (f.needs || "Core"), f.assessment);
    for (const value of fields) tr.insertCell().textContent = value;
  }
  target.append(table);
}
