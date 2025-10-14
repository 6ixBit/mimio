-- Ensure RLS and policies for ad_templates support public and custom views

-- Enable RLS
ALTER TABLE ad_templates ENABLE ROW LEVEL SECURITY;

-- Public templates are viewable by all (active + is_public)
DROP POLICY IF EXISTS "Public templates are viewable by all" ON ad_templates;
CREATE POLICY "Public templates are viewable by all"
  ON ad_templates FOR SELECT
  USING (is_active = TRUE AND is_public = TRUE);

-- Users can view their own created templates
DROP POLICY IF EXISTS "Users can view their own created templates" ON ad_templates;
CREATE POLICY "Users can view their own created templates"
  ON ad_templates FOR SELECT
  USING (auth.uid() = created_by);

-- Users can create their own templates
DROP POLICY IF EXISTS "Users can create their own templates" ON ad_templates;
CREATE POLICY "Users can create their own templates"
  ON ad_templates FOR INSERT
  WITH CHECK (auth.uid() = created_by);


