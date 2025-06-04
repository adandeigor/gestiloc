interface Gestionnaire {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  telephone: string;
  isAdmin: boolean;
  statut: string;
  createdAt: string;
  updatedAt: string;
}

interface DossierGestionnaire {
  id: number;
  gestionnaireId: number;
  ifu_number: string;
  ifu_file: string;
  carte_identite_number: string;
  carte_identite_file: string;
  registre_commerce: string;
  adresse: string;
  code_postal: string;
  ville: string;
  pays: string;
  nationalite: string;
  date_naissance: string;
  role: string;
}

interface Company {
  id: number;
  gestionnaireId: number;
  name: string;
  type: string;
  address: string;
  description: string;
  registre_commerce_number: string;
  registre_commerce_file: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
}

interface Localisation {
  latitude: number;
  longitude: number;
}

interface Locataire {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  carte_identite: string;
  photo_identite: string;
  uniteLocativeId: number;
  createdAt: string;
  updatedAt: string;
}

interface EtatDesLieuxDetails {
  etat: string;
  observations: string;
}

interface EtatDesLieux {
  id: number;
  contratId: number;
  type: string;
  date: string;
  details: EtatDesLieuxDetails;
  createdAt: string;
  updatedAt: string;
}

interface Paiement {
  id: number;
  contratId: number;
  locataireId: number;
  montant: number;
  datePaiement: string;
  paymentMethod: string;
  status: string;
  transactionId: string;
  createdAt: string;
  updatedAt: string;
}

interface Contrat {
  id: number;
  locataireId: number;
  uniteLocativeId: number;
  typeContrat: string;
  loyerMensuel: number;
  dateDebut: string;
  dateFin: string;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  locataire: Locataire;
  paiements: Paiement[];
  etatsDesLieux: EtatDesLieux[];
}

interface UniteLocative {
  id: number;
  proprieteId: number;
  nom: string;
  description: string;
  prix: number;
  createdAt: string;
  updatedAt: string;
  contrats: Contrat[];
  locataires: Locataire[];
}

interface Propriete {
  id: number;
  gestionnaireId: number;
  nom: string;
  adresse: string;
  ville: string;
  codePostal: string;
  pays: string;
  localisation: Localisation;
  createdAt: string;
  updatedAt: string;
  unitesLocatives: UniteLocative[];
}

interface Notification {
  id: number;
  gestionnaireId: number;
  adminId: number;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Session {
  id: number;
  gestionnaireId: number;
  adminId: number;
  token: string;
  createdAt: string;
  updatedAt: string;
}

interface AuditLog {
  id: number;
  gestionnaireId: number;
  adminId: number;
  action: string;
  details: string;
  createdAt: string;
  updatedAt: string;
}

interface UserStats {
  gestionnaire: Gestionnaire;
  dossiergestionnaire: DossierGestionnaire;
  company: Company;
  proprietes: Propriete[];
  totalProperties: number;
  unitesLocatives: UniteLocative[];
  totalUnits: number;
  unitsOccupied: number;
  unitsAvailable: number;
  contrats: Contrat[];
  totalContrats: number;
  locataires: Locataire[];
  totalLocataires: number;
  etatsDesLieux: EtatDesLieux[];
  totalEtatsDesLieux: number;
  paiements: Paiement[];
  totalPaiements: number;
  notifications: Notification[];
  totalNotifications: number;
  sessions: Session[];
  totalSessions: number;
  auditLogs: AuditLog[];
  totalAuditLogs: number;
  chiffreAffaire: number;
}