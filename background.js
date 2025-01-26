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
    // Call the proxy server instead of the DeepSeek API directly
    fetch("http://localhost:3000/proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task: message.task, // The custom task input by the user
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Proxy Server Response:", data); // Log the response from the proxy server

        // Ensure the response contains the tasks array
        if (!data.tasks || !Array.isArray(data.tasks)) {
          throw new Error("Invalid response format: tasks array not found");
        }

        // Limit the number of tasks to 5
        const subtasks = data.tasks.slice(0, 5);

        // Send the subtasks back to newTab.js
        chrome.runtime.sendMessage({ action: "updateSubtasks", subtasks });
      })
      .catch((error) => {
        console.error("Error generating subtasks:", error);

        // Fallback to default tasks if the API fails
        const subtasks = [
          "Default Task 1",
          "Default Task 2",
          "Default Task 3",
          "Default Task 4",
          "Default Task 5",
        ];
        chrome.runtime.sendMessage({ action: "updateSubtasks", subtasks });
      });

    return true; // Keep the message channel open for async response
  }
});