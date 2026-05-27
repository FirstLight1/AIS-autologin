chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        chrome.storage.local.set({ checked: true }); // default ON
        chrome.tabs.create({ url: chrome.runtime.getURL("popup.html") });
    }
});