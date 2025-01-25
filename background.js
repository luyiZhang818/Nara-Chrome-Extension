// Set up the daily reset alarm at 12:00 a.m.
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed.");

  // Store API key if not already present
  chrome.storage.local.get("apiKey", (data) => {
    if (data.apiKey) {
      console.log("API key already exists:", data.apiKey);
    } else {
      chrome.storage.local.set(
        {
          apiKey: "TBU", // updated when demoing
        },
        () => {
          console.log("API key stored securely!");
        }
      );
    }
  });

  // Set the midnight alarm
  setMidnightAlarm();
});

// Verify API key and reset alarm on startup
chrome.runtime.onStartup.addListener(() => {
  console.log("Chrome started.");

  // Verify the API key exists
  chrome.storage.local.get("apiKey", (data) => {
    if (data.apiKey) {
      console.log("API key is ready for use.");
    } else {
      console.error("No API key found. Please add it.");
    }
  });

  // Reset the midnight alarm
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
  console.log("Message received in background.js:", message);

  if (message.action === "generateSubtasks") {
    chrome.storage.local.get("apiKey", (data) => {
      const apiKey = data.apiKey;

      if (!apiKey) {
        console.error("API key is missing!");
        sendResponse({ error: "No API key found. Please set it." });
        return;
      }

      if (!message.task) {
        console.error("Task is missing in the message payload.");
        sendResponse({ error: "Task is missing." });
        return;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10-second timeout
      console.log("Sending task to GPT-4:", message.task);

      fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are a helpful productivity assistant.",
            },
            {
              role: "user",
              content: `Break down the task "${message.task}" into 5 subtasks.`,
            },
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
          if (error.name === "AbortError") {
            sendResponse({ error: "Request timed out. Please try again." });
          } else {
            sendResponse({
              error:
                "Failed to generate subtasks. Please check your API key and try again.",
            });
          }
        });
    });

    return true; // Keep the message channel open for async response
  }
});
