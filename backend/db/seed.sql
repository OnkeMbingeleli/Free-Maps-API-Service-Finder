-- SEED DATA FOR SERVICE FINDER
-- Public Services and Private Emergency Services

-- Public Libraries
INSERT INTO services (name, type, lat, lng, address, verified, status, is_public)
VALUES
('Cape Town Central Library', 'library', -33.9248, 18.4241, 'Old Drill Hall, Cnr Parade & Darling St', true, 'approved', true),
('Bellville Library', 'library', -33.8943, 18.6301, 'Charl Malan St, Bellville', true, 'approved', true);

-- Public Police Stations
INSERT INTO services (name, type, lat, lng, address, verified, status, is_public)
VALUES
('Cape Town Central Police Station', 'police', -33.9264, 18.4230, 'Buitenkant St, Cape Town', true, 'approved', true),
('Sea Point Police Station', 'police', -33.9168, 18.3900, 'Main Rd, Sea Point', true, 'approved', true);

-- Public Hospitals / Clinics
INSERT INTO services (name, type, lat, lng, address, verified, status, is_public)
VALUES
('Groote Schuur Hospital', 'hospital', -33.9381, 18.4636, 'Main Rd, Observatory', true, 'approved', true),
('Somerset Hospital', 'hospital', -33.9054, 18.4121, 'Beach Rd, Green Point', true, 'approved', true);

-- Private Emergency Services (Hospitals/Response)
INSERT INTO services (name, type, lat, lng, address, verified, status, is_public)
VALUES
('Netcare Christiaan Barnard Memorial Hospital', 'hospital', -33.9202, 18.4276, 'DF Malan St, Foreshore', true, 'approved', false),
('Mediclinic Cape Town', 'hospital', -33.9338, 18.4068, '21 Hof St, Gardens', true, 'approved', false),
('ER24 Western Cape', 'hospital', -33.9450, 18.4700, 'Regional Office', true, 'approved', false);

-- Shelters
INSERT INTO services (name, type, lat, lng, address, verified, status, is_public)
VALUES
('The Haven Night Shelter', 'shelter', -33.9185, 18.4192, '2 Selkirk St, District Six', true, 'approved', true);

-- Fire Stations
INSERT INTO services (name, type, lat, lng, address, verified, status, is_public)
VALUES
('Roeland Street Fire Station', 'fire_station', -33.9304, 18.4258, 'Roeland St, Cape Town', true, 'approved', true);
