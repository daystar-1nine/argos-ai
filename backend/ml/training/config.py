"""
ARGOS AI - Training Pipeline Configuration
"""

from pathlib import Path

TRAINING_DATA_DIR = Path("data")
TRAIN_DIR = TRAINING_DATA_DIR / "train"
VAL_DIR = TRAINING_DATA_DIR / "val"
TEST_DIR = TRAINING_DATA_DIR / "test"

BATCH_SIZE = 16
LEARNING_RATE = 1e-3
WEIGHT_DECAY = 1e-4
EPOCHS = 20
NUM_WORKERS = 0  # 0 for Windows compatibility
SEED = 42

INPUT_FEATURE_DIM = 24
NUM_CLASSES = 2
