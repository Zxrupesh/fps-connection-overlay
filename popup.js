const toggleCheckbox = document.getElementById('toggleOverlay');

chrome.storage.sync.get(['showOverlay'], (res) => {
  toggleCheckbox.checked = res.showOverlay ?? true;
});

toggleCheckbox.addEventListener('change', () => {
  const show = toggleCheckbox.checked;
  chrome.storage.sync.set({ showOverlay: show });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: (show) => {
        const overlay = document.getElementById("fps-connection-overlay");
        if (overlay) overlay.style.display = show ? "block" : "none";
      },
      args: [show]
    });
  });
});
