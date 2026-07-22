import type { Metadata } from "next";
import { AdminForgotPasswordForm } from "@/features/auth/components/AdminForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset Admin Password",
  description: "Reset your EviMersin admin password using OTP",
};

export default function ForgotPasswordPage() {
  return <AdminForgotPasswordForm />;
}
