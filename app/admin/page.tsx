import type { Metadata } from "next";
import { AdminDashboard } from "@/src/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin",
  description: "Private portfolio content management workspace.",
  robots: { index: false, follow: false },
  openGraph: { images: [] },
  twitter: { images: [] },
};

export default function AdminPage() {
  return <AdminDashboard />;
}
