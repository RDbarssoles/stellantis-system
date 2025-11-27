-- PD-SmartDoc Sample Data
-- Optional seed data for testing

-- Sample EDPS (Engineering Design Practices) records
INSERT INTO edps (id, norm_number, title, description, target, status, created_at, updated_at) VALUES
('edps-sample-001', '10101', 'Tire Change Procedure', 
 'Step-by-step safe tire changing process. Includes proper jack placement, lug nut sequence, and torque specifications.',
 'Change tire safely and efficiently', 'active', NOW(), NOW()),
 
('edps-sample-002', '10102', 'Engine Oil Change Standard',
 'Standard procedure for engine oil and filter replacement. Includes oil grade specifications and disposal requirements.',
 'Maintain engine lubrication system', 'active', NOW(), NOW()),
 
('edps-sample-003', '10103', 'Brake Inspection Protocol',
 'Comprehensive brake system inspection checklist. Covers pads, rotors, fluid levels, and hydraulic components.',
 'Ensure brake system safety', 'active', NOW(), NOW());

-- Sample DVP (Design Validation Plan) records
INSERT INTO dvp (id, procedure_id, procedure_type, performance_objective, test_name, 
                 acceptance_criteria, responsible, parameter_range, status, created_at, updated_at) VALUES
('dvp-sample-001', '7.27', 'FUNCIONAL', 
 'Validate tire removal force requirements',
 'Tire Extraction Load Test',
 'Extraction force between 50N and 100N', 'Test Engineer', '0-150N', 'active', NOW(), NOW()),
 
('dvp-sample-002', '7.28', 'DURABILIDADE',
 'Validate brake pad lifespan under normal conditions',
 'Brake Pad Wear Test',
 'Minimum 50,000km lifespan with <3mm wear', 'Quality Engineer', '0-100,000km', 'active', NOW(), NOW()),
 
('dvp-sample-003', '7.29', 'AMBIENTAL',
 'Validate oil seal performance under temperature extremes',
 'Temperature Cycle Test',
 'No leakage between -40°C and 120°C', 'Thermal Engineer', '-40 to 150°C', 'active', NOW(), NOW());

-- Sample DFMEA (Design Failure Mode and Effects Analysis) records
INSERT INTO dfmea (id, generic_failure, failure_mode, cause, 
                   prevention_control, detection_control,
                   severity, occurrence, detection, status, created_at, updated_at) VALUES
('dfmea-sample-001', 'Tire System', 'Difficult tire change', 'Damaged screw thread',
 '{"type": "EDPS", "edpsId": "edps-sample-001", "description": "Follow proper torque procedure"}'::jsonb,
 '{"type": "DVP", "dvpId": "dvp-sample-001", "description": "Verify extraction force"}'::jsonb,
 7, 5, 3, 'active', NOW(), NOW()),

('dfmea-sample-002', 'Brake System', 'Premature brake wear', 'Incorrect pad material selection',
 '{"type": "EDPS", "edpsId": "edps-sample-003", "description": "Inspect brake components regularly"}'::jsonb,
 '{"type": "DVP", "dvpId": "dvp-sample-002", "description": "Durability testing"}'::jsonb,
 9, 4, 2, 'active', NOW(), NOW()),

('dfmea-sample-003', 'Lubrication System', 'Oil leakage', 'Seal degradation at high temperature',
 '{"type": "EDPS", "edpsId": "edps-sample-002", "description": "Use correct oil grade"}'::jsonb,
 '{"type": "DVP", "dvpId": "dvp-sample-003", "description": "Temperature cycle validation"}'::jsonb,
 8, 3, 4, 'active', NOW(), NOW());

-- Log successful seed data insertion
DO $$
DECLARE
    edps_count INTEGER;
    dvp_count INTEGER;
    dfmea_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO edps_count FROM edps;
    SELECT COUNT(*) INTO dvp_count FROM dvp;
    SELECT COUNT(*) INTO dfmea_count FROM dfmea;
    
    RAISE NOTICE 'Sample data inserted successfully:';
    RAISE NOTICE '  - EDPS records: %', edps_count;
    RAISE NOTICE '  - DVP records: %', dvp_count;
    RAISE NOTICE '  - DFMEA records: %', dfmea_count;
END $$;

