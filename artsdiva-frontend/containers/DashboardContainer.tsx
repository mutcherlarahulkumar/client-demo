import React from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import { getDashboardStats } from "@artsdiva/api/dashboard.api";
import { useAuth } from "@artsdiva/hooks/useAuth";

function greetingByHour(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const STAT_CARDS = [
  {
    key: "artistsCount" as const,
    label: "Artists",
    icon: "✦",
    color: "#4F46E5",
    bg: "#EEF2FF",
    border: "#C7D2FE",
    href: "/artists",
    description: "Registered artists",
  },
  {
    key: "artworksCount" as const,
    label: "Artworks",
    icon: "◉",
    color: "#0891B2",
    bg: "#E0F2FE",
    border: "#BAE6FD",
    href: "/artworks",
    description: "In the collection",
  },
  {
    key: "clientsCount" as const,
    label: "Clients",
    icon: "◎",
    color: "#16A34A",
    bg: "#DCFCE7",
    border: "#BBF7D0",
    href: "/clients",
    description: "Active clients",
  },
  {
    key: "activeLeasesCount" as const,
    label: "Active Leases",
    icon: "◈",
    color: "#D97706",
    bg: "#FEF3C7",
    border: "#FDE68A",
    href: "/artworks?status=ON_LEASE",
    description: "Artworks currently leased",
  },
];

const QUICK_ACTIONS = [
  { label: "Add Artist", href: "/artists/new", icon: "✦", color: "#4F46E5" },
  { label: "Add Artwork", href: "/artworks/new", icon: "◉", color: "#0891B2" },
  { label: "Add Client", href: "/clients/new", icon: "◎", color: "#16A34A" },
];

function StatCardSkeleton() {
  return (
    <Card sx={{ borderRadius: 2, border: "1px solid #E2E8F0", boxShadow: "none" }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Skeleton variant="rounded" width={40} height={40} />
          <Skeleton variant="rounded" width={60} height={20} />
        </Box>
        <Skeleton variant="text" width="60%" height={40} />
        <Skeleton variant="text" width="80%" height={20} sx={{ mt: 0.5 }} />
      </CardContent>
    </Card>
  );
}

export function DashboardContainer() {
  const router = useRouter();
  const { user } = useAuth();

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
    staleTime: 60_000,
  });

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Box sx={{ p: 3, maxWidth: 1100 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)",
              borderRadius: 3,
              p: 3.5,
              color: "#fff",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Background decoration */}
            <Box sx={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.04)" }} />
            <Box sx={{ position: "absolute", bottom: -60, right: 60, width: 150, height: 150, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.03)" }} />

            <Box sx={{ position: "relative" }}>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, letterSpacing: "-0.02em", color: "#fff" }}>
                {greetingByHour()}{user ? `, ${user.name.split(" ")[0]}` : ""}
              </Typography>
              <Typography sx={{ color: "#A5B4FC", fontSize: "0.95rem" }}>
                {today} · ArtsDiva Inventory Management
              </Typography>

              <Box sx={{ display: "flex", gap: 1.5, mt: 2.5 }}>
                {QUICK_ACTIONS.map((action) => (
                  <Button
                    key={action.href}
                    variant="contained"
                    size="small"
                    onClick={() => void router.push(action.href)}
                    sx={{
                      backgroundColor: "rgba(255,255,255,0.12)",
                      color: "#E0E7FF",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      border: "1px solid rgba(255,255,255,0.15)",
                      backdropFilter: "blur(8px)",
                      "&:hover": { backgroundColor: "rgba(255,255,255,0.2)", boxShadow: "none" },
                      boxShadow: "none",
                      gap: 0.75,
                    }}
                  >
                    <span style={{ fontFamily: "monospace" }}>{action.icon}</span>
                    {action.label}
                  </Button>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </motion.div>

      {/* Error */}
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Could not load dashboard stats — {error instanceof Error ? error.message : "please try again"}
        </Alert>
      )}

      {/* Stats grid */}
      <Typography variant="subtitle2" sx={{ color: "#94A3B8", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", mb: 2 }}>
        Overview
      </Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, mb: 4 }}>
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : STAT_CARDS.map((card, i) => (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.25 }}
              >
                <Card
                  onClick={() => void router.push(card.href)}
                  sx={{
                    borderRadius: 2,
                    border: `1px solid ${card.border}`,
                    boxShadow: "none",
                    cursor: "pointer",
                    backgroundColor: "#fff",
                    transition: "all 0.15s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: `0 4px 16px ${card.color}22`,
                      borderColor: card.color,
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1.5,
                          backgroundColor: card.bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography sx={{ fontSize: "1.1rem", color: card.color, fontFamily: "monospace", lineHeight: 1, userSelect: "none" }}>
                          {card.icon}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: "#94A3B8", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.04em", mt: 0.25 }}>
                        {card.description}
                      </Typography>
                    </Box>

                    <Typography variant="h4" sx={{ fontWeight: 800, color: "#0F172A", lineHeight: 1, mb: 0.25 }}>
                      {stats ? stats[card.key] : 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 500 }}>
                      {card.label}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
      </Box>

      {/* Modules section */}
      <Typography variant="subtitle2" sx={{ color: "#94A3B8", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", mb: 2 }}>
        Modules
      </Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
        {[
          {
            href: "/artists",
            icon: "✦",
            title: "Artists",
            desc: "Manage artist profiles, commission terms, and MOU agreements.",
            color: "#4F46E5",
            bg: "#EEF2FF",
            actions: [{ label: "View All", href: "/artists" }, { label: "Add New", href: "/artists/new" }],
          },
          {
            href: "/artworks",
            icon: "◉",
            title: "Artworks",
            desc: "Track the full collection — status, dimensions, acquisition dates, and images.",
            color: "#0891B2",
            bg: "#E0F2FE",
            actions: [{ label: "View All", href: "/artworks" }, { label: "Add New", href: "/artworks/new" }],
          },
          {
            href: "/clients",
            icon: "◎",
            title: "Clients",
            desc: "Manage client relationships, contact info, preferences, and lease history.",
            color: "#16A34A",
            bg: "#DCFCE7",
            actions: [{ label: "View All", href: "/clients" }, { label: "Add New", href: "/clients/new" }],
          },
        ].map((mod, i) => (
          <motion.div
            key={mod.href}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 + i * 0.07, duration: 0.25 }}
          >
            <Card sx={{ borderRadius: 2, border: "1px solid #E2E8F0", boxShadow: "none", height: "100%", backgroundColor: "#fff" }}>
              <CardContent sx={{ p: 2.5, display: "flex", flexDirection: "column", height: "100%" }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    backgroundColor: mod.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 1.5,
                  }}
                >
                  <Typography sx={{ fontSize: "1.2rem", color: mod.color, fontFamily: "monospace", lineHeight: 1, userSelect: "none" }}>
                    {mod.icon}
                  </Typography>
                </Box>

                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0F172A", mb: 0.5 }}>
                  {mod.title}
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748B", lineHeight: 1.6, flex: 1 }}>
                  {mod.desc}
                </Typography>

                <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                  {mod.actions.map((a) => (
                    <Button
                      key={a.href}
                      variant={a.label === "Add New" ? "contained" : "outlined"}
                      size="small"
                      onClick={() => void router.push(a.href)}
                      sx={
                        a.label === "Add New"
                          ? { flex: 1, fontSize: "0.78rem" }
                          : { flex: 1, fontSize: "0.78rem", color: "#64748B", borderColor: "#E2E8F0" }
                      }
                    >
                      {a.label}
                    </Button>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Box>
    </Box>
  );
}
