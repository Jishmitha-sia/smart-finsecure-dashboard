from flask import Flask, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)

# Load model and scaler
MODEL_PATH = "model/fraud_model.pkl"
SCALER_PATH = "model/scaler.pkl"

model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

FEATURE_NAMES = [
    "amount",
    "hour",
    "category",
    "merchant_freq",
    "amount_deviation",
    "velocity"
]

@app.route("/", methods=["GET"])
def health():
    return jsonify({
        "status": "OK",
        "message": "Fraud Detection ML API is running"
    })

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No input data provided"}), 400

        features = []
        for feature in FEATURE_NAMES:
            if feature not in data:
                return jsonify({"error": f"Missing feature: {feature}"}), 400
            features.append(float(data[feature]))

        X = np.array(features).reshape(1, -1)
        X_scaled = scaler.transform(X)

        prediction = model.predict(X_scaled)[0]

        is_fraud = bool(prediction == -1)
        fraud_score = int(80 if is_fraud else 10)
        confidence = float(0.9 if is_fraud else 0.8)

        return jsonify({
            "isFraud": is_fraud,
            "fraudScore": fraud_score,
            "confidence": confidence
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
