import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import { useAuth } from "@artsdiva/hooks/useAuth";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: "🏠" },
  { label: "Artists", href: "/artists", icon: "🧑‍🎨" },
  { label: "Artworks", href: "/artworks", icon: "🖼" },
  { label: "Clients", href: "/clients", icon: "👤" },
];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link href={item.href} style={{ textDecoration: "none" }}>
      <Box
        component={motion.div}
        whileHover={{ x: 2 }}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 1.5,
          py: 1.25,
          borderRadius: 1.5,
          cursor: "pointer",
          backgroundColor: active ? "rgba(99,102,241,0.15)" : "transparent",
          border: active ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent",
          transition: "all 0.15s ease",
          "&:hover": {
            backgroundColor: active ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.06)",
          },
        }}
      >
        <Typography sx={{ fontSize: "1rem" }}>{item.icon}</Typography>
        <Typography
          variant="body2"
          sx={{
            fontWeight: active ? 600 : 400,
            color: active ? "#A5B4FC" : "#94A3B8",
            fontSize: "0.875rem",
            letterSpacing: "0.01em",
          }}
        >
          {item.label}
        </Typography>
        {active && (
          <Box
            sx={{
              ml: "auto",
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: "#6366F1",
            }}
          />
        )}
      </Box>
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
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#F8FAFC" }}>
      {/* Sidebar */}
      <Box
        component={motion.div}
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
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
            <Typography sx={{ fontSize: "1.2rem" }}>🎨</Typography>
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
        <Box sx={{ flex: 1, px: 1.5, pt: 2, display: "flex", flexDirection: "column", gap: 0.5 }}>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} active={activeHref === item.href} />
          ))}
        </Box>

        <Divider sx={{ borderColor: "#1E293B", mx: 2 }} />

        {/* User footer */}
        {user && (
          <Box sx={{ px: 2, py: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
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
                <Typography sx={{ fontSize: 14 }}>⎋</Typography>
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>

      {/* Main content */}
      <Box
        component={motion.main}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        sx={{
          flex: 1,
          ml: "220px",
          minHeight: "100vh",
          backgroundColor: "#F8FAFC",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
