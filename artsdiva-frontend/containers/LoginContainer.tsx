import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@artsdiva/hooks/useAuth";
import { useToast } from "@artsdiva/contexts/ToastProvider";
import { LoginForm } from "@artsdiva/components/LoginForm";

export function LoginContainer() {
  const router = useRouter();
  const { login, isLoading, error, fieldErrors } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (): void => {
    void login({ email, password }).then((success) => {
      if (success) {
        showToast("Signed in");
        // Only ever redirect to a relative in-app path â€” never trust
        // ?next= as-is, or an absolute/protocol-relative URL could be
        // used for an open-redirect.
        const rawNext = router.query.next;
        const next = typeof rawNext === "string" && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";
        void router.push(next);
      }
    });
  };

  return (
    <LoginForm
      email={email}
      password={password}
      isLoading={isLoading}
      error={error}
      fieldErrors={fieldErrors}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
    />
  );
}

