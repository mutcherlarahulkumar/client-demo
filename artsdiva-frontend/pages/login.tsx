import { useEffect } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useAuth } from "@artsdiva/hooks/useAuth";
import { LoginContainer } from "@artsdiva/containers/LoginContainer";

const LoginPage: NextPage = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      void router.replace("/");
    }
  }, [isLoading, user, router]);

  if (isLoading || user) return null;

  return <LoginContainer />;
};

export default LoginPage;
