import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@artsdiva/hooks/useAuth";
import { LoginForm } from "@artsdiva/components/LoginForm";

export function LoginContainer() {
  const router = useRouter();
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (): void => {
    void login({ email, password }).then((success) => {
      if (success) {
        void router.push("/");
      }
    });
  };

  return (
    <LoginForm
      email={email}
      password={password}
      isLoading={isLoading}
      error={error}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
    />
  );
}
