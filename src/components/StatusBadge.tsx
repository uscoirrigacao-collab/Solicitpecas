"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RequestStatus } from "@/lib/types";
import { CheckCircle2, Clock, XCircle, CheckSquare } from "lucide-react";

interface StatusBadgeProps {
  status: RequestStatus;
  className?: string;
}

const statusConfig = {
  pending: {
    label: "Pendente",
    icon: Clock,
    className: "bg-[hsl(var(--status-pending))] text-white",
  },
  available: {
    label: "Disponível",
    icon: CheckCircle2,
    className: "bg-[hsl(var(--status-available))] text-white",
  },
  out_of_stock: {
    label: "Em Falta",
    icon: XCircle,
    className: "bg-[hsl(var(--status-out-of-stock))] text-white",
  },
  completed: {
    label: "Concluído",
    icon: CheckSquare,
    className: "bg-[hsl(var(--status-completed))] text-white",
  }
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  if (!config) return null;

  const Icon = config.icon;

  return (
    <Badge
      className={cn(
        "flex items-center gap-1.5 border-none text-xs",
        config.className,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{config.label}</span>
    </Badge>
  );
}
