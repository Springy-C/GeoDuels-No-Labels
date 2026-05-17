chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    hideRoadLabels: true
  });
});
