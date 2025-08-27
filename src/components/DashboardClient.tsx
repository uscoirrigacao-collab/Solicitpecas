"use client";

import { useState, useMemo, useEffect } from "react";
import { PlusCircle, Search } from "lucide-react";

import type { PartRequest } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import * as partRequestService from "@/services/partRequestService";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RequestCard } from "@/components/RequestCard";
import { RequestDetailsDialog } from "@/components/RequestDetailsDialog";
import { RequestFormDialog } from "@/components/RequestFormDialog";

const USER_REGISTRATION_KEY = "userRegistrationNumber";

export function DashboardClient() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<PartRequest | null>(null);
  const [isDetailsOpen, setDetailsOpen] = useState(false);
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<PartRequest | null>(null);
  const [userRegistration, setUserRegistration] = useState<string | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const { isAdmin } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    // This effect runs only on the client side
    try {
      const registration = sessionStorage.getItem(USER_REGISTRATION_KEY);
      if (registration) {
        setUserRegistration(registration);
      }
    } catch (error) {
      console.error("Failed to load registration from storage:", error);
    }
  }, []);

  useEffect(() => {
    // Set up Firestore listener
    if (!isAdmin && !userRegistration) {
        setIsDataLoaded(true);
        setRequests([]); // No data to load if not admin and no registration
        return;
    }

    setIsDataLoaded(false);
    const unsubscribe = partRequestService.listenToRequests(isAdmin, userRegistration, (newRequests) => {
        setRequests(newRequests);
        setIsDataLoaded(true);
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();

  }, [isAdmin, userRegistration]);


  const handleAddNew = () => {
    setEditingRequest(null);
    setFormOpen(true);
  };

  const handleEdit = (request: PartRequest) => {
    setEditingRequest(request);
    setDetailsOpen(false); // Close details dialog
    setFormOpen(true);
  };

  const handleCardClick = (request: PartRequest) => {
    setSelectedRequest(request);
    setDetailsOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
        await partRequestService.deleteRequest(id);
        toast({
            title: "Solicitação Excluída",
            description: "A solicitação foi excluída com sucesso.",
            variant: "destructive"
        });
        setDetailsOpen(false);
    } catch (error) {
        toast({ title: "Erro", description: "Falha ao excluir a solicitação.", variant: "destructive"});
    }
  };

  const handleStatusChange = async (id: string, status: PartRequest["status"]) => {
    try {
        await partRequestService.updateRequestStatus(id, status);
        toast({
            title: "Status Atualizado",
            description: `O status da solicitação foi alterado.`,
        });
         if (status === "available") {
            toast({
                title: "Status: Disponível para Retirada",
                description: "Notificação enviada ao usuário.",
                variant: "default",
            });
        }
    } catch (error) {
         toast({ title: "Erro", description: "Falha ao atualizar o status.", variant: "destructive"});
    }
  };
  
  const handleFinalize = async (id: string) => {
    try {
        await partRequestService.finalizeRequest(id);
        toast({
            title: "Solicitação Finalizada",
            description: "A solicitação foi marcada como concluída.",
        });
        setDetailsOpen(false);
    } catch (error) {
        toast({ title: "Erro", description: "Falha ao finalizar a solicitação.", variant: "destructive"});
    }
  };

  const handleFormSubmit = async (values: Omit<PartRequest, 'id' | 'requestDate' | 'status'>) => {
    try {
        if (editingRequest) {
            await partRequestService.updateRequest(editingRequest.id, values);
            toast({ title: "Sucesso", description: "Solicitação atualizada com sucesso." });
        } else {
            await partRequestService.addRequest(values);
            toast({ title: "Sucesso", description: "Nova solicitação criada." });
            
            if (!isAdmin) {
                try {
                sessionStorage.setItem(USER_REGISTRATION_KEY, values.registrationNumber);
                setUserRegistration(values.registrationNumber);
                } catch (error) {
                console.error("Failed to set registration number in session storage", error);
                }
            }
        }
        setFormOpen(false);
        setEditingRequest(null);
    } catch (error) {
        const action = editingRequest ? "atualizar" : "criar";
        toast({ title: "Erro", description: `Falha ao ${action} a solicitação.`, variant: "destructive"});
    }
  };

  const filteredRequests = useMemo(() => {
    if (!isAdmin) {
        return requests; // Data is already filtered by the listener
    }
    
    // Admin can search locally
    if (!searchTerm) return requests;

    return requests.filter(request =>
      (request.osNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      request.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.items.some(item => item.material.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [requests, searchTerm, isAdmin]);
  
  if (!isDataLoaded) {
    return (
        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
            <div className="text-center">
                <p className="text-muted-foreground">Carregando solicitações...</p>
            </div>
        </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-primary">{isAdmin ? 'Painel do Administrador' : 'Minhas Solicitações'}</h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {isAdmin ? (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por OS, solicitante..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          ) : (
            userRegistration && (
                <div className="text-sm text-muted-foreground">
                    Exibindo para matrícula: <span className="font-bold text-primary">{userRegistration}</span>
                </div>
            )
          )}
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-5 w-5" />
            Nova Solicitação
          </Button>
        </div>
      </div>
      
      {!isAdmin && !userRegistration && (
        <div className="text-center py-16 bg-card p-8 rounded-lg shadow-md max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-primary mb-4">Bem-vindo ao Portal de Solicitação de Peças</h2>
          <p className="text-muted-foreground mb-6">Para visualizar ou criar um pedido, crie sua primeira solicitação. A matrícula informada será usada para identificar seus pedidos futuros.</p>
          <Button onClick={handleAddNew} size="lg">
              <PlusCircle className="mr-2 h-5 w-5" />
              Criar Primeira Solicitação
          </Button>
        </div>
      )}

      {filteredRequests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRequests.map(request => (
            <RequestCard key={request.id} request={request} onClick={handleCardClick} />
          ))}
        </div>
      ) : (
        <>
            {isDataLoaded && isAdmin && (
                <div className="text-center py-16">
                    <p className="text-muted-foreground">{searchTerm ? "Nenhuma solicitação encontrada para a busca." : "Nenhuma solicitação no momento."}</p>
                </div>
            )}
             {isDataLoaded && !isAdmin && userRegistration && (
                <div className="text-center py-16 bg-card p-8 rounded-lg shadow-md max-w-2xl mx-auto">
                  <h2 className="text-2xl font-semibold text-primary mb-4">Nenhuma Solicitação Pendente</h2>
                  <p className="text-muted-foreground mb-6">Você não possui solicitações em aberto. Para solicitar uma nova peça, clique no botão abaixo.</p>
                  <Button onClick={handleAddNew} size="lg">
                      <PlusCircle className="mr-2 h-5 w-5" />
                      Criar Nova Solicitação
                  </Button>
                </div>
            )}
        </>
      )}


      {selectedRequest && (
        <RequestDetailsDialog
          isOpen={isDetailsOpen}
          onOpenChange={setDetailsOpen}
          request={selectedRequest}
          isAdmin={isAdmin}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          onFinalize={handleFinalize}
        />
      )}

      <RequestFormDialog
        isOpen={isFormOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        initialData={editingRequest}
        currentUserRegistration={userRegistration}
      />
    </>
  );
}
