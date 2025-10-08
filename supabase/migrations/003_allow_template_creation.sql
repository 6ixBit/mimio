-- Migration: Allow authenticated users to create ad templates
-- This allows users to add their own viral ad templates from the UI

-- Add INSERT policy for ad_templates
DROP POLICY IF EXISTS "Authenticated users can create templates" ON ad_templates;
CREATE POLICY "Authenticated users can create templates"
    ON ad_templates FOR INSERT
    TO authenticated
    WITH CHECK (TRUE);

-- Add UPDATE policy for ad_templates (optional - in case you want users to edit their templates later)
-- Uncomment if needed:
-- DROP POLICY IF EXISTS "Authenticated users can update templates" ON ad_templates;
-- CREATE POLICY "Authenticated users can update templates"
--     ON ad_templates FOR UPDATE
--     TO authenticated
--     USING (TRUE)
--     WITH CHECK (TRUE);

