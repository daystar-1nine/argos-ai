"""
ARGOS AI - Face & Lip Region Extraction Module
Detects and tracks face, extracts normalized lip crops across temporal video frames.
"""

from typing import List, Dict, Any, Tuple, Optional
import cv2
import numpy as np

from ml.config import LIP_CROP_SIZE


class NoFaceDetectedError(Exception):
    """Raised when no human face can be detected across the sampled video."""
    pass


class LipExtractor:
    """
    Robust spatiotemporal face detector and lip region extractor.
    Combines OpenCV Haar Cascade / Face detector with temporal trajectory smoothing.
    """

    def __init__(self, crop_size: Tuple[int, int] = LIP_CROP_SIZE):
        self.crop_size = crop_size
        
        # Load OpenCV Frontal Face Cascade (guaranteed built-in with opencv-python)
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        self.face_cascade = cv2.CascadeClassifier(cascade_path)
        if self.face_cascade.empty():
            # Try alternate cascade path
            alt_path = cv2.data.haarcascades + "haarcascade_frontalface_alt2.xml"
            self.face_cascade = cv2.CascadeClassifier(alt_path)

    def detect_primary_face(self, frame_rgb: np.ndarray) -> Optional[Tuple[int, int, int, int]]:
        """
        Detects primary face bounding box (x, y, w, h) in RGB frame.
        Picks the largest face detected if multiple are present.
        """
        gray = cv2.cvtColor(frame_rgb, cv2.COLOR_RGB2GRAY)
        # Equalize histogram for contrast invariance
        gray = cv2.equalizeHist(gray)
        
        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.15,
            minNeighbors=4,
            minSize=(60, 60),
            flags=cv2.CASCADE_SCALE_IMAGE
        )

        if len(faces) == 0:
            return None

        # Sort by area (w * h) descending to get primary speaker
        faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
        x, y, w, h = faces[0]
        return int(x), int(y), int(w), int(h)

    def smooth_face_boxes(
        self, 
        raw_boxes: List[Optional[Tuple[int, int, int, int]]], 
        frame_shape: Tuple[int, int]
    ) -> List[Tuple[int, int, int, int]]:
        """
        Interpolates missing detections and applies temporal exponential smoothing.
        Prevents jitter and handles transient occlusion.
        """
        n = len(raw_boxes)
        if n == 0:
            return []

        # Find first valid box
        first_valid_idx = None
        for i, box in enumerate(raw_boxes):
            if box is not None:
                first_valid_idx = i
                break

        if first_valid_idx is None:
            # Fall back to centered bounding box if no face was found
            h_frame, w_frame = frame_shape[:2]
            cx, cy = w_frame // 2, h_frame // 2
            size = min(w_frame, h_frame) // 2
            default_box = (cx - size // 2, cy - size // 2, size, size)
            return [default_box] * n

        # Fill backwards
        filled_boxes: List[Tuple[int, int, int, int]] = [raw_boxes[first_valid_idx]] * first_valid_idx

        # Fill forward with interpolation
        last_box = raw_boxes[first_valid_idx]
        for i in range(first_valid_idx, n):
            if raw_boxes[i] is not None:
                last_box = raw_boxes[i]
            filled_boxes.append(last_box)

        # Apply temporal moving average smoothing (window = 5)
        smoothed_boxes: List[Tuple[int, int, int, int]] = []
        smooth_window = 5
        for i in range(n):
            start_idx = max(0, i - smooth_window // 2)
            end_idx = min(n, i + smooth_window // 2 + 1)
            window_slice = filled_boxes[start_idx:end_idx]

            avg_x = int(np.mean([b[0] for b in window_slice]))
            avg_y = int(np.mean([b[1] for b in window_slice]))
            avg_w = int(np.mean([b[2] for b in window_slice]))
            avg_h = int(np.mean([b[3] for b in window_slice]))
            smoothed_boxes.append((avg_x, avg_y, avg_w, avg_h))

        return smoothed_boxes

    def extract_lip_crop(
        self, 
        frame_rgb: np.ndarray, 
        face_box: Tuple[int, int, int, int]
    ) -> np.ndarray:
        """
        Extracts mouth/lip crop from face box using facial anthropometric coordinates:
        Mouth spans vertically from ~62% to ~95% of face height,
        and horizontally from ~20% to ~80% of face width.
        """
        fx, fy, fw, fh = face_box
        h_frame, w_frame = frame_rgb.shape[:2]

        # Calculate mouth bounding box with safety margins
        mx = max(0, int(fx + 0.18 * fw))
        my = max(0, int(fy + 0.62 * fh))
        mw = min(w_frame - mx, int(0.64 * fw))
        mh = min(h_frame - my, int(0.35 * fh))

        if mw <= 0 or mh <= 0:
            # Fallback zero patch
            return np.zeros((self.crop_size[1], self.crop_size[0]), dtype=np.float32)

        lip_region = frame_rgb[my : my + mh, mx : mx + mw]

        # Convert to single-channel Grayscale for lip landmark analysis
        lip_gray = cv2.cvtColor(lip_region, cv2.COLOR_RGB2GRAY)

        # Resize to standard normalized dimension (96x96)
        lip_resized = cv2.resize(lip_gray, self.crop_size, interpolation=cv2.INTER_AREA)

        # Normalize pixel intensities to [0.0, 1.0]
        lip_normalized = lip_resized.astype(np.float32) / 255.0

        return lip_normalized

    def process_frames(
        self, 
        frames_rgb: List[np.ndarray], 
        timestamps: List[float]
    ) -> Dict[str, Any]:
        """
        Processes entire frame sequence:
        1. Detects face per frame
        2. Smooths temporal trajectory
        3. Extracts normalized 96x96 lip crops
        4. Calculates visual motion velocity (frame-to-frame lip delta)
        """
        if not frames_rgb:
            raise ValueError("Empty frame list supplied to lip extractor.")

        frame_shape = frames_rgb[0].shape
        raw_boxes = [self.detect_primary_face(frame) for frame in frames_rgb]

        # Check face detection presence
        detected_count = sum(1 for b in raw_boxes if b is not None)
        face_detection_ratio = detected_count / len(frames_rgb)

        # Smooth trajectories across temporal sequence
        smooth_boxes = self.smooth_face_boxes(raw_boxes, frame_shape)

        # Extract normalized lip crops
        lip_crops: List[np.ndarray] = []
        for frame, box in zip(frames_rgb, smooth_boxes):
            lip_crop = self.extract_lip_crop(frame, box)
            lip_crops.append(lip_crop)

        # Calculate visual lip motion velocities (delta between consecutive frames)
        motion_deltas: List[float] = [0.0]
        for i in range(1, len(lip_crops)):
            diff = np.abs(lip_crops[i] - lip_crops[i - 1])
            motion_deltas.append(float(np.mean(diff)))

        return {
            "lip_crops": lip_crops,  # List of (96, 96) float32 arrays in [0, 1]
            "face_boxes": smooth_boxes,
            "timestamps": timestamps,
            "face_detected": face_detection_ratio > 0.15,
            "face_detection_ratio": face_detection_ratio,
            "motion_deltas": motion_deltas,
            "total_frames": len(lip_crops),
        }
