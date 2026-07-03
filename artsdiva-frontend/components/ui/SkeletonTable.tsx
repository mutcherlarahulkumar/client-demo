import React from "react";
import Skeleton from "@mui/material/Skeleton";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";

interface SkeletonTableRowsProps {
  rows?: number;
  cols: number;
}

export function SkeletonTableRows({ rows = 5, cols }: SkeletonTableRowsProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <TableCell key={j}>
              <Skeleton
                variant="text"
                width={j === 0 ? "60%" : j === cols - 1 ? 80 : "80%"}
                height={20}
                sx={{ borderRadius: 1 }}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function SkeletonDetailCard() {
  return (
    <div style={{ padding: 24 }}>
      <Skeleton variant="text" width={200} height={32} sx={{ mb: 1 }} />
      <Skeleton variant="text" width={120} height={20} sx={{ mb: 3 }} />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ marginBottom: 20 }}>
          <Skeleton variant="text" width={100} height={16} sx={{ mb: 0.5 }} />
          <Skeleton variant="rectangular" width="100%" height={44} sx={{ borderRadius: 1 }} />
        </div>
      ))}
    </div>
  );
}
