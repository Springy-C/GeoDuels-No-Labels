// Runs on geoduels.io
// Watches for the Street View iframe being added to the DOM and keeps it
// updated whenever settings change.

function applySettingsToFrame(iframe, settings) {
  try {
    iframe.contentWindow.postMessage(
      { type: "GEODUELS_ENHANCER_SETTINGS", settings },
      "*"
    );
  } catch {
    // Frame not ready yet — streetview.js will request on its own load
  }
}

function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      ["hideRoadLabels", "hideBusinessLabels", "hidePOILabels", "hideTransitLabels"],
      resolve
    );
  });
}

// Keep track of known Street View iframes so we can message them
const knownFrames = new WeakSet();

async function onNewFrame(iframe) {
  if (knownFrames.has(iframe)) return;
  knownFrames.add(iframe);
  const settings = await getSettings();
  // Wait for frame to load before messaging
  if (iframe.contentDocument?.readyState === "complete") {
    applySettingsToFrame(iframe, settings);
  } else {
    iframe.addEventListener("load", () => applySettingsToFrame(iframe, settings), {
      once: true,
    });
  }
}

function findStreetViewFrames() {
  return Array.from(document.querySelectorAll('iframe[src*="google.com/maps/embed"]'));
}

// Observe DOM for iframe additions (GeoDuels mounts/unmounts iframes per round)
const observer = new MutationObserver(() => {
  findStreetViewFrames().forEach(onNewFrame);
});

observer.observe(document.body, { childList: true, subtree: true });

// Also catch any that are already on the page
findStreetViewFrames().forEach(onNewFrame);

// When settings change from the popup, push to all current frames
chrome.storage.onChanged.addListener(async () => {
  const settings = await getSettings();
  findStreetViewFrames().forEach((iframe) => applySettingsToFrame(iframe, settings));
});

// streetview.js may request settings via postMessage if it loads before host.js pushed
window.addEventListener("message", async (event) => {
  if (event.data?.type !== "GEODUELS_ENHANCER_REQUEST_SETTINGS") return;
  const settings = await getSettings();
  // Find the iframe that sent the message and reply to it
  findStreetViewFrames().forEach((iframe) => {
    if (iframe.contentWindow === event.source) {
      applySettingsToFrame(iframe, settings);
    }
  });
});
