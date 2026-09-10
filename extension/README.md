# ARGOS.AI Browser Extension — Deepfake & Media Forensics Scanner

Manifest V3 Browser Extension for **ARGOS.AI** that automatically detects HTML5 videos on YouTube, Instagram, Twitter/X, TikTok, and web pages, captures video snippets, communicates with the ARGOS AI backend, and renders real-time forensic risk scores inline.

---

## 🎯 Features

- **Automated Video Detection**: Scans DOM for `<video>` elements on YouTube, Instagram, and web pages.
- **In-Video HUD Badge**: Injects a floating "ARGOS Scan Video" badge directly onto detected videos.
- **Audiovisual Snippet Capture**: Records a 2.5-second clip using browser `MediaRecorder` & `captureStream()` APIs.
- **Direct AI Pipeline Integration**: Sends clips to ARGOS AI backend (`POST /api/v1/analyze`).
- **5-Point Multimodal AI Check**:
  1. 👄 **Lip Synchronization**
  2. 👤 **Face Manipulation**
  3. 🎞️ **AI-Generated Frames**
  4. 🔊 **Audio Manipulation**
  5. ⏱️ **Temporal Inconsistency**
- **Inline Forensic HUD Dashboard**: Renders overall risk score % and metric breakdowns right over the video.

---

## 🚀 How to Load & Use in Google Chrome / Edge / Brave

1. Open Google Chrome (or any Chromium browser).
2. Navigate to `chrome://extensions`.
3. Enable **Developer mode** toggle in the top-right corner.
4. Click **Load unpacked** in the top-left corner.
5. Select the `extension/` folder from this project repository (`Project/Scan/extension`).
6. Open YouTube (e.g. `https://www.youtube.com`) or Instagram (e.g. `https://www.instagram.com`).
7. Hover over any video to see the glowing **ARGOS Scan Video** badge on the top right.
8. Click **ARGOS Scan Video** to trigger live analysis!

---

## ⚙️ Configuration

- Default Backend URL: `http://localhost:8000`
- Click the ARGOS extension icon in your browser toolbar to open the control popup, verify server connection status ("Online"), or change the backend URL.
