-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Predictions Table
CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL, -- Changed to TEXT to support Clerk string IDs like 'user_...'
    area_sqft NUMERIC NOT NULL,
    facing TEXT NOT NULL,
    floor INTEGER NOT NULL,
    car_parking_sqft NUMERIC NOT NULL,
    bedrooms INTEGER NOT NULL,
    predicted_price_lakh NUMERIC NOT NULL,
    model_version TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Model Metrics Table
CREATE TABLE IF NOT EXISTS model_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_name TEXT NOT NULL,
    training_samples INTEGER,
    testing_samples INTEGER,
    r2_score NUMERIC,
    mae NUMERIC,
    mse NUMERIC,
    rmse NUMERIC,
    model_version TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prediction Feedback Table
CREATE TABLE IF NOT EXISTS prediction_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prediction_id UUID REFERENCES predictions(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for now since we are using Clerk for auth, not Supabase Auth
-- (Proper RLS with Clerk requires setting up custom JWT templates in Clerk)
ALTER TABLE predictions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_feedback DISABLE ROW LEVEL SECURITY;
