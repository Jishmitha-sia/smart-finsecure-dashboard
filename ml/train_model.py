"""
Train Isolation Forest model for fraud detection
"""

import joblib
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.metrics import classification_report
from preprocess import load_and_preprocess


DATA_PATH = "data/transactions.csv"
MODEL_PATH = "model/fraud_model.pkl"
SCALER_PATH = "model/scaler.pkl"

# Load and preprocess data
X, y, scaler = load_and_preprocess(DATA_PATH)

# Train Isolation Forest
model = IsolationForest(
    n_estimators=100,
    contamination=0.1,
    random_state=42
)

model.fit(X)

# Predict anomalies
preds = model.predict(X)
# IsolationForest: -1 = anomaly, 1 = normal
preds_binary = np.where(preds == -1, 1, 0)

print("📊 Model Evaluation (for reference only):")
print(classification_report(y, preds_binary))

# Save model and scaler
joblib.dump(model, MODEL_PATH)
joblib.dump(scaler, SCALER_PATH)

print("✅ Model and scaler saved successfully")
