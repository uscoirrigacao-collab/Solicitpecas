"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import { PlusCircle, Trash2 } from "lucide-react";

import type { PartRequest } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { ScrollArea } from "./ui/scroll-area";


const itemSchema = z.object({
  id: z.string().optional(),
  quantity: z.coerce.number().int().positive("A qtde deve ser um número positivo"),
  material: z.string().min(1, "O material é obrigatório"),
  equipment: z.string().min(1, "O equipamento é obrigatório"),
  equipmentOs: z.string().min(1, "A OS do equipamento é obrigatória"),
  application: z.string().min(1, "A aplicação é obrigatória"),
  location: z.string().min(1, "O local é obrigatório"),
});

const formSchema = z.object({
  osNumber: z.string().optional(),
  costCenter: z.string().optional(),
  reservation: z.string().optional(),
  registrationNumber: z.string().min(1, "A matrícula é obrigatória"),
  requesterName: z.string().min(1, "O nome do solicitante é obrigatório"),
  items: z.array(itemSchema).min(1, "Adicione pelo menos um item à solicitação"),
});

type FormValues = z.infer<typeof formSchema>;

interface RequestFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (values: Omit<PartRequest, 'id' | 'requestDate' | 'status'>) => void;
  initialData?: PartRequest | null;
  currentUserRegistration?: string | null;
}

export function RequestFormDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  initialData,
  currentUserRegistration
}: RequestFormDialogProps) {
  const { isAdmin } = useAuth();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      osNumber: "",
      costCenter: "",
      reservation: "",
      registrationNumber: "",
      requesterName: "",
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    if (isOpen) {
        if (initialData) {
            form.reset({
                ...initialData,
                items: initialData.items.map(item => ({...item}))
            });
        } else {
            form.reset({
                osNumber: "",
                costCenter: "",
                reservation: "",
                registrationNumber: !isAdmin && currentUserRegistration ? currentUserRegistration : "",
                requesterName: "",
                items: [],
            });
            // Add one empty item form by default for new requests
            append({ 
                quantity: 1, 
                material: "", 
                equipment: "", 
                equipmentOs: "", 
                application: "", 
                location: "" 
            });
        }
    }
  }, [initialData, isOpen, form, append, isAdmin, currentUserRegistration]);

  const dialogTitle = initialData ? "Editar Solicitação" : "Criar Nova Solicitação";
  const dialogDescription = initialData ? "Atualize os detalhes da solicitação." : "Preencha o formulário para criar uma nova solicitação de peças.";

  const handleFormSubmit = (values: FormValues) => {
    const finalValues = {
        ...values,
        items: values.items.map(item => ({
            ...item,
            id: item.id || `new-${Date.now()}-${Math.random()}`
        }))
    };
    onSubmit(finalValues as Omit<PartRequest, 'id' | 'requestDate' | 'status'>);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <ScrollArea className="h-[60vh] p-4">
                <div className="space-y-6">
                    {/* Header Fields */}
                    <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="font-semibold text-lg">Cabeçalho da Solicitação</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="requesterName"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome do Solicitante</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="registrationNumber"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Matrícula</FormLabel>
                                    <FormControl><Input {...field} disabled={!isAdmin && !!currentUserRegistration} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            {isAdmin && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="osNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Número da OS (SAP)</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="costCenter"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Centro de Custo</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                <FormField
                                    control={form.control}
                                    name="reservation"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Reserva</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                            )}
                        </div>
                    </div>

                    {/* Items Section */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Itens</h3>
                        {fields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                            <h4 className="font-medium">Item {index + 1}</h4>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField control={form.control} name={`items.${index}.quantity`}
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Qtde</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField control={form.control} name={`items.${index}.material`}
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                        <FormLabel>Material</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <FormField control={form.control} name={`items.${index}.equipment`}
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Equipamento</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField control={form.control} name={`items.${index}.equipmentOs`}
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>OS do Equipamento</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                             </div>
                             <FormField control={form.control} name={`items.${index}.application`}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Aplicação</FormLabel>
                                    <FormControl><Textarea {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField control={form.control} name={`items.${index}.location`}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Local</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {fields.length > 1 && (
                                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)}>
                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                    <span className="sr-only">Remover Item</span>
                                </Button>
                            )}
                        </div>
                        ))}
                         <FormField
                            control={form.control}
                            name="items"
                            render={() => (
                                <FormItem>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => append({ quantity: 1, material: "", equipment: "", equipmentOs: "", application: "", location: "" })}
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Adicionar Outro Item
                        </Button>
                    </div>
                </div>
            </ScrollArea>
            <Separator />
            <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                    Cancelar
                </Button>
                <Button type="submit">
                    {initialData ? 'Salvar Alterações' : 'Criar Solicitação'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
