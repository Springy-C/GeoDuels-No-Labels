chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    hideRoadLabels: true,
    hideBusinessLabels: true,
    hidePOILabels: true,
    hideTransitLabels: false,
  });
});
