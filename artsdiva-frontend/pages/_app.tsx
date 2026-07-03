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
              {showSidebar ? (
                <SidebarLayout>
                  <Component {...pageProps} />
                </SidebarLayout>
              ) : (
                <Component {...pageProps} />
              )}
            </ToastProvider>
          </AuthProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
