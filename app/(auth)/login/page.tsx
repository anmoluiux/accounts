import LoginForm from "@/src/components/auth/LoginForm";

/**
 * /login — the form only. Everything around it (the split, the showcase panel,
 * the footer) comes from `app/(auth)/layout.tsx`.
 */
export default function LoginPage() {
  return <LoginForm />;
}
