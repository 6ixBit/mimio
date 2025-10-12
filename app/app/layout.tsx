import { DashboardLayout } from "@/components/dashboard-layout";
import { SubscriptionGuard } from "@/components/subscription-guard";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SubscriptionGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </SubscriptionGuard>
  );
}
