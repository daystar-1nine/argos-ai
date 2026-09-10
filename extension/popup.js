/**
 * ARGOS.AI Chrome Extension — Popup Control Script
 */

document.addEventListener("DOMContentLoaded", () => {
  const statusBadge = document.getElementById("status-badge");
  const statusText = document.getElementById("status-text");
  const backendUrlInput = document.getElementById("backend-url");
  const saveUrlBtn = document.getElementById("save-url-btn");
  const scanTabBtn = document.getElementById("scan-tab-btn");

  // Fetch current backend URL configuration
  chrome.runtime.sendMessage({ type: "GET_BACKEND_URL" }, (response) => {
    if (response && response.url) {
      backendUrlInput.value = response.url;
    }
  });

  // Check health status of ARGOS AI backend
  function checkHealth() {
    statusBadge.className = "status-badge checking";
    statusText.innerText = "Checking...";

    chrome.runtime.sendMessage({ type: "CHECK_HEALTH" }, (response) => {
      if (response && response.ok) {
        statusBadge.className = "status-badge online";
        statusText.innerText = "Online";
      } else {
        statusBadge.className = "status-badge offline";
        statusText.innerText = "Offline";
      }
    });
  }

  checkHealth();

  // Save updated Backend URL
  saveUrlBtn.addEventListener("click", () => {
    const url = backendUrlInput.value.trim() || "http://localhost:8000";
    chrome.runtime.sendMessage({ type: "SET_BACKEND_URL", url }, () => {
      saveUrlBtn.innerText = "Saved!";
      setTimeout(() => (saveUrlBtn.innerText = "Save"), 1500);
      checkHealth();
    });
  });

  // Trigger scan on active tab
  scanTabBtn.addEventListener("click", async () => {
    scanTabBtn.innerText = "Scanning Active Tab...";
    scanTabBtn.disabled = true;

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        alert("ARGOS.AI: Could not access active tab.");
        return;
      }

      // Try sending message to existing content script in tab
      chrome.tabs.sendMessage(tab.id, { type: "TRIGGER_ACTIVE_SCAN" }, (response) => {
        if (chrome.runtime.lastError || !response) {
          // Content script not loaded yet, inject CSS and JS dynamically
          chrome.scripting.insertCSS({
            target: { tabId: tab.id },
            files: ["content.css"],
          }).catch(() => {});

          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"],
          }, () => {
            setTimeout(() => {
              chrome.tabs.sendMessage(tab.id, { type: "TRIGGER_ACTIVE_SCAN" });
            }, 300);
          });
        }
      });

      setTimeout(() => window.close(), 800);
    } catch (err) {
      alert(`ARGOS.AI Scan Error: ${err.message}`);
      scanTabBtn.innerText = "Trigger Scan on Active Tab";
      scanTabBtn.disabled = false;
    }
  });
});
