// setApiKey.js
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ apiKey: "YOUR_API_KEY_HERE" }, () => {
      console.log("API key stored securely!");
    });
  });
  