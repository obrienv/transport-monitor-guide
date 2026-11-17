const steps = [...document.querySelectorAll(".step input")];
const saved = loadList("steps");
function updateProgress() {
  const count = steps.filter(step => step.checked).length;
  const next = steps.find(step => !step.checked)?.closest("article");
  const line = document.querySelector("#next-step");
  line.replaceChildren();
  // The first unticked step is marked as the current one, and its first link is the one to follow.
  for (const step of steps) step.closest("article").classList.toggle("current", step.closest("article") === next);
  if (next) {
    const link = document.createElement("a");
    link.href = next.querySelector("a").href;
    link.textContent = next.querySelector("h3").textContent;
    line.append("Continue with step ", link);
  } else { line.textContent = "All six steps complete. Check your final submission on Blackboard."; }
  document.querySelector("#progress-count").textContent = count + " of 6 steps complete";
  document.querySelector("progress").value = count;
}
for (const step of steps) {
  step.checked = saved.includes(step.id);
  step.addEventListener("change", () => {
    if (!saveList("steps", steps.filter(s => s.checked).map(s => s.id))) {
      document.querySelector("#save-note").textContent = "Progress lasts for this visit. Browser storage is unavailable.";
    }
    updateProgress();
  });
}
updateProgress();
