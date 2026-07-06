import "@artsdiva/styles/globals.css";
import type { AppProps } from "next/app";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useRouter } from "next/router";
import queryClient from "@artsdiva/lib/queryClient";
import theme from "@artsdiva/lib/theme";
import { AuthProvider } from "@artsdiva/contexts/AuthProvider";
import { ToastProvider } from "@artsdiva/contexts/ToastProvider";
import { SidebarLayout } from "@artsdiva/components/layout/SidebarLayout";
import { ErrorBoundary } from "@artsdiva/components/ErrorBoundary";

const NO_SIDEBAR_ROUTES = ["/login"];

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const showSidebar = !NO_SIDEBAR_ROUTES.includes(router.pathname);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <AuthProvider>
            <ToastProvider>
              {/* Keyed by route so navigating away from a crashed page
                  remounts a clean boundary instead of staying stuck on
                  the error UI. */}
              <ErrorBoundary key={router.asPath}>
                {showSidebar ? (
                  <SidebarLayout>
                    <Component {...pageProps} />
                  </SidebarLayout>
                ) : (
                  <Component {...pageProps} />
                )}
              </ErrorBoundary>
            </ToastProvider>
          </AuthProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
