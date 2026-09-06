import { OAuthGate } from "@/components/auth/OAuthGate";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Z-AI | Operator Authentication",
  description: "Secure Access Terminal & Multi-Provider Authentication Protocol",
};

export default function AuthPage() {
  return <OAuthGate />;
}
