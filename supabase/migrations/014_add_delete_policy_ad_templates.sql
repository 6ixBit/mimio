-- Add missing DELETE policy for ad_templates
-- Users should be able to delete their own custom templates

-- Users can delete their own created templates (custom templates only)
DROP POLICY IF EXISTS "Users can delete their own custom templates" ON ad_templates;
CREATE POLICY "Users can delete their own custom templates"
  ON ad_templates FOR DELETE
  USING (auth.uid() = created_by AND is_public = FALSE);

-- Also add UPDATE policy in case we need it later
DROP POLICY IF EXISTS "Users can update their own custom templates" ON ad_templates;
CREATE POLICY "Users can update their own custom templates"
  ON ad_templates FOR UPDATE
  USING (auth.uid() = created_by AND is_public = FALSE)
  WITH CHECK (auth.uid() = created_by AND is_public = FALSE);
