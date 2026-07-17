import type { Metadata } from "next";
import { AdminLoginForm } from "@/features/auth/components/AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Sign in to the EviMersin admin dashboard",
};

export default function LoginPage() {
  return <AdminLoginForm />;
}
