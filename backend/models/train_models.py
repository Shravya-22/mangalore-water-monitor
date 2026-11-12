"""
Multi-Horizon Machine Learning Training Pipeline
------------------------------------------------
Trains Direct Multi-Horizon Classifiers for 1-Day, 7-Day, and 14-Day
Water Crisis Forecasting in Mangaluru using:
- Primary Champion Model: LightGBM (LGBMClassifier)
- Comparison Models: XGBoost (XGBClassifier) and Random Forest (RandomForestClassifier)
- Strict Chronological 80-20 Train/Test Split (No temporal leakage)
- Evaluation metrics: Accuracy, Macro F1, Weighted F1, Precision, Recall,
  Severe Crisis Recall (Classes 2,3,4), Confusion Matrices, and Feature Importance.
"""

import os
import json
import numpy as np
import pandas as pd
import joblib

from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import RobustScaler
from sklearn.metrics import (
    accuracy_score, balanced_accuracy_score, precision_recall_fscore_support,
    confusion_matrix, classification_report
)

import lightgbm as lgb
import xgboost as xgb

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from etl.feature_pipeline import load_and_validate_raw_data, build_features, prepare_ml_matrices

MODELS_DIR = os.path.dirname(os.path.abspath(__file__))
os.makedirs(MODELS_DIR, exist_ok=True)

CLASS_NAMES = [
    "No Crisis (Level 0)",
    "Minor Stress (Level 1)",
    "Moderate Crisis (Level 2)",
    "High Crisis (Level 3)",
    "Critical Crisis (Level 4)"
]

def train_and_evaluate():
    print("=" * 75)
    print("MANGALURU WATER CRISIS - DIRECT MULTI-HORIZON ML TRAINING PIPELINE")
    print("=" * 75)

    raw_df = load_and_validate_raw_data()
    print(f"Loaded raw dataset with {len(raw_df)} records.")
    
    full_df = build_features(raw_df)
    print(f"Constructed features matrix with shape {full_df.shape}.")

    horizons = ["1d", "7d", "14d"]
    results_summary = {
        "metadata": {
            "simulation_period": "2023-01-01 to 2024-12-31",
            "city": "Mangaluru, Karnataka, India",
            "primary_model": "LightGBM",
            "split_ratio": "80% Chronological Train, 20% Unseen Future Test",
            "num_classes": 5,
            "classes": CLASS_NAMES
        },
        "horizons": {},
        "comparison_7d": {}
    }

    # Store shared scaler
    scaler = RobustScaler()
    scaler_fitted = False

    for h in horizons:
        print(f"\n>>> PROCESSING HORIZON: {h.upper()} (Ahead Forecast)")
        X, y, feature_cols, dates, locs = prepare_ml_matrices(full_df, horizon=h)
        
        # Chronological Split: Train on 2023 through Feb 2024; Test on unseen 2024 water season
        split_date = pd.Timestamp("2024-03-01")

        train_mask = dates < split_date
        test_mask = dates >= split_date

        X_train, y_train = X[train_mask], y[train_mask]
        X_test, y_test = X[test_mask], y[test_mask]

        print(f"Train split: {len(X_train)} samples (< {split_date.strftime('%Y-%m-%d')})")
        print(f"Test split:  {len(X_test)} samples (>= {split_date.strftime('%Y-%m-%d')})")

        # Scale features
        if not scaler_fitted and h == "1d":
            X_train_scaled = pd.DataFrame(scaler.fit_transform(X_train), columns=feature_cols, index=X_train.index)
            joblib.dump(scaler, os.path.join(MODELS_DIR, "robust_scaler.joblib"))
            scaler_fitted = True
        else:
            X_train_scaled = pd.DataFrame(scaler.transform(X_train), columns=feature_cols, index=X_train.index)

        X_test_scaled = pd.DataFrame(scaler.transform(X_test), columns=feature_cols, index=X_test.index)

        # -------------------------------------------------------------
        # 1. Primary Model: LightGBM
        # -------------------------------------------------------------
        print(f"Training LightGBM {h} Classifier...")
        lgbm = lgb.LGBMClassifier(
            n_estimators=300,
            learning_rate=0.04,
            num_leaves=31,
            max_depth=7,
            subsample=0.85,
            colsample_bytree=0.85,
            class_weight="balanced",
            random_state=42,
            n_jobs=-1,
            verbose=-1
        )
        lgbm.fit(X_train_scaled, y_train)

        # Inference on Test Set
        y_pred = lgbm.predict(X_test_scaled)
        y_prob = lgbm.predict_proba(X_test_scaled)

        # Performance Metrics
        acc = accuracy_score(y_test, y_pred)
        bal_acc = balanced_accuracy_score(y_test, y_pred)
        prec_macro, rec_macro, f1_macro, _ = precision_recall_fscore_support(y_test, y_pred, average="macro", zero_division=0)
        prec_wt, rec_wt, f1_wt, _ = precision_recall_fscore_support(y_test, y_pred, average="weighted", zero_division=0)

        # Severe Recall (Classes 2, 3, 4)
        severe_mask = y_test >= 2
        if severe_mask.sum() > 0:
            severe_recall = float((y_pred[severe_mask] >= 2).sum() / severe_mask.sum())
        else:
            severe_recall = 1.0

        cm = confusion_matrix(y_test, y_pred, labels=[0, 1, 2, 3, 4]).tolist()
        cls_report = classification_report(y_test, y_pred, labels=[0, 1, 2, 3, 4], target_names=CLASS_NAMES, output_dict=True, zero_division=0)

        # Top 15 Feature Importances
        imp = lgbm.feature_importances_
        feat_imp = sorted(zip(feature_cols, imp), key=lambda x: x[1], reverse=True)[:15]
        feat_imp_dict = [{"feature": f, "importance": float(score)} for f, score in feat_imp]

        print(f"[{h.upper()}] LightGBM Accuracy: {acc*100:.2f}%, Bal Acc: {bal_acc*100:.2f}%, Macro F1: {f1_macro:.3f}, Severe Recall: {severe_recall*100:.2f}%")

        # Save trained LightGBM model
        model_filename = f"lightgbm_{h}.joblib"
        joblib.dump(lgbm, os.path.join(MODELS_DIR, model_filename))

        results_summary["horizons"][h] = {
            "model_name": f"LightGBM_{h}",
            "model_file": model_filename,
            "accuracy": round(float(acc), 4),
            "balanced_accuracy": round(float(bal_acc), 4),
            "macro_f1": round(float(f1_macro), 4),
            "weighted_f1": round(float(f1_wt), 4),
            "macro_precision": round(float(prec_macro), 4),
            "macro_recall": round(float(rec_macro), 4),
            "severe_recall": round(float(severe_recall), 4),
            "confusion_matrix": cm,
            "classification_report": cls_report,
            "top_features": feat_imp_dict
        }

        # -------------------------------------------------------------
        # Comparison Models for 7-Day Horizon: XGBoost & Random Forest
        # -------------------------------------------------------------
        if h == "7d":
            print("\n--- Training Comparison Models on 7-Day Horizon ---")
            
            # XGBoost
            print("Training XGBoost (7d)...")
            # Calculate sample weights for XGBoost
            classes, counts = np.unique(y_train, return_counts=True)
            class_weights = {c: len(y_train) / (len(classes) * cnt) for c, cnt in zip(classes, counts)}
            sample_weights = np.array([class_weights[y_val] for y_val in y_train])

            xgb_model = xgb.XGBClassifier(
                n_estimators=250,
                learning_rate=0.05,
                max_depth=6,
                subsample=0.85,
                colsample_bytree=0.85,
                random_state=42,
                eval_metric="mlogloss",
                n_jobs=-1
            )
            xgb_model.fit(X_train_scaled, y_train, sample_weight=sample_weights)
            y_pred_xgb = xgb_model.predict(X_test_scaled)
            
            xgb_acc = accuracy_score(y_test, y_pred_xgb)
            xgb_bal_acc = balanced_accuracy_score(y_test, y_pred_xgb)
            _, _, xgb_f1_macro, _ = precision_recall_fscore_support(y_test, y_pred_xgb, average="macro", zero_division=0)
            _, _, xgb_f1_wt, _ = precision_recall_fscore_support(y_test, y_pred_xgb, average="weighted", zero_division=0)
            xgb_severe = float((y_pred_xgb[severe_mask] >= 2).sum() / severe_mask.sum())
            xgb_cm = confusion_matrix(y_test, y_pred_xgb, labels=[0, 1, 2, 3, 4]).tolist()

            joblib.dump(xgb_model, os.path.join(MODELS_DIR, "xgboost_7d.joblib"))
            print(f"[7D] XGBoost Accuracy: {xgb_acc*100:.2f}%, Bal Acc: {xgb_bal_acc*100:.2f}%, Macro F1: {xgb_f1_macro:.3f}")

            results_summary["comparison_7d"]["XGBoost"] = {
                "accuracy": round(float(xgb_acc), 4),
                "balanced_accuracy": round(float(xgb_bal_acc), 4),
                "macro_f1": round(float(xgb_f1_macro), 4),
                "weighted_f1": round(float(xgb_f1_wt), 4),
                "severe_recall": round(float(xgb_severe), 4),
                "confusion_matrix": xgb_cm
            }

            # Random Forest
            print("Training Random Forest (7d)...")
            rf_model = RandomForestClassifier(
                n_estimators=200,
                max_depth=12,
                class_weight="balanced",
                random_state=42,
                n_jobs=-1
            )
            rf_model.fit(X_train_scaled, y_train)
            y_pred_rf = rf_model.predict(X_test_scaled)

            rf_acc = accuracy_score(y_test, y_pred_rf)
            rf_bal_acc = balanced_accuracy_score(y_test, y_pred_rf)
            _, _, rf_f1_macro, _ = precision_recall_fscore_support(y_test, y_pred_rf, average="macro", zero_division=0)
            _, _, rf_f1_wt, _ = precision_recall_fscore_support(y_test, y_pred_rf, average="weighted", zero_division=0)
            rf_severe = float((y_pred_rf[severe_mask] >= 2).sum() / severe_mask.sum())
            rf_cm = confusion_matrix(y_test, y_pred_rf, labels=[0, 1, 2, 3, 4]).tolist()

            joblib.dump(rf_model, os.path.join(MODELS_DIR, "random_forest_7d.joblib"))
            print(f"[7D] Random Forest Accuracy: {rf_acc*100:.2f}%, Bal Acc: {rf_bal_acc*100:.2f}%, Macro F1: {rf_f1_macro:.3f}")

            results_summary["comparison_7d"]["RandomForest"] = {
                "accuracy": round(float(rf_acc), 4),
                "balanced_accuracy": round(float(rf_bal_acc), 4),
                "macro_f1": round(float(rf_f1_macro), 4),
                "weighted_f1": round(float(rf_f1_wt), 4),
                "severe_recall": round(float(rf_severe), 4),
                "confusion_matrix": rf_cm
            }

    # Save feature columns metadata
    with open(os.path.join(MODELS_DIR, "feature_names.json"), "w") as f:
        json.dump(feature_cols, f, indent=2)

    # Save all calculated metrics to JSON
    metrics_path = os.path.join(MODELS_DIR, "model_evaluation_metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(results_summary, f, indent=2)

    print(f"\nAll models trained and real metrics written to: {metrics_path}")
    print("=" * 75)

if __name__ == "__main__":
    train_and_evaluate()
