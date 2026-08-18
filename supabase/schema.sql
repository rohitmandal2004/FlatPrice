-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Predictions Table
CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Row Level Security (RLS) Policies
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_feedback ENABLE ROW LEVEL SECURITY;

-- Users can only view and manage their own predictions
CREATE POLICY "Users can insert their own predictions" ON predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own predictions" ON predictions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own predictions" ON predictions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own predictions" ON predictions FOR DELETE USING (auth.uid() = user_id);

-- Users can only view and manage their own feedback (via prediction)
CREATE POLICY "Users can manage their own feedback" ON prediction_feedback FOR ALL USING (
    EXISTS (SELECT 1 FROM predictions WHERE id = prediction_id AND user_id = auth.uid())
);
