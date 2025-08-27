"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { PartRequest, RequestStatus } from "@/lib/types";
import { format } from "date-fns";
import {
  ClipboardCheck,
  FilePenLine,
  Trash2,
  Package,
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { ScrollArea } from "./ui/scroll-area";

interface RequestDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  request: PartRequest;
  isAdmin: boolean;
  onEdit: (request: PartRequest) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: RequestStatus) => void;
  onFinalize: (id: string) => void;
}

export function RequestDetailsDialog({
  isOpen,
  onOpenChange,
  request,
  isAdmin,
  onEdit,
  onDelete,
  onStatusChange,
  onFinalize,
}: RequestDetailsDialogProps) {
  
  if (!request) return null;

  const osDisplay = request.osNumber && request.osNumber.trim() !== '' ? request.osNumber : 'Aguardando Geração';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl">OS: {osDisplay}</DialogTitle>
            <StatusBadge status={request.status} />
          </div>
          <DialogDescription>
            Solicitado em {format(new Date(request.requestDate), "PPP")}
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="grid grid-cols-2 gap-x-8 gap-y-4 py-4 text-sm">
          <div>
            <p className="font-medium text-foreground">Solicitante</p>
            <p className="text-muted-foreground">{request.requesterName}</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Matrícula</p>
            <p className="text-muted-foreground">{request.registrationNumber}</p>
          </div>
          {isAdmin && (
            <>
              <div>
                <p className="font-medium text-foreground">Centro de Custo</p>
                <p className="text-muted-foreground">{request.costCenter || 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Reserva</p>
                <p className="text-muted-foreground">{request.reservation || 'N/A'}</p>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col gap-3">
            <h3 className="text-md font-semibold flex items-center gap-2">
                <Package className="h-5 w-5" />
                Itens Solicitados
            </h3>
            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                <div className="space-y-4">
                {request.items.map((item, index) => (
                    <div key={item.id}>
                    <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
                        <div className="col-span-2">
                            <p className="font-medium text-foreground">Material</p>
                            <p className="text-muted-foreground">{item.material}</p>
                        </div>
                        <div>
                            <p className="font-medium text-foreground">Quantidade</p>
                            <p className="text-muted-foreground">{item.quantity}</p>
                        </div>
                        <div>
                            <p className="font-medium text-foreground">Equipamento</p>
                            <p className="text-muted-foreground">{item.equipment}</p>
                        </div>
                        <div>
                            <p className="font-medium text-foreground">OS do Equipamento</p>
                            <p className="text-muted-foreground">{item.equipmentOs}</p>
                        </div>
                        <div>
                            <p className="font-medium text-foreground">Local</p>
                            <p className="text-muted-foreground">{item.location}</p>
                        </div>
                         <div className="col-span-3">
                            <p className="font-medium text-foreground">Aplicação</p>
                            <p className="text-muted-foreground">{item.application}</p>
                        </div>
                    </div>
                    {index < request.items.length - 1 && <Separator className="mt-4" />}
                    </div>
                ))}
                </div>
            </ScrollArea>
        </div>


        {isAdmin && (
          <>
            <Separator />
            <div className="py-4">
              <Label htmlFor="status" className="font-medium text-foreground">
                Atualizar Status
              </Label>
              <Select
                defaultValue={request.status}
                onValueChange={(value: RequestStatus) => onStatusChange(request.id, value)}
                disabled={request.status === 'completed'}
              >
                <SelectTrigger id="status" className="w-full mt-2">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="available">Disponível para Retirada</SelectItem>
                  <SelectItem value="out_of_stock">Fora de Estoque/Aguardando</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <DialogFooter className="gap-2 sm:justify-between w-full">
            <div className="flex gap-2">
                {request.status === 'available' && (
                     <Button onClick={() => onFinalize(request.id)}>
                        <ClipboardCheck className="mr-2 h-4 w-4" />
                        Marcar como Recebido
                    </Button>
                )}
            </div>
            {isAdmin && request.status !== 'completed' && (
                 <div className="flex gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente a solicitação.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(request.id)}>
                            Continuar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button variant="secondary" onClick={() => onEdit(request)}>
                        <FilePenLine className="mr-2 h-4 w-4" />
                        Editar
                    </Button>
                    <Button onClick={() => onFinalize(request.id)}>
                        <ClipboardCheck className="mr-2 h-4 w-4" />
                        Finalizar Solicitação
                    </Button>
                 </div>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
