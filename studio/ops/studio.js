(() => {
  const clock = document.querySelector("#clock");
  const fileInput = document.querySelector("#evidence-file");
  const result = document.querySelector("#evidence-result");
  const updateClock = () => {
    if (clock) clock.textContent = new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC";
  };
  updateClock();
  window.setInterval(updateClock, 1000);
  if (!fileInput || !result) return;
  fileInput.addEventListener("change", async () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) { result.textContent = "No file selected."; return; }
    if (file.size > 2 * 1024 * 1024) {
      result.textContent = "Rejected: evidence JSON exceeds the 2 MiB local inspection limit.";
      fileInput.value = "";
      return;
    }
    try {
      const parsed = JSON.parse(await file.text());
      const summary = {
        file: file.name,
        bytes: file.size,
        topLevelKeys: Object.keys(parsed).slice(0, 30),
        runId: parsed.run_id ?? parsed.runId ?? parsed.run?.id ?? null,
        commit: parsed.commit ?? parsed.head_sha ?? null,
        runnerId: parsed.runner_id ?? parsed.runnerId ?? null,
        runnerName: parsed.runner_name ?? parsed.runnerName ?? null,
        note: "Local file inspection only. This UI does not certify or change release gates."
      };
      result.textContent = JSON.stringify(summary, null, 2);
    } catch {
      result.textContent = "Invalid JSON. No data was uploaded.";
    }
  });
})();
