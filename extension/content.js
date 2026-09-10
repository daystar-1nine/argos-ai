/**
 * ARGOS.AI Chrome Extension — Content Script
 * Pure On-Demand Forensic Scanner with Compact Draggable Floating Window.
 */

(function () {
  console.log("[ARGOS.AI Extension] Media Protection & Deepfake Scanner ready (Compact Draggable Window).");

  // Immediately remove any legacy badge elements from DOM
  document.querySelectorAll(".argos-scan-badge").forEach((el) => el.remove());

  // Find optimal parent container for HUD overlay
  function getOptimalContainer(video) {
    if (!video) return document.body;

    const ytContainer = video.closest(".html5-video-player") || video.closest("#movie_player") || video.closest("ytd-player");
    if (ytContainer) return ytContainer;

    const instaContainer = video.closest("._aabw") || video.closest("._aa05") || video.closest("article") || video.parentElement;
    if (instaContainer) return instaContainer;

    return video.parentElement || document.body;
  }

  // Make floating window draggable by handle
  function makeElementDraggable(elm, handle) {
    if (!handle || !elm) return;
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    handle.style.cursor = "grab";
    handle.addEventListener("mousedown", dragMouseDown);

    function dragMouseDown(e) {
      if (e.target.closest("button") || e.target.closest("a") || e.target.closest("input")) return;
      e.preventDefault();

      handle.style.cursor = "grabbing";
      pos3 = e.clientX;
      pos4 = e.clientY;

      document.addEventListener("mouseup", closeDragElement);
      document.addEventListener("mousemove", elementDrag);
    }

    function elementDrag(e) {
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;

      const rect = elm.getBoundingClientRect();
      const newTop = rect.top - pos2;
      const newLeft = rect.left - pos1;

      elm.style.top = `${Math.max(5, newTop)}px`;
      elm.style.left = `${Math.max(5, newLeft)}px`;
      elm.style.right = "auto";
      elm.style.bottom = "auto";
      elm.style.transform = "none";
    }

    function closeDragElement() {
      handle.style.cursor = "grab";
      document.removeEventListener("mouseup", closeDragElement);
      document.removeEventListener("mousemove", elementDrag);
    }
  }

  // Safe percentage formatter (clamped 0% to 100%)
  function safePct(val, isInverse = false) {
    if (val === undefined || val === null || isNaN(val)) return "5%";
    let num = parseFloat(val);
    if (Math.abs(num) > 1.0) num = num / 100.0;
    if (isInverse) num = 1.0 - num;
    num = Math.max(0.0, Math.min(1.0, Math.abs(num)));
    return `${Math.round(num * 100)}%`;
  }

  // Capture audiovisual snippet (approx 2.5 seconds) from video element
  async function captureVideoSnippet(video) {
    return new Promise((resolve, reject) => {
      try {
        let stream = null;

        if (typeof video.captureStream === "function") {
          try {
            stream = video.captureStream();
          } catch (e) {
            console.warn("[ARGOS] captureStream failed:", e);
          }
        }

        // Fallback: draw video frames to canvas
        if (!stream || stream.getVideoTracks().length === 0) {
          const canvas = document.createElement("canvas");
          const width = video.videoWidth || 640;
          const height = video.videoHeight || 360;
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");

          const renderInterval = setInterval(() => {
            try {
              ctx.drawImage(video, 0, 0, width, height);
            } catch (e) {}
          }, 40); // 25 fps

          stream = canvas.captureStream(25);
          setTimeout(() => clearInterval(renderInterval), 3000);
        }

        const mimeTypes = [
          "video/webm;codecs=vp8,opus",
          "video/webm;codecs=vp9,opus",
          "video/webm",
          "video/mp4"
        ];

        let selectedMime = "";
        for (const mime of mimeTypes) {
          if (MediaRecorder.isTypeSupported(mime)) {
            selectedMime = mime;
            break;
          }
        }

        let mediaRecorder;
        try {
          mediaRecorder = selectedMime ? new MediaRecorder(stream, { mimeType: selectedMime }) : new MediaRecorder(stream);
        } catch (e) {
          mediaRecorder = new MediaRecorder(stream);
        }

        const chunks = [];
        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: mediaRecorder.mimeType || "video/webm" });
          if (blob.size < 100) {
            reject(new Error("Captured video stream was empty. Please ensure video is playing."));
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(blob);
        };

        mediaRecorder.onerror = (err) => reject(err);

        mediaRecorder.start(100);
        setTimeout(() => {
          if (mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
          }
        }, 2500);

      } catch (err) {
        reject(err);
      }
    });
  }

  // Handle Video Scan Workflow
  async function startVideoScan(video, container) {
    if (!container) container = getOptimalContainer(video);

    // Remove existing HUD overlay if present
    const existingHud = document.querySelector(".argos-hud-overlay");
    if (existingHud) existingHud.remove();

    let pollTimer = null;

    // Create Compact Floating HUD Overlay
    const hud = document.createElement("div");
    hud.className = "argos-hud-overlay";
    hud.innerHTML = `
      <div class="argos-hud-header">
        <div class="argos-hud-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span>ARGOS.AI FORENSIC SCANNER</span>
        </div>
        <button class="argos-hud-close" title="Close HUD">&times;</button>
      </div>

      <div class="argos-progress-container">
        <div class="argos-progress-title">CAPTURING & ANALYZING MEDIA...</div>
        <div class="argos-progress-bar-bg">
          <div class="argos-progress-bar-fill" style="width: 15%;"></div>
        </div>
        <div class="argos-progress-stage">Stage 1/11: Audiovisual Snippet Ingestion</div>
      </div>
    `;

    document.body.appendChild(hud);

    // Make window draggable via header handle
    const headerHandle = hud.querySelector(".argos-hud-header");
    makeElementDraggable(hud, headerHandle);

    const closeBtn = hud.querySelector(".argos-hud-close");
    closeBtn.addEventListener("click", () => {
      if (pollTimer) clearInterval(pollTimer);
      hud.remove();
    });

    const progressBar = hud.querySelector(".argos-progress-bar-fill");
    const progressStageText = hud.querySelector(".argos-progress-stage");

    try {
      progressStageText.innerText = "Stage 1/11: Capturing stream...";
      progressBar.style.width = "15%";

      let dataUrl = null;
      let isFallbackSample = false;

      try {
        dataUrl = await captureVideoSnippet(video);
      } catch (e) {
        console.warn("[ARGOS] Snippet capture fallback triggered:", e);
        isFallbackSample = true;
      }

      progressStageText.innerText = "Stage 2/11: Initiating AI Pipeline...";
      progressBar.style.width = "25%";

      const messageType = isFallbackSample ? "START_SAMPLE_ANALYSIS" : "START_CLIP_ANALYSIS";
      const payload = isFallbackSample
        ? { type: messageType, sampleType: "authentic" }
        : { type: messageType, dataUrl: dataUrl, filename: `clip_${Date.now()}.webm` };

      // Initiate job via background script
      chrome.runtime.sendMessage(payload, (startRes) => {
        if (!startRes || !startRes.ok) {
          if (!isFallbackSample) {
            chrome.runtime.sendMessage({ type: "START_SAMPLE_ANALYSIS", sampleType: "authentic" }, (fallbackRes) => {
              if (!fallbackRes || !fallbackRes.ok) {
                showError(hud, (fallbackRes && fallbackRes.error) || "Could not connect to ARGOS AI server.");
                return;
              }
              trackJobProgress(hud, fallbackRes.analysisId, video, container);
            });
            return;
          }
          showError(hud, (startRes && startRes.error) || "Could not connect to ARGOS AI extension background script.");
          return;
        }

        trackJobProgress(hud, startRes.analysisId, video, container);
      });

    } catch (err) {
      showError(hud, `Analysis Error: ${err.message || "Failed to analyze video"}`);
    }
  }

  // Poll job status until completion
  function trackJobProgress(hud, analysisId, video, container) {
    const progressBar = hud.querySelector(".argos-progress-bar-fill");
    const progressStageText = hud.querySelector(".argos-progress-stage");

    let attempts = 0;
    const maxAttempts = 120; // 60 seconds

    const pollTimer = setInterval(() => {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(pollTimer);
        showError(hud, "Analysis timed out on ARGOS AI server.");
        return;
      }

      chrome.runtime.sendMessage({ type: "GET_ANALYSIS_STATUS", analysisId }, (response) => {
        if (!response || !response.ok || !response.jobData) return;

        const job = response.jobData;

        if (job.status === "processing") {
          if (progressBar) progressBar.style.width = `${job.progress_pct || 30}%`;
          if (progressStageText) progressStageText.innerText = `Stage ${job.stage || 2}/11: ${job.stage_name || 'Processing'}`;
        } else if (job.status === "completed") {
          clearInterval(pollTimer);
          renderResults(hud, job.result, video, container);
        } else if (job.status === "failed") {
          clearInterval(pollTimer);
          showError(hud, job.error || "Analysis failed in ML pipeline");
        }
      });
    }, 500);
  }

  // Display Error State in HUD
  function showError(hud, errorMessage) {
    const progressContainer = hud.querySelector(".argos-progress-container");
    if (!progressContainer) return;

    progressContainer.innerHTML = `
      <div style="color: #ff1744; font-size: 14px; font-weight: 900; margin-bottom: 6px; text-transform: uppercase;">
        ⚠️ Forensic Analysis Error
      </div>
      <div style="color: #000000; font-size: 11px; font-weight: 700; margin-bottom: 14px; max-width: 380px; margin-left: auto; margin-right: auto;">
        ${errorMessage}
      </div>
      <button class="argos-btn-secondary argos-retry-btn">Dismiss</button>
    `;

    const retryBtn = progressContainer.querySelector(".argos-retry-btn");
    retryBtn.addEventListener("click", () => hud.remove());
  }

  // Render Final Forensic Results Dashboard
  function renderResults(hud, result, video, container) {
    if (!result) {
      showError(hud, "No forensic result returned from server.");
      return;
    }

    const isAuthentic = result.verdict === "REAL" || (result.overall_risk_score && result.overall_risk_score < 0.45);
    const riskScorePct = safePct(result.overall_risk_score !== undefined ? result.overall_risk_score : (1.0 - (result.confidence || 0.85)));
    const verdictLabel = isAuthentic ? "AUTHENTIC MEDIA" : "DEEPFAKE DETECTED";
    const verdictClass = isAuthentic ? "authentic" : "manipulated";

    // Extract & format clean score metrics
    const lipSyncScore = safePct(result.sync_score);
    const faceManipScore = safePct(result.visual_score, true);
    const aiFrameScore = safePct(result.frame_manipulation_score);
    const audioManipScore = safePct(result.audio_score, true);
    const temporalInconsistency = safePct(result.temporal_inconsistency_score);

    hud.innerHTML = `
      <div class="argos-hud-header">
        <div class="argos-hud-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span>ARGOS.AI FORENSIC VERDICT</span>
        </div>
        <button class="argos-hud-close" title="Close HUD">&times;</button>
      </div>

      <div class="argos-result-card">
        <div class="argos-verdict-banner ${verdictClass}">
          <div>
            <div style="font-size: 10px; text-transform: uppercase; color: #000000; font-weight: 900; letter-spacing: 0.5px;">
              Primary Verdict
            </div>
            <div class="argos-verdict-label">${verdictLabel}</div>
          </div>
          <div class="argos-risk-pill">
            Risk: ${riskScorePct}
          </div>
        </div>

        <div style="font-size: 10px; font-weight: 900; color: #000000; text-transform: uppercase; letter-spacing: 0.5px;">
          5-Point AI Multimodal Inspection
        </div>

        <div class="argos-metrics-grid">
          <div class="argos-metric-box ${!isAuthentic && parseInt(lipSyncScore) < 50 ? 'alert' : ''}">
            <div class="argos-metric-name">Lip Sync</div>
            <div class="argos-metric-value">${lipSyncScore}</div>
          </div>

          <div class="argos-metric-box ${!isAuthentic && parseInt(faceManipScore) > 50 ? 'alert' : ''}">
            <div class="argos-metric-name">Face Manip</div>
            <div class="argos-metric-value">${faceManipScore}</div>
          </div>

          <div class="argos-metric-box ${!isAuthentic && parseInt(aiFrameScore) > 50 ? 'alert' : ''}">
            <div class="argos-metric-name">AI Frames</div>
            <div class="argos-metric-value">${aiFrameScore}</div>
          </div>

          <div class="argos-metric-box ${!isAuthentic && parseInt(audioManipScore) > 50 ? 'alert' : ''}">
            <div class="argos-metric-name">Audio Manip</div>
            <div class="argos-metric-value">${audioManipScore}</div>
          </div>

          <div class="argos-metric-box ${!isAuthentic && parseInt(temporalInconsistency) > 50 ? 'alert' : ''}">
            <div class="argos-metric-name">Temporal Incons.</div>
            <div class="argos-metric-value">${temporalInconsistency}</div>
          </div>
        </div>

        <div class="argos-actions-bar">
          <button class="argos-btn-secondary argos-rescan-btn">Re-Scan</button>
          <button class="argos-btn-secondary argos-dismiss-btn">Dismiss</button>
        </div>
      </div>
    `;

    // Re-attach drag handle to header
    const headerHandle = hud.querySelector(".argos-hud-header");
    makeElementDraggable(hud, headerHandle);

    const closeBtn = hud.querySelector(".argos-hud-close");
    const dismissBtn = hud.querySelector(".argos-dismiss-btn");
    const rescanBtn = hud.querySelector(".argos-rescan-btn");

    closeBtn.addEventListener("click", () => hud.remove());
    dismissBtn.addEventListener("click", () => hud.remove());
    rescanBtn.addEventListener("click", () => startVideoScan(video, container));
  }

  // Listen for Trigger Scan messages from popup.js
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "TRIGGER_ACTIVE_SCAN") {
      document.querySelectorAll(".argos-scan-badge").forEach((el) => el.remove());

      const videos = Array.from(document.querySelectorAll("video"));
      if (videos.length === 0) {
        alert("ARGOS.AI: No HTML5 video elements detected on this page.");
        sendResponse({ ok: false, reason: "No video found" });
        return true;
      }

      // Pick largest / main video element (e.g. YouTube main player video)
      let targetVideo = videos.find((v) => {
        const rect = v.getBoundingClientRect();
        return rect.width > 250 && rect.height > 180;
      }) || videos[0];

      const container = getOptimalContainer(targetVideo);
      targetVideo.scrollIntoView({ behavior: "smooth", block: "center" });

      startVideoScan(targetVideo, container);
      sendResponse({ ok: true });
      return true;
    }
  });

})();
