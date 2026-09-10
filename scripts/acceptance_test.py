import time
import requests
import json
from pathlib import Path

BASE_URL = 'http://127.0.0.1:8000'

def test_video(path_str, ground_truth, label):
    path = Path(path_str)
    print(f"\n========================================================")
    print(f" TESTING {label}: {path.name} (GT: {ground_truth.upper()})")
    print(f"========================================================")
    
    with open(path, 'rb') as f:
        files = {'file': (path.name, f, 'video/mp4')}
        data = {'ground_truth': ground_truth, 'debug': 'true'}
        res = requests.post(f'{BASE_URL}/api/test-lab/analyze', files=files, data=data)
    
    assert res.status_code == 202, f"Expected 202, got {res.status_code}: {res.text}"
    job = res.json()
    test_id = job['test_id']
    print(f"Dispatched test_id: {test_id}")

    last_stage = None
    for _ in range(50):
        time.sleep(0.35)
        s_res = requests.get(f'{BASE_URL}/api/test-lab/{test_id}')
        status_data = s_res.json()
        stage = status_data.get('current_stage')
        pct = status_data.get('progress_pct')
        num = status_data.get('stage_number')
        if stage != last_stage:
            print(f"  [Stage {num:02d}/12 ({pct:3d}%)] {stage}")
            last_stage = stage
        if status_data.get('has_result') or status_data.get('status') == 'completed':
            break

    r_res = requests.get(f'{BASE_URL}/api/test-lab/{test_id}/result')
    assert r_res.status_code == 200, f"Result error: {r_res.text}"
    result = r_res.json()

    print("\n---------------- ARGOS FORENSIC RESULT ----------------")
    print(f"VERDICT           : {result['verdict']}")
    print(f"Confidence        : {result['confidence_pct']}%")
    print(f"Real Probability  : {result['real_probability'] * 100:.1f}%")
    print(f"Fake Probability  : {result['fake_probability'] * 100:.1f}%")
    print(f"AV Synchronization: {result['sync_score'] * 100:.1f}%")
    print(f"Visual Score      : {result['visual_score']}%")
    print(f"Audio Score       : {result['audio_score']}%")
    print(f"Suspicious Windows: {len(result.get('suspicious_windows', []))}")
    for w in result.get('suspicious_windows', []):
        print(f"  * {w.get('start_timecode')} -> {w.get('end_timecode')} [{w.get('severity')}] (Sync: {w.get('sync_score')*100:.1f}%)")
    print(f"Evidence Frames   : {len(result.get('evidence_frames', []))}")
    for ev in result.get('evidence_frames', []):
        print(f"  * Keyframe: frame #{ev.get('frame_number')} at {ev.get('timestamp')}s (Anomaly: {ev.get('is_anomaly')})")
    print("--------------------------------------------------------\n")
    return result

if __name__ == '__main__':
    r1 = test_video('data/test/real/real_01.mp4', 'real', 'REAL VIDEO')
    assert r1['verdict'] == 'REAL', f"Expected REAL, got {r1['verdict']}"

    r2 = test_video('data/test/fake/fake_01.mp4', 'fake', 'MANIPULATED VIDEO')
    assert r2['verdict'] == 'POTENTIALLY MANIPULATED', f"Expected POTENTIALLY MANIPULATED, got {r2['verdict']}"
    assert len(r2['suspicious_windows']) >= 1, "Expected at least 1 suspicious window"

    print("\n>>> ALL ACCEPTANCE TESTS PASSED SUCCESSFULLY! <<<\n")
