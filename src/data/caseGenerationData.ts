
export const domains = [
    'FinTech', 'HealthTech', 'E-commerce', 'EdTech', 'AgroTech',
    'Logistics & Supply Chain', 'Social Media', 'Streaming & Media',
    'IoT & Smart City', 'Gamedev', 'Cybersecurity', 'GovTech',
    'Travel & Hospitality', 'Real Estate (PropTech)', 'HR Tech',
    'LegalTech', 'Automotive', 'Aerospace', 'Energy & Utilities',
    'Non-profit & Charity'
];

export const subDomains: Record<string, string[]> = {
    'FinTech': ['Crypto Exchange', 'Neo-Bank Core', 'High-Frequency Trading', 'Insurance (InsurTech)', 'Payment Gateway', 'Crowdfunding Platform', 'Personal Finance Manager'],
    'HealthTech': ['Telemedicine', 'EHR System', 'Medical Device IoT', 'Pharmacy Marketplace', 'AI Diagnostics', 'Clinical Trials Management'],
    'E-commerce': ['B2B Marketplace', 'Visual Search Engine', 'Subscription Box Service', 'C2C Auction Platform', 'Grocery Delivery', 'Dropshipping Integrator'],
    'EdTech': ['LMS Platform', 'Interactive Classroom', 'Language Learning App', 'Skill Assessment Engine', 'Virtual Labs'],
    'AgroTech': ['Precision Farming IoT', 'Drone Fleet Management', 'Supply Chain Traceability', 'Livestock Monitoring'],
    'Logistics & Supply Chain': ['Last-Mile Delivery', 'Freight Forwarding', 'Warehouse Automation', 'Fleet Telematics', 'Cold Chain Monitoring'],
    'Social Media': ['Niche Professional Network', 'Short Video Platform', 'Audio Chat Rooms', 'Anonymous Social Network', 'Dating App'],
    'Streaming & Media': ['VOD Platform', 'Live Streaming Service', 'Podcast Hosting', 'Music Streaming', 'Digital Rights Management'],
    'IoT & Smart City': ['Traffic Control System', 'Smart Grid/Energy', 'Waste Management', 'Home Automation Hub', 'Industrial IoT (IIoT)'],
    'Gamedev': ['MMORPG Backend', 'Mobile Game Matchmaking', 'Cloud Gaming Service', 'eSports Tournament Platform', 'Anti-cheat System'],
    'Cybersecurity': ['SIEM System', 'Identity Provider (IdP)', 'Penetration Testing Platform', 'Encrypted Messenger', 'Threat Intelligence Feed'],
    'GovTech': ['Digital Voting System', 'Tax Filing Portal', 'Public Services Registry', 'Emergency Response System', 'Open Data Portal'],
    'Travel & Hospitality': ['Flight Booking Engine', 'Hotel PMS', 'Travel Itinerary Planner', 'Ride-Sharing Service'],
    'Real Estate (PropTech)': ['Virtual Tour Platform', 'Property Management System', 'Real Estate Investment Trust (REIT) App'],
    'HR Tech': ['ATS (Applicant Tracking)', 'Employee Engagement Platform', 'Payroll System', 'Remote Work Monitoring'],
    'LegalTech': ['Contract Lifecycle Management', 'Legal Case Research AI', 'Notary Service'],
    'Automotive': ['Autonomous Vehicle Fleet', 'EV Charging Network', 'Car Sharing Platform', 'Vehicle Diagnostics'],
    'Aerospace': ['Satellite Communication', 'Flight Control System', 'Space Debris Tracking', 'Launch Telemetry'],
    'Energy & Utilities': ['Solar Plant Management', 'Water Distribution Grid', 'Predictive Maintenance'],
    'Non-profit & Charity': ['Donation Platform', 'Volunteer Management', 'Disaster Relief Coordination']
};

export const technicalConstraints = [
    'Legacy Mainframe Integration', 'Strict Data Residency (GDPR/Local Laws)',
    'Low Latency (<50ms)', 'Offline-first Architecture', 'High Throughput (>100k TPS)',
    'Air-gapped Environment', 'Limited Budget (Cost Optimization)', 'Zero Downtime Deployment',
    'Multi-Cloud Requirement', 'Vendor-agnostic (Open Source only)', 'Serverless only',
    'Edge Computing mandated', 'Pardoning Network (Unreliable connections)', 'Real-time Consistency',
    'Green Computing (Low Carbon Footprint)', 'Mobile-only client', 'GraphQL API only',
    'NoSQL Databases only', 'Blockchain integration required', 'Existing Monolith migration'
];

export const businessTwists = [
    'Unexpected Viral Growth (100x traffic overnight)', 'Competitor aggressively cloning features',
    'Major Security Breach just happened', 'Acquisition by a larger conglomerate',
    'Pivot to a new business model', 'Regulatory audit in 1 week',
    'Key senior engineers left the team', 'Budget cut by 50%',
    'Partnership with a massive legacy enterprise', 'Expansion to 5 new regions simultaneously',
    'DDOS attacks are frequent', 'Data corruption incident recovery',
    'CEO requires "AI" in every feature', 'Monetization strategy shift to Microtransactions',
    'Need to support 10 million concurrent users for an event'
];
