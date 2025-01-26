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

async function generateSubtasksWithClaude(task, apiKey) {
  try {
    // Log the API key format (only first few characters for security)
    console.log("API Key format check:", apiKey.substring(0, 9) === "sk-ant-api");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2024-01-01",
        "authorization": `Bearer ${apiKey}`  // Changed from x-api-key to authorization
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: `Break down this task into 5 specific, actionable subtasks: "${task}". 
                   Return only a JSON array of 5 subtasks, with no additional text.
                   Example format: ["subtask1", "subtask2", "subtask3", "subtask4", "subtask5"]`
        }],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("API Response Error:", {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("API Response:", data);  // Log the response structure

    if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
      throw new Error('Invalid response format from Claude API');
    }

    const content = data.content[0].text;
    const subtasks = JSON.parse(content);

    return subtasks;

  } catch (error) {
    console.error("Detailed error in generateSubtasksWithClaude:", error);
    return null;
  }
}

// Handle messages from newTab.js for generating subtasks
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "generateSubtasks") {
    // Get API key from storage
    chrome.storage.local.get(['claudeApiKey'], async function(result) {
      const apiKey = result.claudeApiKey;
      
      if (!apiKey) {
        console.error('Claude API key not found');
        sendFallbackTasks();
        return;
      }

      try {
        const subtasks = await generateSubtasksWithClaude(message.task, apiKey);
        
        if (subtasks && Array.isArray(subtasks) && subtasks.length === 5) {
          chrome.runtime.sendMessage({ 
            action: "updateSubtasks", 
            subtasks 
          });
        } else {
          throw new Error('Invalid subtasks generated');
        }
      } catch (error) {
        console.error('Error in subtask generation:', error);
        sendFallbackTasks();
      }
    });

    return true; // Keep the message channel open for async response
  }
});

// Helper function to send fallback tasks
function sendFallbackTasks() {
  const subtasks = [
    "Default Task 1",
    "Default Task 2",
    "Default Task 3",
    "Default Task 4",
    "Default Task 5"
  ];
  chrome.runtime.sendMessage({ 
    action: "updateSubtasks", 
    subtasks 
  });
}