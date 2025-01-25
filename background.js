// Set up the daily reset alarm at 12:00 a.m.
chrome.runtime.onInstalled.addListener(() => {
  setMidnightAlarm();
});

chrome.runtime.onStartup.addListener(() => {
  setMidnightAlarm();
});

// Handle alarms for resetting state
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "dailyReset") {
    chrome.storage.local.set({ state: null }, () => {
      console.log("State reset at 12:00 a.m.");
    });
    setMidnightAlarm(); // Reset the alarm for the next day
  }
});

// Function to set an alarm for 12:00 a.m.
function setMidnightAlarm() {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);

  const timeUntilMidnight = (midnight - now) / (1000 * 60);
  chrome.alarms.create("dailyReset", { delayInMinutes: timeUntilMidnight });
}

// Handle messages from newTab.js for generating subtasks
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "generateSubtasks") {
    chrome.storage.local.get("apiKey", (data) => {
      const apiKey = data.apiKey;

      if (!apiKey) {
        console.error("API key is missing!");
        sendResponse({ error: "No API key found." });
        return;
      }

      if (!message.task) {
        console.error("Task is missing in the message payload.");
        sendResponse({ error: "Task is missing." });
        return;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10-second timeout

      fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4", // Changed to GPT-4
          messages: [
            { role: "system", content: "You are a helpful productivity assistant." },
            { role: "user", content: `Break down the task "${message.task}" into 5 subtasks.` },
          ],
          max_tokens: 100,
        }),
        signal: controller.signal,
      })
        .then((response) => response.json())
        .then((data) => {
          clearTimeout(timeout);
          const subtasks = data.choices[0].message.content
            .trim()
            .split("\n")
            .filter(Boolean);

          if (subtasks.length === 0) {
            sendResponse({ error: "No subtasks generated. Please try again." });
            return;
          }

          sendResponse({ subtasks });
        })
        .catch((error) => {
          console.error("Error generating subtasks:", error);
          sendResponse({ error: "Failed to generate subtasks. Please try again." });
        });
    });

    return true; // Keep the message channel open for async response
  }
});

// Verify the security key when Chrome is opened
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get("apiKey", (data) => {
    if (data.apiKey) {
      console.log("API key is ready for use."); // Log key existence, not value
    } else {
      console.error("No API key found. Please add it.");
    }
  });
});
