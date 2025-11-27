-- PD-SmartDoc Database Schema
-- PostgreSQL initialization script

-- Create ENUM type for car parts
CREATE TYPE car_part_enum AS ENUM (
    'WHEEL_ASSEMBLY',
    'ENGINE',
    'BRAKE_SYSTEM',
    'STEERING_SYSTEM',
    'EXHAUST_SYSTEM',
    'TRANSMISSION',
    'SUSPENSION',
    'ELECTRICAL_SYSTEM',
    'COOLING_SYSTEM',
    'FUEL_SYSTEM',
    'BODY_EXTERIOR',
    'BODY_INTERIOR',
    'HVAC_SYSTEM',
    'SAFETY_SYSTEMS',
    'OTHER'
);

-- Create EDPS table (Engineering Design Practices)
CREATE TABLE IF NOT EXISTS edps (
    id VARCHAR(36) PRIMARY KEY,
    norm_number VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target TEXT,
    car_part car_part_enum, -- Part of the car this norm is responsible for
    images TEXT[], -- Array of image URLs
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create DVP table (Design Validation Plan)
CREATE TABLE IF NOT EXISTS dvp (
    id VARCHAR(36) PRIMARY KEY,
    procedure_id VARCHAR(50) NOT NULL,
    procedure_type VARCHAR(50),
    performance_objective TEXT,
    test_name VARCHAR(255) NOT NULL,
    acceptance_criteria TEXT,
    responsible VARCHAR(100),
    parameter_range VARCHAR(100),
    car_part car_part_enum, -- Part of the car this test is responsible for
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create DFMEA table (Design Failure Mode and Effects Analysis)
CREATE TABLE IF NOT EXISTS dfmea (
    id VARCHAR(36) PRIMARY KEY,
    generic_failure VARCHAR(255) NOT NULL,
    failure_mode TEXT NOT NULL,
    cause TEXT,
    car_part car_part_enum, -- Part of the car this failure analysis is responsible for
    prevention_control JSONB, -- Store as JSON object with type, edpsId, description
    detection_control JSONB,  -- Store as JSON object with type, dvpId, description
    severity INTEGER CHECK (severity >= 1 AND severity <= 10),
    occurrence INTEGER CHECK (occurrence >= 1 AND occurrence <= 10),
    detection INTEGER CHECK (detection >= 1 AND detection <= 10),
    rpn INTEGER GENERATED ALWAYS AS (
        COALESCE(severity, 0) * COALESCE(occurrence, 0) * COALESCE(detection, 0)
    ) STORED,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_edps_norm_number ON edps(norm_number);
CREATE INDEX IF NOT EXISTS idx_edps_status ON edps(status);
CREATE INDEX IF NOT EXISTS idx_edps_created_at ON edps(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_dvp_procedure_id ON dvp(procedure_id);
CREATE INDEX IF NOT EXISTS idx_dvp_status ON dvp(status);
CREATE INDEX IF NOT EXISTS idx_dvp_created_at ON dvp(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_dfmea_rpn ON dfmea(rpn DESC);
CREATE INDEX IF NOT EXISTS idx_dfmea_status ON dfmea(status);
CREATE INDEX IF NOT EXISTS idx_dfmea_created_at ON dfmea(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dfmea_severity ON dfmea(severity);
CREATE INDEX IF NOT EXISTS idx_dfmea_occurrence ON dfmea(occurrence);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to auto-update updated_at on record modification
DROP TRIGGER IF EXISTS update_edps_updated_at ON edps;
CREATE TRIGGER update_edps_updated_at 
    BEFORE UPDATE ON edps
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dvp_updated_at ON dvp;
CREATE TRIGGER update_dvp_updated_at 
    BEFORE UPDATE ON dvp
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dfmea_updated_at ON dfmea;
CREATE TRIGGER update_dfmea_updated_at 
    BEFORE UPDATE ON dfmea
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Log successful schema creation
DO $$
BEGIN
    RAISE NOTICE 'Schema created successfully for PD-SmartDoc';
END $$;

