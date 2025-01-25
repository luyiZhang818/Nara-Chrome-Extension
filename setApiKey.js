// setApiKey.js
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get("apiKey", (data) => {
    if (data.apiKey) {
      console.log("API key already exists:", data.apiKey);
    } else {
      chrome.storage.local.set({ apiKey: "Ysk-proj-KdmhvmM0q1RlwOinxVKe-EJWF47fjESHPSjp98tdKhGrwFY7_IutF-8kovvhsd4aBFt5MDWpMRT3BlbkFJxfnlaYpreMjxEgWHWYMUxYkCcW2kWKc4Co014Ct0xWaVUQ_k_aojHsH1uL15bjMk_wyG1OSHoA" }, () => {
        console.log("API key stored securely!");
      });
    }
  });
});
