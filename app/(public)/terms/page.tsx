import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function TermsOfServicePage() {
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
          <h1 className="text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                By accessing and using Mimio ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Description of Service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Mimio is an AI-powered video generation platform that allows users to:
              </p>
              <ul className="space-y-2 text-muted-foreground ml-4">
                <li>• Generate videos using AI technology (OpenAI Sora)</li>
                <li>• Create and manage video projects with brand context</li>
                <li>• Analyze existing videos to create similar content</li>
                <li>• Organize videos using templates and categories</li>
                <li>• Connect social media accounts for content distribution</li>
                <li>• Schedule and post videos to social platforms</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. User Accounts and Registration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Account Creation</h3>
                <p className="text-muted-foreground">
                  You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Account Security</h3>
                <p className="text-muted-foreground">
                  You are responsible for all activities that occur under your account. Notify us immediately of any unauthorized use of your account.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Age Requirements</h3>
                <p className="text-muted-foreground">
                  You must be at least 13 years old to use this service. Users under 18 must have parental consent.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Acceptable Use Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Permitted Uses</h3>
                <p className="text-muted-foreground">
                  You may use the Service to create original video content for personal, educational, or commercial purposes, subject to the restrictions below.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Prohibited Content</h3>
                <p className="text-muted-foreground mb-2">You may not use the Service to create content that:</p>
                <ul className="space-y-1 text-muted-foreground ml-4">
                  <li>• Violates any applicable laws or regulations</li>
                  <li>• Infringes on intellectual property rights</li>
                  <li>• Contains harmful, abusive, or offensive material</li>
                  <li>• Promotes violence, discrimination, or illegal activities</li>
                  <li>• Contains explicit sexual content or nudity</li>
                  <li>• Impersonates individuals or organizations</li>
                  <li>• Spreads misinformation or false information</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Technical Restrictions</h3>
                <p className="text-muted-foreground">
                  You may not attempt to reverse engineer, hack, or interfere with the Service's functionality. Automated usage beyond reasonable limits is prohibited.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Intellectual Property Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Your Content</h3>
                <p className="text-muted-foreground">
                  You retain ownership of all content you create using the Service, including videos, prompts, and project information. You grant us a limited license to process and store your content to provide the Service.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Our Service</h3>
                <p className="text-muted-foreground">
                  The Mimio platform, including its design, functionality, and underlying technology, is owned by us and protected by intellectual property laws.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Third-Party Content</h3>
                <p className="text-muted-foreground">
                  You are responsible for ensuring you have the right to use any reference materials, images, or content you upload to the Service.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. AI Technology and Limitations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">OpenAI Sora Integration</h3>
                <p className="text-muted-foreground">
                  Our Service uses OpenAI's Sora technology for video generation. We are not responsible for the quality, accuracy, or appropriateness of AI-generated content.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Content Moderation</h3>
                <p className="text-muted-foreground">
                  All content is subject to OpenAI's content policies and moderation systems. Content that violates these policies may be rejected or removed.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">No Guarantees</h3>
                <p className="text-muted-foreground">
                  We do not guarantee that generated videos will meet your expectations or be suitable for your intended use. AI-generated content may contain errors or unexpected results.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Payment and Subscription Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Free Tier</h3>
                <p className="text-muted-foreground">
                  We offer a free tier with limited features and usage. Free tier users are subject to usage limits and may experience slower processing times.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Paid Subscriptions</h3>
                <p className="text-muted-foreground">
                  Paid subscriptions provide additional features, higher usage limits, and priority processing. Subscription fees are billed in advance and are non-refundable except as required by law.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Usage Limits</h3>
                <p className="text-muted-foreground">
                  All users are subject to fair usage policies. Excessive usage may result in temporary restrictions or account suspension.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Privacy and Data Protection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Service Availability and Modifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Service Availability</h3>
                <p className="text-muted-foreground">
                  We strive to maintain high service availability but do not guarantee uninterrupted access. The Service may be temporarily unavailable for maintenance or updates.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Service Modifications</h3>
                <p className="text-muted-foreground">
                  We reserve the right to modify, suspend, or discontinue the Service at any time. We will provide reasonable notice of significant changes when possible.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To the maximum extent permitted by law, Mimio shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or business opportunities, arising from your use of the Service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Indemnification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                You agree to indemnify and hold harmless Mimio from any claims, damages, or expenses arising from your use of the Service, violation of these Terms, or infringement of any third-party rights.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Termination by You</h3>
                <p className="text-muted-foreground">
                  You may terminate your account at any time by contacting us or using the account deletion feature in your settings.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Termination by Us</h3>
                <p className="text-muted-foreground">
                  We may suspend or terminate your account if you violate these Terms, engage in prohibited activities, or for other reasons at our discretion.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Effect of Termination</h3>
                <p className="text-muted-foreground">
                  Upon termination, your access to the Service will cease, and your data may be deleted according to our data retention policies.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>13. Governing Law and Disputes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                These Terms are governed by the laws of [Your Jurisdiction]. Any disputes arising from these Terms or your use of the Service will be resolved through binding arbitration or in the courts of [Your Jurisdiction].
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>14. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We may update these Terms from time to time. We will notify you of material changes by email or through the Service. Your continued use of the Service after changes become effective constitutes acceptance of the updated Terms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>15. Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="font-medium">Mimio Support</p>
                <p className="text-muted-foreground">Email: legal@mimio.app</p>
                <p className="text-muted-foreground">Response time: Within 48 hours</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
