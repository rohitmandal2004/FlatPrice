import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
import joblib
import os
import json
import matplotlib.pyplot as plt
import seaborn as sns

# Set reproducible state
RANDOM_STATE = 42

def train_model():
    print("========================================")
    print("FLAT PRICE ML MODEL")
    print("========================================")

    # 1. Load Excel dataset
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(base_dir, 'data', 'Flat_Price_Multiple_Linear_Regression_100.xlsx')
    
    if not os.path.exists(data_path):
        print(f"Dataset not found at {data_path}")
        return

    df = pd.read_excel(data_path)
    
    # 2. Validate columns
    required_cols = ['Flat_ID', 'Area_Sqft', 'Facing', 'Floor', 'Car_Parking_Sqft', 'Bedrooms', 'Price_Lakh']
    for col in required_cols:
        if col not in df.columns:
            print(f"Missing required column: {col}")
            return
            
    # 3. Clean data
    # Drop duplicates
    df = df.drop_duplicates()
    
    # Handle missing values (for simplicity, we'll drop rows with missing target or crucial features)
    df = df.dropna(subset=['Area_Sqft', 'Facing', 'Floor', 'Car_Parking_Sqft', 'Bedrooms', 'Price_Lakh'])
    
    print(f"\nDataset: {len(df)} records\n")
    print("Model: Multiple Linear Regression\n")

    # 4. Split features and target
    X = df[['Area_Sqft', 'Facing', 'Floor', 'Car_Parking_Sqft', 'Bedrooms']]
    y = df['Price_Lakh']

    # 5. Encode categorical columns & Create Pipeline
    # Facing is categorical
    categorical_features = ['Facing']
    numeric_features = ['Area_Sqft', 'Floor', 'Car_Parking_Sqft', 'Bedrooms']

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', 'passthrough', numeric_features),
            ('cat', OneHotEncoder(drop='first', sparse_output=False), categorical_features)
        ])

    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('model', LinearRegression())
    ])

    # 6. Train/Test Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=RANDOM_STATE)

    # 7. Train Multiple Linear Regression
    pipeline.fit(X_train, y_train)

    # 8. Evaluate model
    y_train_pred = pipeline.predict(X_train)
    y_test_pred = pipeline.predict(X_test)

    train_r2 = r2_score(y_train, y_train_pred)
    test_r2 = r2_score(y_test, y_test_pred)
    mae = mean_absolute_error(y_test, y_test_pred)
    mse = mean_squared_error(y_test, y_test_pred)
    rmse = np.sqrt(mse)

    print(f"Training R² Score: {train_r2:.4f}")
    print(f"Testing R² Score: {test_r2:.4f}")
    print(f"MAE: {mae:.4f}")
    print(f"MSE: {mse:.4f}")
    print(f"RMSE: {rmse:.4f}")

    # Extract coefficients
    model = pipeline.named_steps['model']
    encoder = pipeline.named_steps['preprocessor'].named_transformers_['cat']
    
    cat_features_encoded = encoder.get_feature_names_out(categorical_features)
    all_features = numeric_features + list(cat_features_encoded)
    
    coefficients = model.coef_
    intercept = model.intercept_
    
    coef_dict = {feat: float(coef) for feat, coef in zip(all_features, coefficients)}

    # 9. Save model using joblib
    artifacts_dir = os.path.join(base_dir, 'ml', 'artifacts')
    os.makedirs(artifacts_dir, exist_ok=True)
    
    model_path = os.path.join(artifacts_dir, 'flat_price_model.joblib')
    joblib.dump(pipeline, model_path)
    
    # 10. Save model metadata
    metadata = {
        "model_name": "Multiple Linear Regression",
        "model_version": "mlr-v1",
        "features": all_features,
        "training_samples": len(X_train),
        "testing_samples": len(X_test),
        "r2_score": test_r2,
        "mae": mae,
        "mse": mse,
        "rmse": rmse,
        "intercept": float(intercept),
        "coefficients": coef_dict
    }
    
    metadata_path = os.path.join(artifacts_dir, 'model_metadata.json')
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=4)

    print("\nModel and metadata saved successfully.")
    
    # 11. Generate evaluation plots
    plots_dir = os.path.join(base_dir, 'ml', 'artifacts', 'plots')
    os.makedirs(plots_dir, exist_ok=True)
    
    # Actual vs Predicted
    plt.figure(figsize=(8, 6))
    plt.scatter(y_test, y_test_pred, alpha=0.7)
    plt.plot([y.min(), y.max()], [y.min(), y.max()], 'r--', lw=2)
    plt.xlabel('Actual Price (Lakh)')
    plt.ylabel('Predicted Price (Lakh)')
    plt.title('Actual vs Predicted Price')
    plt.tight_layout()
    plt.savefig(os.path.join(plots_dir, 'actual_vs_predicted.png'))
    plt.close()

    # Residual Plot
    residuals = y_test - y_test_pred
    plt.figure(figsize=(8, 6))
    plt.scatter(y_test_pred, residuals, alpha=0.7)
    plt.axhline(0, color='r', linestyle='--', lw=2)
    plt.xlabel('Predicted Price (Lakh)')
    plt.ylabel('Residuals')
    plt.title('Residual Plot')
    plt.tight_layout()
    plt.savefig(os.path.join(plots_dir, 'residuals.png'))
    plt.close()
    
    print("Plots saved successfully.")
    print("========================================")

if __name__ == "__main__":
    train_model()
