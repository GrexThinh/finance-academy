import DashboardLayout from "@/components/layouts/dashboard-layout";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

