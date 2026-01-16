"""
Flask API for fraud detection predictions
"""

import joblib
import numpy as np
from flask import Flask, request, jsonify

app = Flask(__name__)

# Load model and scaler
MODEL_PATH = "model/fraud_model.pkl"
SCALER_PATH = "model/scaler.pkl"

model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        required_fields = [
            "amount",
            "hour",
            "category",
            "merchant_freq",
            "amount_deviation",
            "velocity"
        ]

        # Validate input
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "error": f"Missing field: {field}"
                }), 400

        features = np.array([[
            data["amount"],
            data["hour"],
            data["category"],
            data["merchant_freq"],
            data["amount_deviation"],
            data["velocity"]
        ]])

        # Scale features
        features_scaled = scaler.transform(features)

        # Predict
        anomaly_score = model.decision_function(features_scaled)[0]
        prediction = model.predict(features_scaled)[0]

        # Convert outputs
        fraud_score = int((1 - anomaly_score) * 100)
        is_fraud = prediction == -1
        confidence = round(abs(anomaly_score), 2)

        return jsonify({
            "fraudScore": fraud_score,
            "isFraud": is_fraud,
            "confidence": confidence
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


@app.route("/", methods=["GET"])
def health():
    return jsonify({
        "status": "OK",
        "message": "Fraud Detection ML API is running"
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
