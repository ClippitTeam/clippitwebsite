-- Script to clean all demo data from Clippit Projects tables
-- Run this in Supabase SQL Editor to remove all test/demo data

-- Delete all project milestones
DELETE FROM clippit_project_milestones;

-- Delete all project inquiries
DELETE FROM clippit_project_inquiries;

-- Delete all project offers
DELETE FROM clippit_project_offers;

-- Delete all clippit projects
DELETE FROM clippit_projects;

-- Reset sequences if needed (optional)
-- This ensures new projects start with clean IDs

-- Verify cleanup
SELECT 'Clippit Projects' as table_name, COUNT(*) as remaining_rows FROM clippit_projects
UNION ALL
SELECT 'Project Offers' as table_name, COUNT(*) as remaining_rows FROM clippit_project_offers
UNION ALL
SELECT 'Project Inquiries' as table_name, COUNT(*) as remaining_rows FROM clippit_project_inquiries
UNION ALL
SELECT 'Project Milestones' as table_name, COUNT(*) as remaining_rows FROM clippit_project_milestones;
