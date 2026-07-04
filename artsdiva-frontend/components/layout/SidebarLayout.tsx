import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import CircularProgress from "@mui/material/CircularProgress";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PaletteIcon from "@mui/icons-material/Palette";
import ImageIcon from "@mui/icons-material/Image";
import PeopleIcon from "@mui/icons-material/People";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "@artsdiva/hooks/useAuth";
import { GlobalSearch } from "@artsdiva/components/GlobalSearch";

const DRAWER_WIDTH = 220;

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/",         icon: <DashboardIcon /> },
  { label: "Artists",   href: "/artists",  icon: <PaletteIcon /> },
  { label: "Artworks",  href: "/artworks", icon: <ImageIcon /> },
  { label: "Clients",   href: "/clients",  icon: <PeopleIcon /> },
];

function DrawerContent({ activeHref }: { activeHref: string }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Toolbar />
      <Divider />
      <List sx={{ flex: 1, pt: 1 }}>
        {NAV_ITEMS.map((item) => {
          const active = activeHref === item.href;
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: "none", color: "inherit" }}>
              <ListItemButton
                selected={active}
                sx={{
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 1,
                  "&.Mui-selected": {
                    backgroundColor: "primary.main",
                    color: "#fff",
                    "& .MuiListItemIcon-root": { color: "#fff" },
                    "&:hover": { backgroundColor: "primary.main" },
                  },
                  "&:hover": {
                    backgroundColor: active ? "primary.main" : "action.hover",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: active ? "inherit" : "text.secondary" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: { sx: { fontSize: "0.875rem", fontWeight: active ? 600 : 400 } },
                  }}
                />
              </ListItemButton>
            </Link>
          );
        })}
      </List>
    </Box>
  );
}

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [open, setOpen] = useState(false);

  // Redirect to login when session has expired or was never established.
  useEffect(() => {
    if (!isLoading && !user) {
      void router.replace("/login");
    }
  }, [isLoading, user, router]);

  const handleLogout = () => {
    void logout().then(() => void router.push("/login"));
  };

  // While checking session or redirecting — show a blank screen, not the full layout.
  if (isLoading || !user) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  const activeHref = "/" + router.pathname.split("/")[1];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        color="default"
        elevation={0}
        sx={{ borderBottom: "1px solid", borderColor: "divider", backgroundColor: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar variant="dense" sx={{ gap: 1 }}>
          <IconButton
            edge="start"
            onClick={() => setOpen((prev) => !prev)}
            size="small"
            aria-label="toggle navigation"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            ArtsDiva
          </Typography>
          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", px: 2 }}>
            <GlobalSearch />
          </Box>
          {user && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
                {user.name}
              </Typography>
              <Tooltip title="Log out">
                <IconButton size="small" onClick={handleLogout} aria-label="logout">
                  <LogoutIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Collapsible Drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={() => setOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
        }}
      >
        <DrawerContent activeHref={activeHref} />
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: "100vh",
          backgroundColor: "background.default",
          pt: "48px",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
