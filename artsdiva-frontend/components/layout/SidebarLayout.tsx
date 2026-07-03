import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PaletteIcon from "@mui/icons-material/Palette";
import ImageIcon from "@mui/icons-material/Image";
import PeopleIcon from "@mui/icons-material/People";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "@artsdiva/hooks/useAuth";

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

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link href={item.href} style={{ textDecoration: "none", display: "block" }}>
      <ListItemButton
        selected={active}
        sx={{
          borderRadius: 1.5,
          mx: 0.5,
          px: 1.5,
          py: 1,
          mb: 0.25,
          color: active ? "#A5B4FC" : "#94A3B8",
          "&.Mui-selected": {
            backgroundColor: "rgba(99,102,241,0.15)",
            border: "1px solid rgba(99,102,241,0.25)",
            color: "#A5B4FC",
            "&:hover": { backgroundColor: "rgba(99,102,241,0.2)" },
          },
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.06)",
            color: "#CBD5E1",
          },
          transition: "all 0.15s ease",
        }}
      >
        <ListItemIcon sx={{ minWidth: 34, color: "inherit" }}>
          {item.icon}
        </ListItemIcon>
        <ListItemText
          primary={item.label}
          slotProps={{
            primary: {
              sx: {
                fontSize: "0.875rem",
                fontWeight: active ? 600 : 400,
                color: "inherit",
                letterSpacing: "0.01em",
              },
            },
          }}
        />
        {active && (
          <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#6366F1", flexShrink: 0 }} />
        )}
      </ListItemButton>
    </Link>
  );
}

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    void logout().then(() => void router.push("/login"));
  };

  const activeHref = "/" + router.pathname.split("/")[1];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "background.default" }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: 220,
          flexShrink: 0,
          backgroundColor: "#0F172A",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <Box sx={{ px: 2, pt: 2.5, pb: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 1.5,
              py: 1.25,
              borderRadius: 2,
              backgroundColor: "#1E293B",
            }}
          >
            <Avatar
              sx={{
                width: 28,
                height: 28,
                backgroundColor: "primary.main",
                fontSize: "0.75rem",
                fontWeight: 700,
              }}
            >
              A
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 700, color: "#FFFFFF", fontSize: "0.875rem", lineHeight: 1.2 }}>
                ArtsDiva
              </Typography>
              <Typography sx={{ color: "#64748B", fontSize: "0.7rem" }}>
                IMS
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderColor: "#1E293B", mx: 2 }} />

        {/* Nav */}
        <List sx={{ flex: 1, pt: 1.5, px: 0.5 }} disablePadding>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} active={activeHref === item.href} />
          ))}
        </List>

        <Divider sx={{ borderColor: "#1E293B", mx: 2 }} />

        {/* User footer */}
        {user && (
          <Box sx={{ px: 2, py: 1.75, display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                backgroundColor: "#3730A3",
                fontSize: "0.75rem",
                fontWeight: 700,
              }}
            >
              {user.name.slice(0, 2).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography noWrap sx={{ color: "#CBD5E1", fontSize: "0.8rem", fontWeight: 500 }}>
                {user.name}
              </Typography>
              <Typography sx={{ color: "#475569", fontSize: "0.7rem" }}>
                {user.role}
              </Typography>
            </Box>
            <Tooltip title="Log out" placement="top">
              <IconButton
                onClick={handleLogout}
                size="small"
                sx={{ color: "#64748B", "&:hover": { color: "#F87171", backgroundColor: "transparent" } }}
              >
                <LogoutIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>

      {/* Main content */}
      <Box
        sx={{
          flex: 1,
          ml: "220px",
          minHeight: "100vh",
          backgroundColor: "background.default",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
