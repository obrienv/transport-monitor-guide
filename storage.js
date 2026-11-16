function loadList(key) {
  try {
    const value = JSON.parse(localStorage.getItem("setu.tm.2026." + key));
    return Array.isArray(value) ? value.filter(item => typeof item === "string") : [];
  } catch { return []; }
}
function saveList(key, values) {
  try { localStorage.setItem("setu.tm.2026." + key, JSON.stringify([...values])); return true; }
  catch { return false; }
}
