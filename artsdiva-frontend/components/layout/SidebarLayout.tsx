import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/DashboardOutlined";
import PaletteIcon from "@mui/icons-material/PaletteOutlined";
import ImageIcon from "@mui/icons-material/ImageOutlined";
import PeopleIcon from "@mui/icons-material/PeopleOutlined";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import LockResetIcon from "@mui/icons-material/LockResetOutlined";
import BrushIcon from "@mui/icons-material/Brush";
import { useAuth } from "@artsdiva/hooks/useAuth";
import { GlobalSearch } from "@artsdiva/components/GlobalSearch";
import type { Role } from "@artsdiva/types/auth.types";

const DRAWER_WIDTH = 240;

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/",         icon: <DashboardIcon fontSize="small" /> },
  { label: "Artists",   href: "/artists",  icon: <PaletteIcon fontSize="small" /> },
  { label: "Artworks",  href: "/artworks", icon: <ImageIcon fontSize="small" /> },
  { label: "Clients",   href: "/clients",  icon: <PeopleIcon fontSize="small" /> },
];

const ADMIN_NAV_ITEM: NavItem = { label: "Users", href: "/users", icon: <AdminPanelSettingsIcon fontSize="small" /> };

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

interface DrawerContentProps {
  activeHref: string;
  userName?: string;
  userRole?: Role;
  onLogout: () => void;
}

function DrawerContent({ activeHref, userName, userRole, onLogout }: DrawerContentProps) {
  const navItems = userRole === "ADMIN" ? [...NAV_ITEMS, ADMIN_NAV_ITEM] : NAV_ITEMS;
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Brand */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, px: 2.5, py: 2.25 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "primary.main",
            color: "#fff",
          }}
        >
          <BrushIcon sx={{ fontSize: 18 }} />
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: "-0.01em" }}>
          ArtsDiva
        </Typography>
      </Box>
      <Divider />

      {/* Navigation */}
      <List sx={{ flex: 1, px: 1.5, pt: 1.5 }}>
        {navItems.map((item) => {
          const active = activeHref === item.href;
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: "none", color: "inherit" }}>
              <ListItemButton
                selected={active}
                sx={{
                  mb: 0.5,
                  borderRadius: 2,
                  py: 1,
                  "&.Mui-selected": {
                    backgroundColor: "rgba(25, 118, 210, 0.08)",
                    color: "primary.main",
                    "& .MuiListItemIcon-root": { color: "primary.main" },
                    "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.12)" },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 34, color: active ? "primary.main" : "text.secondary" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: { sx: { fontSize: "0.875rem", fontWeight: active ? 600 : 500 } },
                  }}
                />
              </ListItemButton>
            </Link>
          );
        })}
      </List>

      {/* User footer */}
      {userName && (
        <>
          <Divider />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, px: 2, py: 1.75 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                fontSize: "0.75rem",
                fontWeight: 700,
                bgcolor: "rgba(25, 118, 210, 0.12)",
                color: "primary.main",
              }}
            >
              {initials(userName)}
            </Avatar>
            <Typography
              variant="body2"
              sx={{ flex: 1, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              {userName}
            </Typography>
            <Tooltip title="Change password">
              <IconButton size="small" component={Link} href="/settings/change-password" aria-label="change password">
                <LockResetIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Log out">
              <IconButton size="small" onClick={onLogout} aria-label="logout">
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </>
      )}
    </Box>
  );
}

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Redirect to login when session has expired or was never established.
  useEffect(() => {
    if (!isLoading && !user) {
      void router.replace("/login");
    }
  }, [isLoading, user, router]);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [router.pathname]);

  const handleLogout = () => {
    void logout().then(() => void router.push("/login"));
  };

  if (isLoading || !user) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  const activeHref = "/" + router.pathname.split("/")[1];
  const drawerContent = (
    <DrawerContent activeHref={activeHref} userName={user.name} userRole={user.role} onLogout={handleLogout} />
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Top bar — sits to the right of the permanent sidebar on desktop */}
      <AppBar
        position="fixed"
        color="default"
        elevation={0}
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid",
          borderColor: "divider",
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar variant="dense" sx={{ minHeight: 60, gap: 1.5, px: { xs: 2, md: 3 } }}>
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(true)}
            size="small"
            aria-label="open navigation"
            sx={{ display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <GlobalSearch />
          <Box sx={{ flexGrow: 1 }} />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: { xs: "none", sm: "block" } }}
          >
            {user.name}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Permanent sidebar on desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Temporary drawer on mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: "100vh",
          backgroundColor: "background.default",
          pt: "60px",
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
