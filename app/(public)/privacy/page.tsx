import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link 
              href="/" 
              className="text-primary hover:text-primary/80 transition-colors"
            >
              ← Back to Mimio
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Account Information</h3>
                <p className="text-muted-foreground">
                  When you create an account, we collect your email address and any profile information you choose to provide.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Video Content</h3>
                <p className="text-muted-foreground">
                  We store your video generation prompts, project information, and generated video metadata. Your actual video files are stored securely in our cloud storage.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Social Media Integration</h3>
                <p className="text-muted-foreground">
                  If you connect your social media accounts (Instagram, TikTok), we store connection tokens and basic profile information to enable video posting features.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Usage Analytics</h3>
                <p className="text-muted-foreground">
                  We collect anonymous usage data to improve our service, including video generation patterns, feature usage, and performance metrics.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-muted-foreground">
                <li>• Generate AI-powered videos based on your prompts and project settings</li>
                <li>• Provide personalized recommendations and project organization</li>
                <li>• Enable social media posting and scheduling features</li>
                <li>• Improve our AI models and video generation quality</li>
                <li>• Provide customer support and respond to your inquiries</li>
                <li>• Send important service updates and notifications</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Data Storage and Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Secure Storage</h3>
                <p className="text-muted-foreground">
                  All data is encrypted in transit and at rest using industry-standard encryption protocols. We use Supabase for secure database storage and cloud storage for video files.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Access Controls</h3>
                <p className="text-muted-foreground">
                  Your data is protected by row-level security policies. Only you can access your projects, videos, and personal information.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Data Retention</h3>
                <p className="text-muted-foreground">
                  We retain your data for as long as your account is active. You can delete your account and all associated data at any time.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. AI and Video Generation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">OpenAI Sora Integration</h3>
                <p className="text-muted-foreground">
                  We use OpenAI's Sora API for video generation. Your prompts and reference materials are sent to OpenAI for processing. OpenAI's privacy policy applies to this data processing.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Content Analysis</h3>
                <p className="text-muted-foreground">
                  For our "Mimic Video" feature, we analyze uploaded videos to generate prompts. This analysis is performed locally and via OpenAI's vision API. Original videos are not stored permanently.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Generated Content</h3>
                <p className="text-muted-foreground">
                  Videos generated using our service are your property. We do not claim ownership of your generated content.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Service Providers</h3>
                <p className="text-muted-foreground">
                  We use trusted third-party services including Supabase (database), OpenAI (AI processing), and social media APIs. These services have their own privacy policies.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Social Media Platforms</h3>
                <p className="text-muted-foreground">
                  When you connect social media accounts, you authorize us to post content on your behalf. We only access the permissions you explicitly grant.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Your Rights and Choices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-muted-foreground">
                <li>• <strong>Access:</strong> View and download your data at any time</li>
                <li>• <strong>Correction:</strong> Update your account information and project details</li>
                <li>• <strong>Deletion:</strong> Delete your account and all associated data</li>
                <li>• <strong>Portability:</strong> Export your projects and video metadata</li>
                <li>• <strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li>• <strong>Disconnect:</strong> Remove social media account connections</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by email or through our service. Your continued use of the service after changes become effective constitutes acceptance of the updated policy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="font-medium">Mimio Support</p>
                <p className="text-muted-foreground">Email: privacy@mimio.app</p>
                <p className="text-muted-foreground">Response time: Within 48 hours</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
