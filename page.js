// Shared helpers for the long reference pages: contents highlight, copy buttons, back to top.
(() => {
  const toc = document.querySelector("main.doc > nav");
  if (toc) {
    const label = document.createElement("p");
    label.className = "toc-title"; label.textContent = "On this page";
    toc.prepend(label);
    const links = new Map([...toc.querySelectorAll("a[href^='#']")].map(a => [a.hash.slice(1), a]));
    const sections = [...links.keys()].map(id => document.getElementById(id)).filter(Boolean);
    const mark = () => {
      let current = sections[0];
      for (const s of sections) if (s.getBoundingClientRect().top < 140) current = s;
      for (const [id, a] of links) {
        if (current && id === current.id) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      }
    };
    addEventListener("scroll", mark, {passive: true}); mark();
  }
  for (const pre of document.querySelectorAll("main pre")) {
    const sent = pre.textContent.trim();
    const bar = document.createElement("div");
    bar.className = "pre-tools";
    const copy = document.createElement("button");
    copy.type = "button"; copy.textContent = "Copy";
    copy.onclick = async () => {
      try { await navigator.clipboard.writeText(sent); copy.textContent = "Copied"; }
      catch { copy.textContent = "Select the text to copy"; }
      setTimeout(() => copy.textContent = "Copy", 1800);
    };
    bar.append(copy);
    let formatted = "";
    try { formatted = sent.split("\n").filter(Boolean).map(line => JSON.stringify(JSON.parse(line), null, 2)).join("\n\n"); } catch {}
    if (formatted && sent.length > 160) {
      const toggle = document.createElement("button");
      toggle.type = "button"; toggle.textContent = "Show formatted";
      toggle.setAttribute("aria-pressed", "false");
      toggle.onclick = () => {
        const on = toggle.getAttribute("aria-pressed") !== "true";
        toggle.setAttribute("aria-pressed", String(on));
        toggle.textContent = on ? "Show as sent (one line)" : "Show formatted";
        pre.textContent = on ? formatted : sent;
        pre.classList.toggle("formatted", on);
      };
      bar.append(toggle);
    }
    pre.before(bar);
  }
  if (document.querySelector("main.doc")) {
    const top = document.createElement("a");
    top.href = "#main"; top.className = "to-top"; top.textContent = "Back to top";
    document.body.append(top);
    const show = () => top.classList.toggle("show", scrollY > 900);
    addEventListener("scroll", show, {passive: true}); show();
  }
})();
