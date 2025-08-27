"use client";

import { format } from "date-fns";
import { Calendar, User, Package } from "lucide-react";

import type { PartRequest } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";

interface RequestCardProps {
  request: PartRequest;
  onClick: (request: PartRequest) => void;
}

export function RequestCard({ request, onClick }: RequestCardProps) {
  const osDisplay = request.osNumber && request.osNumber.trim() !== '' ? `OS: ${request.osNumber}`: 'OS: N/D';
  const totalItems = request.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-transform duration-200 flex flex-col"
      onClick={() => onClick(request)}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg mb-2">{osDisplay}</CardTitle>
          <StatusBadge status={request.status} />
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{request.requesterName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span>{totalItems} {totalItems > 1 ? 'itens' : 'item'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(request.requestDate), "dd/MM/yyyy")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
