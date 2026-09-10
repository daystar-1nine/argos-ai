"""
ARGOS AI - Video Testing & Evaluation System Test Suite
Verifies single video inference, batch evaluation metrics, edge case handling,
debug artifact generation, and Test Lab API endpoints.
"""

import sys
import time
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Ensure backend in sys.path
backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from app.main import app
from ml.evaluation.evaluator import VideoEvaluator
from scripts.evaluate_dataset import compute_metrics

client = TestClient(app)
root_dir = Path(__file__).resolve().parent.parent.parent


def test_01_single_real_video_inference():
    """1. Single authentic video produces REAL verdict and high AV sync score."""
    real_video = root_dir / "data" / "test" / "real" / "real_01.mp4"
    assert real_video.exists(), f"Test fixture {real_video} missing"

    evaluator = VideoEvaluator()
    result = evaluator.evaluate(str(real_video), ground_truth="real")

    assert result["status"] == "completed"
    assert result["verdict"] == "REAL"
    assert result["sync_score"] >= 0.75
    assert result["confidence"] >= 0.50
    assert result["real_probability"] > result["fake_probability"]
    assert len(result["evidence_frames"]) >= 1
    assert Path(result["result_json_path"]).exists()


def test_02_single_fake_video_inference():
    """2. Single manipulated video produces POTENTIALLY_MANIPULATED or FAKE verdict."""
    fake_video = root_dir / "data" / "test" / "fake" / "fake_01.mp4"
    assert fake_video.exists(), f"Test fixture {fake_video} missing"

    evaluator = VideoEvaluator()
    result = evaluator.evaluate(str(fake_video), ground_truth="fake")

    assert result["status"] == "completed"
    assert result["verdict"] in ["POTENTIALLY MANIPULATED", "POTENTIALLY_MANIPULATED", "FAKE"]
    assert result["sync_score"] < 0.75
    assert len(result["suspicious_windows"]) >= 1
    assert result["fake_probability"] > result["real_probability"]


def test_03_silent_video_edge_case():
    """3. Silent video without audio stream reports AV SYNC ANALYSIS UNAVAILABLE."""
    silent_video = root_dir / "data" / "test" / "edge_cases" / "no_audio.mp4"
    assert silent_video.exists(), f"Test fixture {silent_video} missing"

    evaluator = VideoEvaluator()
    result = evaluator.evaluate(str(silent_video))

    assert result["status"] == "unavailable"
    assert result["error_type"] == "MISSING_AUDIO"
    assert "No audio stream detected" in result["message"]


def test_04_no_face_video_edge_case():
    """4. Video without human face reports FACE NOT DETECTED."""
    no_face_video = root_dir / "data" / "test" / "edge_cases" / "no_face.mp4"
    assert no_face_video.exists(), f"Test fixture {no_face_video} missing"

    evaluator = VideoEvaluator()
    result = evaluator.evaluate(str(no_face_video))

    assert result["status"] == "unavailable"
    assert result["error_type"] == "FACE_NOT_DETECTED"
    assert "No human face identified" in result["message"]


def test_05_debug_artifacts_generation():
    """5. Running with debug=True generates spectrogram, sync plot, and lip crops."""
    real_video = root_dir / "data" / "test" / "real" / "real_01.mp4"
    evaluator = VideoEvaluator()
    result = evaluator.evaluate(str(real_video), debug=True)

    assert result["status"] == "completed"
    assert result["debug"] is not None
    dbg = result["debug"]

    assert Path(dbg["sync_plot"]).exists()
    assert Path(dbg["mel_plot"]).exists()
    assert Path(dbg["debug_json"]).exists()
    assert len(dbg["face_crops"]) >= 1
    assert len(dbg["lip_crops"]) >= 1


def test_06_batch_evaluation_metrics_computation():
    """6. Batch evaluation computes genuine Accuracy, Precision, Recall, F1, and Confusion Matrix."""
    sample_records = [
        {"status": "completed", "ground_truth": "real", "prediction": "real", "fake_probability": 0.1},
        {"status": "completed", "ground_truth": "real", "prediction": "real", "fake_probability": 0.15},
        {"status": "completed", "ground_truth": "fake", "prediction": "potentially_manipulated", "fake_probability": 0.8},
        {"status": "completed", "ground_truth": "fake", "prediction": "fake", "fake_probability": 0.9},
    ]

    metrics, cm = compute_metrics(sample_records)

    assert metrics["total_tested"] == 4
    assert metrics["accuracy"] == 1.0
    assert metrics["precision"] == 1.0
    assert metrics["recall"] == 1.0
    assert metrics["f1_score"] == 1.0
    assert metrics["roc_auc"] == 1.0
    assert cm[0, 0] == 2  # TN
    assert cm[0, 1] == 0  # FP
    assert cm[1, 0] == 0  # FN
    assert cm[1, 1] == 2  # TP


def test_07_test_lab_api_samples_endpoint():
    """7. GET /api/test-lab/samples returns real, fake, and edge case benchmark files."""
    res = client.get("/api/test-lab/samples")
    assert res.status_code == 200
    data = res.json()

    assert "real" in data
    assert "fake" in data
    assert "edge_cases" in data
    assert len(data["real"]) >= 1
    assert len(data["fake"]) >= 1


def test_08_test_lab_api_analyze_lifecycle():
    """8. Complete lifecycle: dispatch test job -> poll status -> retrieve result."""
    # 1. Dispatch sample
    dispatch_res = client.post("/api/test-lab/analyze-sample?category=real&filename=real_01.mp4&debug=false")
    assert dispatch_res.status_code == 202
    test_id = dispatch_res.json()["test_id"]

    # 2. Poll status until complete
    completed = False
    for _ in range(25):
        time.sleep(0.3)
        st_res = client.get(f"/api/test-lab/{test_id}")
        assert st_res.status_code == 200
        st_data = st_res.json()
        if st_data["status"] == "completed" or st_data["has_result"]:
            completed = True
            break

    assert completed, f"Test job {test_id} timed out before completion"

    # 3. Retrieve final result
    res = client.get(f"/api/test-lab/{test_id}/result")
    assert res.status_code == 200
    res_data = res.json()
    assert res_data["verdict"] == "REAL"
    assert "sync_score" in res_data
    assert "evidence_frames" in res_data


def test_09_test_lab_api_compare_endpoint():
    """9. POST /api/test-lab/compare returns comparative differential scorecard."""
    # Run real sample
    d1 = client.post("/api/test-lab/analyze-sample?category=real&filename=real_01.mp4&debug=false").json()
    # Run fake sample
    d2 = client.post("/api/test-lab/analyze-sample?category=fake&filename=fake_01.mp4&debug=false").json()

    # Wait for completion
    for tid in [d1["test_id"], d2["test_id"]]:
        for _ in range(25):
            time.sleep(0.3)
            chk = client.get(f"/api/test-lab/{tid}").json()
            if chk["status"] == "completed" or chk["has_result"]:
                break

    # Compare
    comp_res = client.post("/api/test-lab/compare", data={
        "real_test_id": d1["test_id"],
        "fake_test_id": d2["test_id"],
    })
    assert comp_res.status_code == 200
    comp_data = comp_res.json()

    assert "real" in comp_data
    assert "fake" in comp_data
    assert "matrix" in comp_data
    assert len(comp_data["matrix"]) >= 4
