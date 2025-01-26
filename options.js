// options.js
function saveOptions() {
  const apiKey = document.getElementById('apiKey').value.trim();
  
  // Validate API key format
  if (!apiKey.startsWith('sk-ant-api')) {
    const status = document.getElementById('status');
    status.textContent = 'Invalid API key format. Key should start with "sk-ant-api"';
    status.style.display = 'block';
    status.className = 'error';
    return;
  }

  chrome.storage.local.set(
    { claudeApiKey: apiKey },
    function() {
      // Log successful save
      console.log('API key saved successfully');
      
      // Update status to let user know options were saved
      const status = document.getElementById('status');
      status.textContent = 'API key saved successfully!';
      status.style.display = 'block';
      status.className = 'success';
      
      // Verify the save
      chrome.storage.local.get(['claudeApiKey'], function(result) {
        console.log('Verification - API key saved:', result.claudeApiKey ? 'Present' : 'Not found');
      });

      setTimeout(function() {
        status.style.display = 'none';
      }, 2000);
    }
  );
}

// Adds immediate validation when pasting or typing
document.getElementById('apiKey').addEventListener('input', function(e) {
  const apiKey = e.target.value.trim();
  const saveButton = document.getElementById('save');
  
  if (apiKey.startsWith('sk-ant-api')) {
    saveButton.disabled = false;
    e.target.style.borderColor = '#4158D0';
  } else {
    saveButton.disabled = true;
    e.target.style.borderColor = '#ff4444';
  }
});

function restoreOptions() {
  chrome.storage.local.get(
    { claudeApiKey: '' },
    function(items) {
      document.getElementById('apiKey').value = items.claudeApiKey;
      console.log('Restored API key:', items.claudeApiKey ? 'Present' : 'Not found');
    }
  );
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);