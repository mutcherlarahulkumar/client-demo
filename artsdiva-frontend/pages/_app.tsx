import "@artsdiva/styles/globals.css";
import type { AppProps } from "next/app";
import Link from "next/link";
import { useRouter } from "next/router";
import { AuthProvider } from "@artsdiva/contexts/AuthProvider";
import { ToastProvider } from "@artsdiva/contexts/ToastProvider";
import { useAuth } from "@artsdiva/hooks/useAuth";
import { GlobalSearchContainer } from "@artsdiva/containers/GlobalSearchContainer";

function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();

  if (router.pathname === "/login") return null;

  const handleLogout = (): void => {
    void logout().then(() => void router.push("/login"));
  };

  return (
    <header className="flex items-center gap-4 border-b border-border px-4 py-3 text-sm">
      <Link href="/" className="font-medium">
        ArtsDiva
      </Link>

      {user && (
        <>
          <Link href="/artworks" className="text-muted hover:text-foreground">
            Artworks
          </Link>
          <Link href="/artists" className="text-muted hover:text-foreground">
            Artists
          </Link>
          <Link href="/clients" className="text-muted hover:text-foreground">
            Clients
          </Link>
          <div className="ml-auto flex items-center gap-4">
            <GlobalSearchContainer />
            <span className="text-muted">{user.name}</span>
            <button onClick={handleLogout} className="text-muted hover:text-foreground">
              Log out
            </button>
          </div>
        </>
      )}

      {!user && (
        <Link href="/login" className="ml-auto text-muted hover:text-foreground">
          Log in
        </Link>
      )}
    </header>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ToastProvider>
        <Header />
        <Component {...pageProps} />
      </ToastProvider>
    </AuthProvider>
  );
}
