import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
import joblib
import os
import json
import matplotlib.pyplot as plt

def train_model():
    print("========================================")
    print("FLAT PRICE ML MODEL (JUPYTER LOGIC)")
    print("========================================")

    # 1. Load Dataset
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(base_dir, 'data', 'Flat_Price_Multiple_Linear_Regression_100.xlsx')
    
    if not os.path.exists(data_path):
        print(f"Dataset not found at {data_path}")
        return

    df = pd.read_excel(data_path)
    
    # 2. Select Features and Target
    x = df[["Area_Sqft", "Facing", "Floor", "Car_Parking_Sqft", "Bedrooms"]]
    y = df["Price_Lakh"]

    # 3. Convert Facing into numbers (One-Hot Encoding)
    x = pd.get_dummies(x, columns=["Facing"], dtype=int)

    print("\nProcessed Features:")
    print(x.head())

    # 4. Create and Train Linear Regression Model
    model = LinearRegression()
    model.fit(x, y)

    # 5. Display Model Coefficients
    print("\nIntercept (b0):", model.intercept_)
    print("\nCoefficients:")
    for feature, coefficient in zip(x.columns, model.coef_):
        print(feature, ":", coefficient)

    # 6. Evaluate Model
    y_pred = model.predict(x)
    r2 = r2_score(y, y_pred)
    mae = mean_absolute_error(y, y_pred)
    mse = mean_squared_error(y, y_pred)
    rmse = np.sqrt(mse)

    print(f"\nR2 Score: {r2:.4f}")

    # 7. Save model using joblib
    artifacts_dir = os.path.join(base_dir, 'ml', 'artifacts')
    os.makedirs(artifacts_dir, exist_ok=True)
    
    model_path = os.path.join(artifacts_dir, 'flat_price_model.joblib')
    joblib.dump(model, model_path)
    
    # 8. Save model metadata
    coef_dict = {feat: float(coef) for feat, coef in zip(x.columns, model.coef_)}
    
    metadata = {
        "model_name": "Multiple Linear Regression (Manual Pandas Encoding)",
        "model_version": "mlr-v2",
        "features": list(x.columns),
        "training_samples": len(x),
        "testing_samples": len(x),
        "r2_score": r2,
        "mae": mae,
        "mse": mse,
        "rmse": rmse,
        "intercept": float(model.intercept_),
        "coefficients": coef_dict
    }
    
    metadata_path = os.path.join(artifacts_dir, 'model_metadata.json')
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=4)

    print("\nModel and metadata saved successfully.")
    
    # 9. Generate evaluation plots
    plots_dir = os.path.join(base_dir, 'ml', 'artifacts', 'plots')
    os.makedirs(plots_dir, exist_ok=True)
    
    plt.figure(figsize=(8, 6))
    plt.scatter(y, y_pred, alpha=0.7)
    plt.plot([y.min(), y.max()], [y.min(), y.max()], 'r--', lw=2)
    plt.xlabel('Actual Price (Lakh)')
    plt.ylabel('Predicted Price (Lakh)')
    plt.title('Actual vs Predicted Price')
    plt.tight_layout()
    plt.savefig(os.path.join(plots_dir, 'actual_vs_predicted.png'))
    plt.close()

    print("Plots saved successfully.")
    print("========================================")

if __name__ == "__main__":
    train_model()
