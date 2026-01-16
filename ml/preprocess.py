"""
Preprocessing utilities for fraud detection model
"""

import pandas as pd
from sklearn.preprocessing import StandardScaler

FEATURE_COLUMNS = [
    "amount",
    "hour",
    "category",
    "merchant_freq",
    "amount_deviation",
    "velocity"
]

def load_and_preprocess(csv_path):
    """
    Load CSV and return scaled features + labels
    """
    df = pd.read_csv(csv_path)

    X = df[FEATURE_COLUMNS]
    y = df["label"]  # used only for evaluation

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    return X_scaled, y, scaler
