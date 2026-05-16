const keys = ["hideRoadLabels", "hideBusinessLabels", "hidePOILabels", "hideTransitLabels"];

// Load saved settings and sync to checkboxes
chrome.storage.sync.get(keys, (settings) => {
  keys.forEach((key) => {
    const el = document.getElementById(key);
    if (el) el.checked = !!settings[key];
  });
});

// Save on any toggle change
keys.forEach((key) => {
  const el = document.getElementById(key);
  if (!el) return;
  el.addEventListener("change", () => {
    const update = {};
    keys.forEach((k) => {
      const input = document.getElementById(k);
      if (input) update[k] = input.checked;
    });
    chrome.storage.sync.set(update);
  });
});

// Show whether current tab is a GeoDuels page
chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  const pill = document.getElementById("statusPill");
  const text = document.getElementById("statusText");
  const isGeo =
    tab?.url?.includes("geoduels.io") || tab?.url?.includes("localhost:3000");
  if (!isGeo) {
    pill.classList.add("inactive");
    text.textContent = "Open geoduels.io to activate";
  } else {
    text.textContent = "Active on this tab";
  }
});
