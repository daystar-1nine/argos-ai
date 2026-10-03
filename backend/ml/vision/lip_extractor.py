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

    def detect_all_faces(self, frame_rgb: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """Detects all candidate face bounding boxes in an RGB frame."""
        gray = cv2.cvtColor(frame_rgb, cv2.COLOR_RGB2GRAY)
        gray = cv2.equalizeHist(gray)
        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.12,
            minNeighbors=4,
            minSize=(80, 80),
            flags=cv2.CASCADE_SCALE_IMAGE
        )
        return [(int(x), int(y), int(w), int(h)) for (x, y, w, h) in faces]

    def detect_primary_face(self, frame_rgb: np.ndarray) -> Optional[Tuple[int, int, int, int]]:
        """Detects largest candidate face bounding box in RGB frame."""
        faces = self.detect_all_faces(frame_rgb)
        if not faces:
            return None
        # Sort by area descending
        faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
        return faces[0]

    def establish_dominant_face_anchor(
        self,
        frames_rgb: List[np.ndarray],
        max_samples: int = 40
    ) -> Optional[Tuple[int, int, int, int]]:
        """
        Samples frames across the video to establish the stable spatial cluster (anchor)
        of the primary speaker's head, filtering out transient torso/clothing false positives.
        """
        n = len(frames_rgb)
        step = max(1, n // max_samples)
        candidates = []
        h_frame, w_frame = frames_rgb[0].shape[:2]

        for i in range(0, n, step):
            boxes = self.detect_all_faces(frames_rgb[i])
            for b in boxes:
                # Human speaker head is typically in upper 75% of frame with reasonable size
                cy = b[1] + b[3] / 2.0
                if cy < h_frame * 0.75 and b[2] >= min(w_frame, h_frame) * 0.10:
                    candidates.append(b)

        if not candidates:
            return None

        # Robust median of upper candidate cluster
        med_x = int(np.median([b[0] for b in candidates]))
        med_y = int(np.median([b[1] for b in candidates]))
        med_w = int(np.median([b[2] for b in candidates]))
        med_h = int(np.median([b[3] for b in candidates]))
        return (med_x, med_y, med_w, med_h)

    def smooth_face_boxes(
        self, 
        raw_boxes: List[Optional[Tuple[int, int, int, int]]], 
        frame_shape: Tuple[int, int],
        anchor_box: Optional[Tuple[int, int, int, int]] = None,
    ) -> List[Tuple[int, int, int, int]]:
        """
        Interpolates missing detections and applies temporal exponential smoothing.
        Anchored to primary speaker trajectory to reject teleporting outliers.
        """
        n = len(raw_boxes)
        if n == 0:
            return []

        h_frame, w_frame = frame_shape[:2]

        # Determine reference anchor
        if anchor_box is None:
            first_valid = next((b for b in raw_boxes if b is not None), None)
            if first_valid is not None:
                anchor_box = first_valid
            else:
                cx, cy = w_frame // 2, int(h_frame * 0.35)
                sz = min(w_frame, h_frame) // 3
                anchor_box = (cx - sz // 2, cy - sz // 2, sz, sz)

        ax, ay, aw, ah = anchor_box
        acx, acy = ax + aw / 2.0, ay + ah / 2.0
        max_dist = max(w_frame, h_frame) * 0.30

        # Filter out wild outliers from raw_boxes
        filtered_boxes: List[Optional[Tuple[int, int, int, int]]] = []
        for b in raw_boxes:
            if b is None:
                filtered_boxes.append(None)
            else:
                bcx = b[0] + b[2] / 2.0
                bcy = b[1] + b[3] / 2.0
                dist = np.sqrt((bcx - acx) ** 2 + (bcy - acy) ** 2)
                # Check distance and size consistency with anchor
                size_ratio = (b[2] * b[3]) / max(1.0, float(aw * ah))
                if dist <= max_dist and 0.4 <= size_ratio <= 2.5:
                    filtered_boxes.append(b)
                else:
                    filtered_boxes.append(None)

        # Forward fill and EMA smooth
        filled_boxes: List[Tuple[int, int, int, int]] = []
        current_box = anchor_box
        for b in filtered_boxes:
            if b is not None:
                # Exponential moving average
                cur_x = int(0.75 * current_box[0] + 0.25 * b[0])
                cur_y = int(0.75 * current_box[1] + 0.25 * b[1])
                cur_w = int(0.75 * current_box[2] + 0.25 * b[2])
                cur_h = int(0.75 * current_box[3] + 0.25 * b[3])
                current_box = (cur_x, cur_y, cur_w, cur_h)
            filled_boxes.append(current_box)

        # Apply a temporal bidirectional window smooth
        smoothed_boxes: List[Tuple[int, int, int, int]] = []
        smooth_window = 7
        for i in range(n):
            s_idx = max(0, i - smooth_window // 2)
            e_idx = min(n, i + smooth_window // 2 + 1)
            window_slice = filled_boxes[s_idx:e_idx]
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
        anchor_box = self.establish_dominant_face_anchor(frames_rgb)
        raw_boxes = [self.detect_primary_face(frame) for frame in frames_rgb]

        # Check face detection presence
        detected_count = sum(1 for b in raw_boxes if b is not None)
        face_detection_ratio = detected_count / len(frames_rgb)

        # Smooth trajectories across temporal sequence anchored to dominant speaker
        smooth_boxes = self.smooth_face_boxes(raw_boxes, frame_shape, anchor_box=anchor_box)

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
