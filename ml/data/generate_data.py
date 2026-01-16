"""
Synthetic transaction data generator
Used for training anomaly detection model
"""

import numpy as np
import pandas as pd
import random

np.random.seed(42)

TOTAL_SAMPLES = 2000
FRAUD_RATIO = 0.1  # 10% fraud-like

data = []

for i in range(TOTAL_SAMPLES):
    is_fraud = random.random() < FRAUD_RATIO

    if not is_fraud:
        # Normal transaction
        amount = np.random.normal(500, 150)
        hour = np.random.randint(8, 22)
        category = np.random.randint(0, 6)
        merchant_freq = np.random.randint(10, 50)
        amount_deviation = np.random.normal(1.0, 0.3)
        velocity = np.random.randint(1, 3)
        label = 0
    else:
        # Fraud-like transaction
        amount = np.random.normal(5000, 2000)
        hour = np.random.choice([0, 1, 2, 3, 23])
        category = np.random.randint(2, 7)
        merchant_freq = np.random.randint(0, 2)
        amount_deviation = np.random.normal(5.0, 2.0)
        velocity = np.random.randint(4, 10)
        label = 1

    data.append([
        abs(amount),
        hour,
        category,
        merchant_freq,
        abs(amount_deviation),
        velocity,
        label
    ])

columns = [
    "amount",
    "hour",
    "category",
    "merchant_freq",
    "amount_deviation",
    "velocity",
    "label"
]

df = pd.DataFrame(data, columns=columns)

df.to_csv("transactions.csv", index=False)

print("✅ Synthetic transaction dataset generated: transactions.csv")
