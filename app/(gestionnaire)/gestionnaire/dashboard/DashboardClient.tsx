"use client";

import { Suspense, useEffect, useState } from "react";
import { StatCard } from "../components/StatCard";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle,
  CirclePlus,
  Euro,
  ExternalLink,
  ListCheck,
  UserPlus,
} from "lucide-react";
import { getUserStats } from "../services/getUserStats";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { ActionCard } from "../components/actionCard";
import { ProprieteDialog } from "../components/ProprieteDialog";
import { LocataireDialog } from "../components/LocataireDialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import getCookie from "@/core/getCookie";
import LocatairesParProprieteChart from "../components/LocatairesParProprieteChart";
import LocataireChart from "../components/chart";

// Types définis
type AuditLog = {
  id: number;
  action: string;
  details: string;
  createdAt: string;
};

type Gestionnaire = {
  id: number;
  prenom?: string;
};

type ProprieteType = {
  id: number;
  nom: string;
  adresse: string;
  ville: string;
  codePostal: string;
  pays: string;
  localisation?: string;
  unitesLocatives?: {
    id: number;
    proprieteId?: number;
    nom?: string;
  }[];
};

type UserStats = {
  totalProperties: number;
  unitsOccupied: number;
  unitsAvailable: number;
  chiffreAffaire: number;
  auditLogs: AuditLog[];
  gestionnaire?: Gestionnaire;
  proprietes?: ProprieteType[];
};

export default function DashboardClient() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [auditLogPage, setAuditLogPage] = useState<number>(0);
  const [openProprieteDialog, setOpenProprieteDialog] = useState<boolean>(false);
  const [openLocataireDialog, setOpenLocataireDialog] = useState<boolean>(false);
  const [showCheckboxes, setShowCheckboxes] = useState<boolean>(false);
  const [deleteAuditLoader, setDeleteAuditLoader] = useState<boolean>(false);
  const [selectedAuditIds, setSelectedAuditIds] = useState<number[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [jwt, setJwt] = useState<string | null>(null);

  const pageSize = 5;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data: UserStats = await getUserStats();
        setUserStats(data);
      } catch (error) {
        console.error("Erreur lors du chargement des stats :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  useEffect(() => {
    const token = getCookie("jwt");
    setJwt(token);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-gray-500">Chargement des statistiques...</span>
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-red-500">
          Impossible de charger les statistiques.
        </span>
      </div>
    );
  }

  const totalProperties = userStats.totalProperties || 0;
  const unitsOccupied = userStats.unitsOccupied || 0;
  const unitsAvailable = userStats.unitsAvailable || 0;
  const chiffreAffaire = userStats.chiffreAffaire || 0;
  const auditLogs = userStats.auditLogs || [];
  const totalPages = Math.ceil(auditLogs.length / pageSize);
  const paginatedAuditLogs = auditLogs.slice(
    auditLogPage * pageSize,
    (auditLogPage + 1) * pageSize
  );

  const handleDoubleClick = () => {
    setShowCheckboxes(true);
  };

  const handleCheckboxChange = (id: number, checked: boolean) => {
    setSelectedAuditIds((prev) =>
      checked ? [...prev, id] : prev.filter((auditId) => auditId !== id)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedAuditIds(checked ? paginatedAuditLogs.map((log) => log.id) : []);
  };

  const handleDeleteAudits = async () => {
    if (selectedAuditIds.length === 0 || !jwt) return;
    setDeleteAuditLoader(true);
    try {
      const response = await fetch(
        `/api/user/${userStats.gestionnaire?.id}/auditlog`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization-JWT": `Bearer ${jwt}`,
            Authorization: process.env.NEXT_PUBLIC_API_TOKEN as string,
          },
          body: JSON.stringify({ ids: selectedAuditIds }),
        }
      );

      if (response.ok) {
        setRefreshTrigger((prev) => prev + 1);
        setSelectedAuditIds([]);
        setShowCheckboxes(false);
        toast.success("Audit(s) supprimé(s) avec succès !");
      } else {
        toast.error("Erreur lors de la suppression des audits.");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      toast.error("Une erreur est survenue.");
    } finally {
      setDeleteAuditLoader(false);
    }
  };

  return (
    <Suspense fallback={<div>Chargement du tableau de bord...</div>}>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">
              Bienvenue, {userStats.gestionnaire?.prenom || "Utilisateur"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total des Propriétés"
              value={totalProperties > 0 ? totalProperties : "Aucune propriété"}
              icon={Building2}
              subText="Voir toutes les propriétés"
            />
            <StatCard
              title="Unités Occupées"
              value={unitsOccupied > 0 ? unitsOccupied : "Aucune unité occupée"}
              icon={CheckCircle}
              subText="Voir tous les locataires"
              trend={0}
              trendPositive={true}
            />
            <StatCard
              title="Unités Disponibles"
              value={
                unitsAvailable > 0 ? unitsAvailable : "Aucune unité disponible"
              }
              icon={CheckCircle}
              subText="Unités libres"
              trend={0}
              trendPositive={true}
            />
            <StatCard
              title="Revenu Mensuel"
              value={
                chiffreAffaire > 0
                  ? `${chiffreAffaire.toLocaleString("fr-FR", {
                      minimumFractionDigits: 2,
                    })} F`
                  : "Aucun revenu"
              }
              icon={Euro}
              subText="Voir les détails financiers"
              trend={0}
              trendPositive={true}
            />
          </div>
          <div className="grid grid-cols-1 w-full md:grid-cols-2 gap-4">
            <Suspense fallback={<div>Chargement du graphique...</div>}>
              <LocataireChart />
            </Suspense>
            <Suspense fallback={<div>Chargement du graphique...</div>}>
              <LocatairesParProprieteChart />
            </Suspense>
          </div>

          <div className="mt-8">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-4 text-accent text-center">
                  Historique des actions
                </h3>
                {showCheckboxes && (
                  <div className="mb-2 flex items-center">
                    <Checkbox
                      id="select-all"
                      checked={
                        paginatedAuditLogs.length > 0 &&
                        paginatedAuditLogs.every((log) =>
                          selectedAuditIds.includes(log.id)
                        )
                      }
                      onCheckedChange={handleSelectAll}
                    />
                    <label htmlFor="select-all" className="ml-2 text-sm">
                      Tout cocher
                    </label>
                  </div>
                )}
                <ul className="divide-y divide-gray-200 min-h-[180px]">
                  <AnimatePresence mode="wait" initial={false}>
                    {paginatedAuditLogs.map((log, idx) => (
                      <motion.li
                        key={log.id || idx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25, type: "tween" }}
                        className="py-2 flex flex-row items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        onDoubleClick={handleDoubleClick}
                      >
                        <div className="flex flex-row items-start gap-2 md:gap-[100px] justify-between">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm text-primary dark:text-gray-200 font-semibold">
                              {log.action.replace(/_/g, " ")}
                            </span>
                            <span className="text-gray-600 text-[12px]">
                              {log.details}
                            </span>
                          </div>
                          <span className="text-gray-400 dark:text-gray-300 text-xs md:text-right">
                            {new Date(log.createdAt).toLocaleString("fr-FR")}
                          </span>
                        </div>
                        {showCheckboxes && (
                          <Checkbox
                            checked={selectedAuditIds.includes(log.id)}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange(log.id, !!checked)
                            }
                            className="mr-2"
                          />
                        )}
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
                {auditLogs.length > pageSize && (
                  <div className="flex justify-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setAuditLogPage((p) => Math.max(0, p - 1))}
                      disabled={auditLogPage === 0}
                      aria-label="Page précédente"
                      className="text-primary"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-xs text-gray-500 flex items-center">
                      {auditLogPage + 1} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setAuditLogPage((p) => Math.min(totalPages - 1, p + 1))
                      }
                      disabled={auditLogPage >= totalPages - 1}
                      aria-label="Page suivante"
                      className="text-primary"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                {!auditLogs.length && (
                  <div className="text-center text-gray-400 py-4">
                    Aucune action récente.
                  </div>
                )}
                {showCheckboxes && selectedAuditIds.length > 0 && (
                  <div className="mt-4 flex justify-end">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive">
                          {selectedAuditIds.length === 1
                            ? "Supprimer"
                            : "Tout supprimer"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirmation de suppression</DialogTitle>
                          <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer{" "}
                            {selectedAuditIds.length} audit(s) ? Cette action
                            est irréversible.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => {}}>
                            Annuler
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleDeleteAudits}
                          >
                            {deleteAuditLoader
                              ? "Suppression..."
                              : "Confirmer la suppression"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-4 text-accent text-center">
                  Actions Rapides
                </h3>
                <div className="grid grid-cols-1 justify-center items-center mx-auto sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <ActionCard
                    title="Ajouter une Propriété"
                    icon={CirclePlus}
                    onClick={() => setOpenProprieteDialog(true)}
                  />
                  <ActionCard
                    title="Ajouter un Locataire"
                    icon={UserPlus}
                    onClick={() => setOpenLocataireDialog(true)}
                  />
                  <ActionCard
                    title="Consulter les Paiements"
                    icon={ListCheck}
                    color="text-purple-500"
                    onClick={() => null}
                  />
                  <ActionCard
                    title="Générer un lien de Paiement"
                    icon={ExternalLink}
                    color="text-orange-500"
                    onClick={() => null}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <ProprieteDialog
          open={openProprieteDialog}
          onClose={() => setOpenProprieteDialog(false)}
          userId={userStats.gestionnaire?.id ?? 0}
        />
        <LocataireDialog
          open={openLocataireDialog}
          onClose={() => setOpenLocataireDialog(false)}
          userId={userStats.gestionnaire?.id ?? 0}
          proprietes={(userStats.proprietes || []).map((p) => ({
            id: p.id,
            nom: p.nom,
            adresse: p.adresse,
            ville: p.ville,
            codePostal: p.codePostal,
            pays: p.pays,
            localisation: p.localisation,
            unitesLocatives: (p.unitesLocatives || [])
              .filter((u) => typeof u.id === "number")
              .map((u) => ({
                ...u,
                proprieteId: p.id,
                nom: u.nom ?? "",
              })),
          }))}
        />
      </div>
    </Suspense>
  );
}
