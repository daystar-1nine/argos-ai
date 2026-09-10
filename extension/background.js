/**
 * ARGOS.AI Chrome Extension — Service Worker / Background Script
 * Handles fast, non-blocking API proxying for Manifest V3 compliance.
 */

const DEFAULT_BACKEND_URL = "http://localhost:8000";

// Helper to get backend URL from storage
async function getBackendUrl() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["backendUrl"], (res) => {
      resolve(res.backendUrl || DEFAULT_BACKEND_URL);
    });
  });
}

// Convert data URL / base64 string to Blob
function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'video/webm';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

// Check Backend Health Status
async function checkBackendHealth() {
  const backendUrl = await getBackendUrl();
  try {
    const response = await fetch(`${backendUrl}/api/health`);
    if (response.ok) {
      const data = await response.json();
      return { ok: true, data };
    }
    return { ok: false, error: `HTTP ${response.status}` };
  } catch (err) {
    return { ok: false, error: err.message || "Backend unreachable" };
  }
}

// Start clip upload analysis job
async function startClipAnalysis(dataUrl, filename) {
  const backendUrl = await getBackendUrl();
  const blob = dataURLtoBlob(dataUrl);

  const formData = new FormData();
  formData.append("file", blob, filename || "captured_clip.webm");

  const uploadRes = await fetch(`${backendUrl}/api/v1/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Upload failed HTTP ${uploadRes.status}: ${errText}`);
  }

  const data = await uploadRes.json();
  if (!data.analysis_id) {
    throw new Error("Server returned response without analysis_id");
  }

  return { ok: true, analysisId: data.analysis_id };
}

// Start sample analysis job
async function startSampleAnalysis(sampleType) {
  const backendUrl = await getBackendUrl();
  const res = await fetch(`${backendUrl}/api/v1/analyze/sample?sample_type=${sampleType || 'authentic'}`, {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error(`Sample analysis failed HTTP ${res.status}`);
  }

  const data = await res.json();
  if (!data.analysis_id) {
    throw new Error("Server returned response without analysis_id");
  }

  return { ok: true, analysisId: data.analysis_id };
}

// Fetch analysis status for a given analysis_id
async function getAnalysisStatus(analysisId) {
  const backendUrl = await getBackendUrl();
  const res = await fetch(`${backendUrl}/api/v1/analyze/${analysisId}`);
  if (!res.ok) {
    throw new Error(`Status check failed HTTP ${res.status}`);
  }
  const jobData = await res.json();
  return { ok: true, jobData };
}

// Listen for messages from content scripts and popup UI
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CHECK_HEALTH") {
    checkBackendHealth().then(sendResponse).catch(err => {
      sendResponse({ ok: false, error: err.message });
    });
    return true; // async response
  }

  if (message.type === "START_CLIP_ANALYSIS") {
    startClipAnalysis(message.dataUrl, message.filename).then(sendResponse).catch(err => {
      sendResponse({ ok: false, error: err.message });
    });
    return true; // async response
  }

  if (message.type === "START_SAMPLE_ANALYSIS") {
    startSampleAnalysis(message.sampleType).then(sendResponse).catch(err => {
      sendResponse({ ok: false, error: err.message });
    });
    return true; // async response
  }

  if (message.type === "GET_ANALYSIS_STATUS") {
    getAnalysisStatus(message.analysisId).then(sendResponse).catch(err => {
      sendResponse({ ok: false, error: err.message });
    });
    return true; // async response
  }

  if (message.type === "SET_BACKEND_URL") {
    chrome.storage.local.set({ backendUrl: message.url }, () => {
      sendResponse({ ok: true, url: message.url });
    });
    return true;
  }

  if (message.type === "GET_BACKEND_URL") {
    getBackendUrl().then((url) => sendResponse({ url }));
    return true;
  }
});
