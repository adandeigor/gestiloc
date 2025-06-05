"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import getCookie from '@/core/getCookie';
import { httpClient } from '@/core/httpClient';

const UniteLocativeSchema = z.object({
  nom: z.string().min(1, "Le nom de l'unité locative est requis"),
  description: z.string().min(1, "La description de l'unité locative est requise"),
  prix: z.number().min(0, "Le prix de l'unité locative doit être supérieur ou égal à 0"),
});

type UniteLocativeFormType = z.infer<typeof UniteLocativeSchema>;

export function UniteLocativeDialog({ open, onClose, proprieteId, unite, onSaved, loading }: {
  open: boolean;
  onClose: () => void;
  proprieteId: number;
  unite?: {
    id: number;
    nom: string;
    description: string;
    prix: number;
  };
  onSaved: () => void;
  loading?: boolean;
}) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UniteLocativeFormType>({
    resolver: zodResolver(UniteLocativeSchema),
    defaultValues: {
      nom: '',
      description: '',
      prix: 0,
    },
  });
  const [saving, setSaving] = useState(false);
  const userId  = getCookie('userId');
  useEffect(() => {
    if (open && unite) {
      reset({
        nom: unite.nom || '',
        description: unite.description || '',
        prix: unite.prix || 0,
      });
    } else if (open) {
      reset({ nom: '', description: '', prix: 0 });
    }
  }, [open, unite, reset]);
  const onSubmit = async (data: UniteLocativeFormType) => {
    setSaving(true);
    try {
      if (unite) {
        await httpClient.put(
          `/api/user/${userId}/propriete/${proprieteId}/uniteLocative/${unite.id}`,
          data
        );
        toast.success("Unité modifiée !");
      } else {
        await httpClient.post(
          `/api/user/${userId}/propriete/${proprieteId}/uniteLocative`,
          data
        );
        toast.success("Unité ajoutée !");
      }
      onSaved();
      onClose();
    } catch (e: unknown) {
      const message =
        e instanceof Error
          ? e.message
          : unite
          ? 'Erreur lors de la modification'
          : 'Erreur lors de la création de l\'unité locative';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>{unite ? "Modifier l'unité locative" : "Ajouter une unité locative"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l&#39;unité locative</label>
            <Input {...register('nom')} placeholder="Nom de l'unité locative" disabled={saving || loading} />
            {errors.nom && <span className="text-red-500 text-xs">{errors.nom.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <Textarea {...register('description')} placeholder="Description" disabled={saving || loading} />
            {errors.description && <span className="text-red-500 text-xs">{errors.description.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prix</label>
            <Input type="number" step="any" {...register('prix', { valueAsNumber: true })} placeholder="Prix" disabled={saving || loading} />
            {errors.prix && <span className="text-red-500 text-xs">{errors.prix.message}</span>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving || loading}>{saving ? 'Enregistrement...' : 'Enregistrer'}</Button>
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving || loading}>Annuler</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
