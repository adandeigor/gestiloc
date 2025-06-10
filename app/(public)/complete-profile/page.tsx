'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { z } from 'zod';
import getCookie from '@/core/getCookie';
import { uploadToSupabase } from '@/core/uploadFIle';
import { convertImageToPDF } from '@/utils/imageToPdf';
import { useCustomRouter } from '@/core/useCustomRouter';

// Define Profile Validator (Step 1)
const ProfileValidator = z.object({
    nationalite: z.string().min(1, 'La nationalité est requise'),
    adresse: z.string().min(1, "L'adresse est requise"),
    ville: z.string().min(1, 'La ville est requise'),
    code_postal: z.string().min(1, 'Le code postal est requis'),
    pays: z.string().min(1, 'Le pays est requis'),
    date_naissance: z.date({
        required_error: 'La date de naissance est requise',
    }),
    role: z.enum(['GESTIONNAIRE', 'PARTICULIER'], {
        errorMap: () => ({ message: 'Le rôle est requis' }),
    }),
    ifu_number: z.string().min(1, 'Le numéro IFU est requis'),
    ifu_file: z
        .instanceof(File, { message: 'Le fichier IFU est requis' })
        .refine(
            file =>
                ['image/jpeg', 'image/png', 'application/pdf'].includes(
                    file.type
                ),
            'Utilisez un fichier JPG, PNG ou PDF'
        ),
    carte_identite_number: z
        .string()
        .min(1, "Le numéro de la carte d'identité est requis"),
    carte_identite_file: z
        .instanceof(File, {
            message: "Le fichier de la carte d'identité est requis",
        })
        .refine(
            file =>
                ['image/jpeg', 'image/png', 'application/pdf'].includes(
                    file.type
                ),
            'Utilisez un fichier JPG, PNG ou PDF'
        ),
});

// Define Company Validator (Step 2)
const CompanyValidator = z.object({
    company_name: z.string().min(1, "Le nom de l'entreprise est requis"),
    company_type: z.enum(['SARL', 'SA', 'SAS', 'SNC', 'SCS'], {
        errorMap: () => ({ message: "Type d'entreprise invalide" }),
    }),
    registre_commerce_number: z
        .string()
        .min(5, 'Le numéro DU registre de commerce est requis'),
    registre_commerce_file: z
        .instanceof(File, {
            message: 'Le fichier du registre de commerce est requis',
        })
        .refine(
            file =>
                !file ||
                ['image/jpeg', 'image/png', 'application/pdf'].includes(
                    file.type
                ),
            'Utilisez un fichier JPG, PNG ou PDF'
        ),
    company_address: z.string().min(1, "L'adresse de l'entreprise est requise"),
    company_location: z
        .object({
            latitude: z.number(),
            longitude: z.number(),
        })
        .refine(
            location =>
                location &&
                location.latitude !== undefined &&
                location.longitude !== undefined,
            {
                message: "La localisation de l'entreprise est requise",
            }
        ),
    company_description: z
        .string()
        .min(1, "La description de l'entreprise est requise"),
});

// Combined validator for both steps
const CombinedValidator = ProfileValidator.merge(CompanyValidator.partial());

// Type for form data
type FormData = z.infer<typeof CombinedValidator>;

const days = Array.from({ length: 31 }, (_, i) => i + 1);
const months = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 120 }, (_, i) => currentYear - i);

export default function CompleteProfilePage() {
    const router = useCustomRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<number>(1);
    const [birthDay, setBirthDay] = useState<number | undefined>();
    const [birthMonth, setBirthMonth] = useState<number | undefined>();
    const [birthYear, setBirthYear] = useState<number | undefined>();
    const [locationLoading, setLocationLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        trigger,
        reset,
        clearErrors,
        setError,
    } = useForm<FormData>({
        resolver: zodResolver(CombinedValidator),
        mode: 'onChange',
        defaultValues: {
            nationalite: '',
            adresse: '',
            ville: '',
            code_postal: '',
            pays: '',
            date_naissance: undefined,
            role: undefined,
            ifu_number: '',
            ifu_file: undefined,
            carte_identite_number: '',
            carte_identite_file: undefined,
            company_name: '',
            company_type: undefined,
            registre_commerce_number: '',
            registre_commerce_file: undefined,
            company_address: '',
            company_location: undefined,
            company_description: '',
        },
    });

    const selectedRole = watch('role');

    // Update date_naissance when birth fields change
    useEffect(() => {
        if (birthDay && birthMonth !== undefined && birthYear) {
            const date = new Date(birthYear, birthMonth, birthDay);
            if (!isNaN(date.getTime())) {
                setValue('date_naissance', date, { shouldValidate: true });
                clearErrors('date_naissance');
            } else {
                setError('date_naissance', {
                    type: 'manual',
                    message: 'Date de naissance invalide',
                });
            }
        } else if (birthDay || birthMonth !== undefined || birthYear) {
            setError('date_naissance', {
                type: 'manual',
                message: 'Veuillez sélectionner une date complète',
            });
        }
    }, [birthDay, birthMonth, birthYear, setValue, setError, clearErrors]);

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            setLocationLoading(true);
            navigator.geolocation.getCurrentPosition(
                position => {
                    setValue(
                        'company_location',
                        {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        },
                        { shouldValidate: true }
                    );
                    setLocationLoading(false);
                    toast.success('Localisation récupérée avec succès');
                    clearErrors('company_location');
                },
                () => {
                    setLocationLoading(false);
                    toast.error(
                        'Erreur lors de la récupération de la localisation'
                    );
                    setError('company_location', {
                        type: 'manual',
                        message: 'Impossible de récupérer la localisation',
                    });
                }
            );
        } else {
            setLocationLoading(false);
            toast.error(
                "La géolocalisation n'est pas supportée par ce navigateur"
            );
            setError('company_location', {
                type: 'manual',
                message: 'Géolocalisation non supportée',
            });
        }
    };

    const validateFile = (file: File | undefined, fieldName: string) => {
        if (!file) {
            setError(
                fieldName.toLowerCase().replace(' ', '_') as keyof FormData,
                {
                    type: 'manual',
                    message: `${fieldName} est requis`,
                }
            );
            toast.error(`${fieldName} est requis`);
            return false;
        }
        if (!(file instanceof File)) {
            setError(
                fieldName.toLowerCase().replace(' ', '_') as keyof FormData,
                {
                    type: 'manual',
                    message: `Format de fichier invalide pour ${fieldName}`,
                }
            );
            toast.error(`Format de fichier invalide pour ${fieldName}`);
            return false;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError(
                fieldName.toLowerCase().replace(' ', '_') as keyof FormData,
                {
                    type: 'manual',
                    message: `Le fichier ${fieldName} est trop volumineux. Taille maximale : 5MB`,
                }
            );
            toast.error(
                `Le fichier ${fieldName} est trop volumineux. Taille maximale : 5MB`
            );
            return false;
        }
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            setError(
                fieldName.toLowerCase().replace(' ', '_') as keyof FormData,
                {
                    type: 'manual',
                    message: `Format de fichier non supporté pour ${fieldName}. Utilisez JPG, PNG ou PDF`,
                }
            );
            toast.error(
                `Format de fichier non supporté pour ${fieldName}. Utilisez JPG, PNG ou PDF`
            );
            return false;
        }
        return true;
    };

    const convertToPDF = async (file: File) => {
        // Si le fichier est déjà un PDF, le retourner tel quel
        if (file.type === 'application/pdf') {
            return file;
        }

        // Vérifier si le fichier est une image (JPG, PNG, JPEG)
        if (['image/jpeg', 'image/png'].includes(file.type)) {
            const { data, error } = await convertImageToPDF(file);
            if (error) {
                console.error('Erreur lors de la conversion en PDF:', error);
                toast.error(
                    `Erreur lors de la conversion du fichier: ${error}`
                );
                throw new Error(error);
            }
            if (!data) {
                console.error('Aucune donnée retournée après la conversion');
                toast.error('Aucune donnée retournée après la conversion');
                throw new Error('Aucune donnée retournée après la conversion');
            }

            // Recréation du File avec un nom correct
            const pdfBlob = data.file as Blob;
            const fileName = data.path ?? `converted_${Date.now()}.pdf`;
            const fixedFile = new File([pdfBlob], fileName, {
                type: 'application/pdf',
            });

            return fixedFile;
        }

        // Si le type de fichier n'est pas pris en charge
        throw new Error(
            'Type de fichier non pris en charge pour la conversion. Utilisez JPG, PNG ou PDF.'
        );
    };

    const validateStep1Fields = async () => {
        const step1Fields: (keyof FormData)[] = [
            'nationalite',
            'adresse',
            'ville',
            'code_postal',
            'pays',
            'date_naissance',
            'role',
            'ifu_number',
            'ifu_file',
            'carte_identite_number',
            'carte_identite_file',
        ];

        const isValid = await trigger(step1Fields);

        if (!isValid) {
            const errorMessages = step1Fields
                .filter(field => errors[field])
                .map(field => errors[field]?.message)
                .filter(
                    (message): message is string => typeof message === 'string'
                );

            if (errorMessages.length > 0) {
                errorMessages.forEach(message => toast.error(message));
            } else {
                toast.error(
                    'Veuillez corriger les erreurs dans le formulaire.'
                );
            }

            console.log('Erreurs de validation step 1:', errors);
            return false;
        }

        return true;
    };

    const validateStep2Fields = async () => {
        const step2Fields: (keyof FormData)[] = [
            'company_name',
            'company_type',
            'company_address',
            'company_location',
            'company_description',
        ];

        const isValid = await trigger(step2Fields);

        if (!isValid) {
            const errorMessages = step2Fields
                .filter(field => errors[field])
                .map(field => errors[field]?.message)
                .filter(
                    (message): message is string => typeof message === 'string'
                );

            if (errorMessages.length > 0) {
                errorMessages.forEach(message => toast.error(message));
            } else {
                toast.error(
                    "Veuillez corriger les erreurs dans le formulaire de l'entreprise."
                );
            }

            console.log('Erreurs de validation step 2:', errors);
            return false;
        }

        return true;
    };
    const jwt = getCookie('jwt') as string;

    const submitPersonalData = async (data: FormData) => {
        try {
            setIsLoading(true);

            // Validate files
            if (!validateFile(data.ifu_file, 'Fichier IFU')) {
                throw new Error('Fichier IFU invalide');
            }
            if (
                !validateFile(
                    data.carte_identite_file,
                    "Fichier carte d'identité"
                )
            ) {
                throw new Error("Fichier carte d'identité invalide");
            }

            const userId = getCookie('userId');
            if (!userId) {
                throw new Error(
                    'Identifiant utilisateur non trouvé dans les cookies.'
                );
            }

            // Convert files if necessary
            const convertedIfuFile = await convertToPDF(data.ifu_file);
            console.log(convertedIfuFile);
            const convertedCarteIdentiteFile = await convertToPDF(
                data.carte_identite_file
            );
            console.log('Carte identité convertis', convertedCarteIdentiteFile);

            // Upload files to Supabase
            const uploading_ifu = await uploadToSupabase(
                convertedIfuFile,
                'ifu',
                userId
            );
            const uploading_carte_identite = await uploadToSupabase(
                convertedCarteIdentiteFile,
                'carte_identite',
                userId
            );

            const personalData = {
                nationalite: data.nationalite,
                adresse: data.adresse,
                ville: data.ville,
                code_postal: data.code_postal,
                pays: data.pays,
                date_naissance:
                    data.date_naissance instanceof Date
                        ? data.date_naissance.toISOString()
                        : data.date_naissance,
                role: data.role,
                ifu_number: data.ifu_number,
                ifu_file: uploading_ifu,
                carte_identite_number: data.carte_identite_number,
                carte_identite_file: uploading_carte_identite,
            };

            const response = await fetch(`/api/user/${userId}/profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
                    'Authorization-JWT': `Bearer ${jwt}`,
                },
                body: JSON.stringify(personalData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message ||
                        'Erreur lors de la mise à jour du profil'
                );
            }

            return response;
        } catch (error) {
            console.error('Erreur submitPersonalData:', error);
            if (error && typeof error === 'object' && 'message' in error) {
                toast.error(
                    (error as { message?: string }).message ||
                        'Une erreur est survenue lors de la mise à jour du profil'
                );
            } else {
                toast.error(
                    'Une erreur est survenue lors de la mise à jour du profil'
                );
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const submitCompanyData = async (data: FormData) => {
        try {
            const userId = getCookie('userId');

            // Validate registre_commerce if provided
            let uploading_registre_commerce = null;
            if (data.registre_commerce_file) {
                if (
                    !validateFile(
                        data.registre_commerce_file,
                        'Registre de commerce'
                    )
                ) {
                    throw new Error('Fichier registre de commerce invalide');
                }
                const convertedRegistreCommerce = await convertToPDF(
                    data.registre_commerce_file
                );
                uploading_registre_commerce = await uploadToSupabase(
                    convertedRegistreCommerce,
                    'registre_commerce',
                    userId as string
                );
            }

            const companyData = {
                name: data.company_name,
                type: data.company_type,
                registre_commerce_file: uploading_registre_commerce,
                registre_commerce_number: data.registre_commerce_number,
                address: data.company_address,
                latitude: data.company_location?.latitude,
                longitude: data.company_location?.longitude,
                description: data.company_description,
            };

            console.log('CompanyData', companyData);

            const response = await fetch(`/api/user/${userId}/company`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
                    'Authorization-JWT': `Bearer ${jwt}`,
                },
                body: JSON.stringify(companyData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error ||
                        errorData.message ||
                        "Erreur lors de la mise à jour des informations de l'entreprise"
                );
            }

            return response;
        } catch (error) {
            console.error('Erreur submitCompanyData:', error);
            if (error && typeof error === 'object' && 'message' in error) {
                toast.error(
                    (error as { message?: string }).message ||
                        "Une erreur est survenue lors de la mise à jour des informations de l'entreprise"
                );
            } else {
                toast.error(
                    "Une erreur est survenue lors de la mise à jour des informations de l'entreprise"
                );
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const handleNextStep = async () => {
        try {
            const isStep1Valid = await validateStep1Fields();
            if (!isStep1Valid) {
                toast.error(
                    'Veuillez remplir tous les champs obligatoires du profil personnel correctement.'
                );
                return;
            }

            if (!selectedRole) {
                toast.error(
                    'Veuillez sélectionner un rôle (Gestionnaire ou Particulier).'
                );
                setError('role', {
                    type: 'manual',
                    message: 'Le rôle est requis',
                });
                return;
            }

            if (selectedRole === 'GESTIONNAIRE') {
                const formData = watch();
                try {
                    const response = await submitPersonalData(formData);
                    if (response.ok) {
                        toast.success(
                            'Profil personnel enregistré avec succès'
                        );
                        setStep(2);
                    }
                } catch (error) {
                    console.error(
                        'Erreur lors de la soumission des données personnelles:',
                        error
                    );
                    return;
                }
            } else if (selectedRole === 'PARTICULIER') {
                await handleSubmit(onSubmit)();
            }
        } catch (error) {
            console.error('Erreur handleNextStep:', error);
            toast.error('Une erreur est survenue lors de la validation');
        }
    };

    const handlePreviousStep = () => {
        setStep(1);
    };

    const onSubmit = async (data: FormData) => {
        try {
            console.log(
                'Soumission du formulaire - Step:',
                step,
                'Role:',
                selectedRole
            );
            console.log('Données du formulaire:', data);

            if (!selectedRole) {
                toast.error('Veuillez sélectionner un rôle.');
                setError('role', {
                    type: 'manual',
                    message: 'Le rôle est requis',
                });
                return;
            }

            if (selectedRole === 'PARTICULIER') {
                const isValid = await validateStep1Fields();
                if (!isValid) {
                    toast.error(
                        'Veuillez remplir tous les champs obligatoires correctement.'
                    );
                    return;
                }

                await submitPersonalData(data);
                toast.success('Profil personnel mis à jour avec succès');
                reset();
                router.push('/gestionnaire/dashboard');
            } else if (selectedRole === 'GESTIONNAIRE') {
                if (step === 1) {
                    await handleNextStep();
                } else if (step === 2) {
                    const isStep2Valid = await validateStep2Fields();
                    if (!isStep2Valid) {
                        toast.error(
                            "Veuillez remplir tous les champs obligatoires de l'entreprise correctement."
                        );
                        return;
                    }

                    await submitCompanyData(data);
                    toast.success(
                        "Profil de l'entreprise mis à jour avec succès"
                    );
                    reset();
                    router.push('/gestionnaire/dashboard');
                }
            }
        } catch (error) {
            console.error('Erreur onSubmit:', error);
            if (error && typeof error === 'object' && 'message' in error) {
                toast.error(
                    (error as { message?: string }).message ||
                        'Une erreur est survenue lors de la soumission'
                );
            } else {
                toast.error('Une erreur est survenue lors de la soumission');
            }
        }
    };

    return (
        <div className="max-w-screen-xl mx-auto p-4 sm:p-6 md:p-8">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
                encType="multipart/form-data"
            >
                <div>
                    <h1 className="text-2xl font-bold mb-4">
                        Compléter votre profil
                    </h1>
                    {selectedRole === 'GESTIONNAIRE' && (
                        <div className="mb-4">
                            <div className="flex items-center space-x-2">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                        step >= 1
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 text-gray-600'
                                    }`}
                                >
                                    1
                                </div>
                                <span
                                    className={`${step >= 1 ? 'text-blue-500' : 'text-gray-500'}`}
                                >
                                    Informations personnelles
                                </span>
                                <div className="w-8 border-t border-gray-300"></div>
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                        step >= 2
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 text-gray-600'
                                    }`}
                                >
                                    2
                                </div>
                                <span
                                    className={`${step >= 2 ? 'text-blue-500' : 'text-gray-500'}`}
                                >
                                    Informations entreprise
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {step === 1 && (
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold">
                            Informations personnelles
                        </h2>
                    </div>
                )}

                {step === 2 && (
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold">
                            Informations sur l&apos;entreprise
                        </h2>
                    </div>
                )}

                {step === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nationalité */}
                        <div className="space-y-2">
                            <Label htmlFor="nationalite">Nationalité *</Label>
                            <Input
                                id="nationalite"
                                {...register('nationalite')}
                                className={cn(
                                    errors.nationalite && 'border-destructive'
                                )}
                            />
                            {errors.nationalite &&
                                typeof errors.nationalite.message ===
                                    'string' && (
                                    <p className="text-sm text-destructive">
                                        {errors.nationalite.message}
                                    </p>
                                )}
                        </div>

                        {/* Adresse */}
                        <div className="space-y-2">
                            <Label htmlFor="adresse">Adresse *</Label>
                            <Input
                                id="adresse"
                                {...register('adresse')}
                                className={cn(
                                    errors.adresse && 'border-destructive'
                                )}
                            />
                            {errors.adresse &&
                                typeof errors.adresse.message === 'string' && (
                                    <p className="text-sm text-destructive">
                                        {errors.adresse.message}
                                    </p>
                                )}
                        </div>

                        {/* Ville */}
                        <div className="space-y-2">
                            <Label htmlFor="ville">Ville *</Label>
                            <Input
                                id="ville"
                                {...register('ville')}
                                className={cn(
                                    errors.ville && 'border-destructive'
                                )}
                            />
                            {errors.ville &&
                                typeof errors.ville.message === 'string' && (
                                    <p className="text-sm text-destructive">
                                        {errors.ville.message}
                                    </p>
                                )}
                        </div>

                        {/* Code Postal */}
                        <div className="space-y-2">
                            <Label htmlFor="code_postal">Code Postal *</Label>
                            <Input
                                id="code_postal"
                                {...register('code_postal')}
                                className={cn(
                                    errors.code_postal && 'border-destructive'
                                )}
                            />
                            {errors.code_postal &&
                                typeof errors.code_postal.message ===
                                    'string' && (
                                    <p className="text-sm text-destructive">
                                        {errors.code_postal.message}
                                    </p>
                                )}
                        </div>

                        {/* Pays */}
                        <div className="space-y-2">
                            <Label htmlFor="pays">Pays *</Label>
                            <Input
                                id="pays"
                                {...register('pays')}
                                className={cn(
                                    errors.pays && 'border-destructive'
                                )}
                            />
                            {errors.pays &&
                                typeof errors.pays.message === 'string' && (
                                    <p className="text-sm text-destructive">
                                        {errors.pays.message}
                                    </p>
                                )}
                        </div>

                        {/* Date de naissance */}
                        <div className="space-y-2">
                            <Label>Date de naissance *</Label>
                            <div className="flex gap-2">
                                <select
                                    className={cn(
                                        'border rounded px-2 py-1',
                                        errors.date_naissance &&
                                            'border-destructive'
                                    )}
                                    value={birthDay ?? ''}
                                    onChange={e =>
                                        setBirthDay(
                                            e.target.value
                                                ? Number(e.target.value)
                                                : undefined
                                        )
                                    }
                                >
                                    <option value="">Jour</option>
                                    {days.map(day => (
                                        <option key={day} value={day}>
                                            {day}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    className={cn(
                                        'border rounded px-2 py-1',
                                        errors.date_naissance &&
                                            'border-destructive'
                                    )}
                                    value={birthMonth ?? ''}
                                    onChange={e =>
                                        setBirthMonth(
                                            e.target.value
                                                ? Number(e.target.value)
                                                : undefined
                                        )
                                    }
                                >
                                    <option value="">Mois</option>
                                    {months.map((month, idx) => (
                                        <option key={month} value={idx}>
                                            {month}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    className={cn(
                                        'border rounded px-2 py-1',
                                        errors.date_naissance &&
                                            'border-destructive'
                                    )}
                                    value={birthYear ?? ''}
                                    onChange={e =>
                                        setBirthYear(
                                            e.target.value
                                                ? Number(e.target.value)
                                                : undefined
                                        )
                                    }
                                >
                                    <option value="">Année</option>
                                    {years.map(year => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {errors.date_naissance &&
                                typeof errors.date_naissance.message ===
                                    'string' && (
                                    <p className="text-sm text-destructive">
                                        {errors.date_naissance.message}
                                    </p>
                                )}
                        </div>

                        {/* Role */}
                        <div className="space-y-2">
                            <Label htmlFor="role">Rôle *</Label>
                            <Select
                                onValueChange={(value: string) => {
                                    setValue(
                                        'role',
                                        value as 'GESTIONNAIRE' | 'PARTICULIER',
                                        {
                                            shouldValidate: true,
                                        }
                                    );
                                }}
                                value={selectedRole || ''}
                            >
                                <SelectTrigger
                                    className={cn(
                                        errors.role && 'border-destructive'
                                    )}
                                >
                                    <SelectValue placeholder="Sélectionner un rôle" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="GESTIONNAIRE">
                                        Gestionnaire
                                    </SelectItem>
                                    <SelectItem value="PARTICULIER">
                                        Particulier
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.role &&
                                typeof errors.role.message === 'string' && (
                                    <p className="text-sm text-destructive">
                                        {errors.role.message}
                                    </p>
                                )}
                        </div>

                        {/* IFU Number */}
                        <div className="space-y-2">
                            <Label htmlFor="ifu_number">Numéro IFU *</Label>
                            <Input
                                id="ifu_number"
                                {...register('ifu_number')}
                                className={cn(
                                    errors.ifu_number && 'border-destructive'
                                )}
                            />
                            {errors.ifu_number &&
                                typeof errors.ifu_number.message ===
                                    'string' && (
                                    <p className="text-sm text-destructive">
                                        {errors.ifu_number.message}
                                    </p>
                                )}
                        </div>

                        {/* IFU File */}
                        <div className="space-y-2">
                            <Label htmlFor="ifu_file">Fichier IFU *</Label>
                            <Input
                                id="ifu_file"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={e => {
                                    const file = e.target.files?.[0];
                                    setValue('ifu_file', file as File, {
                                        shouldValidate: true,
                                    });
                                    if (
                                        file &&
                                        validateFile(file, 'Fichier IFU')
                                    ) {
                                        toast.success(
                                            `Fichier sélectionné : ${file.name}`
                                        );
                                    }
                                }}
                                className={cn(
                                    errors.ifu_file && 'border-destructive'
                                )}
                            />
                            {watch('ifu_file') && (
                                <p className="text-sm text-muted-foreground">
                                    Fichier sélectionné :{' '}
                                    {(watch('ifu_file') as File).name}
                                </p>
                            )}
                            {errors.ifu_file &&
                                typeof errors.ifu_file.message === 'string' && (
                                    <p className="text-sm text-destructive">
                                        {errors.ifu_file.message}
                                    </p>
                                )}
                        </div>

                        {/* Carte d'identité Number */}
                        <div className="space-y-2">
                            <Label htmlFor="carte_identite_number">
                                Numéro carte d&apos;identité *
                            </Label>
                            <Input
                                id="carte_identite_number"
                                {...register('carte_identite_number')}
                                className={cn(
                                    errors.carte_identite_number &&
                                        'border-destructive'
                                )}
                            />
                            {errors.carte_identite_number &&
                                typeof errors.carte_identite_number.message ===
                                    'string' && (
                                    <p className="text-sm text-destructive">
                                        {errors.carte_identite_number.message}
                                    </p>
                                )}
                        </div>

                        {/* Carte d'identité File */}
                        <div className="space-y-2">
                            <Label htmlFor="carte_identite_file">
                                Fichier carte d&apos;identité *
                            </Label>
                            <Input
                                id="carte_identite_file"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={e => {
                                    const file = e.target.files?.[0];
                                    setValue(
                                        'carte_identite_file',
                                        file as File,
                                        {
                                            shouldValidate: true,
                                        }
                                    );
                                    if (
                                        file &&
                                        validateFile(
                                            file,
                                            "Fichier carte d'identité"
                                        )
                                    ) {
                                        toast.success(
                                            `Fichier sélectionné : ${file.name}`
                                        );
                                    }
                                }}
                                className={cn(
                                    errors.carte_identite_file &&
                                        'border-destructive'
                                )}
                            />
                            {watch('carte_identite_file') && (
                                <p className="text-sm text-muted-foreground">
                                    Fichier sélectionné :{' '}
                                    {
                                        (watch('carte_identite_file') as File)
                                            .name
                                    }
                                </p>
                            )}
                            {errors.carte_identite_file &&
                                typeof errors.carte_identite_file.message ===
                                    'string' && (
                                    <p className="text-sm text-destructive">
                                        {errors.carte_identite_file.message}
                                    </p>
                                )}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Company Name */}
                        <div className="space-y-2">
                            <Label htmlFor="company_name">
                                Nom de l&apos;entreprise *
                            </Label>
                            <Input
                                id="company_name"
                                {...register('company_name')}
                                className={cn(
                                    errors.company_name && 'border-destructive'
                                )}
                            />
                            {errors.company_name &&
                                typeof errors.company_name.message ===
                                    'string' && (
                                    <p className="text-sm text-destructive">
                                        {errors.company_name.message}
                                    </p>
                                )}
                        </div>

                        {/* Company Type */}
                        <div className="space-y-2">
                            <Label htmlFor="company_type">
                                Type d&apos;entreprise *
                            </Label>
                            <Select
                                onValueChange={(value: string) => {
                                    setValue(
                                        'company_type',
                                        value as
                                            | 'SARL'
                                            | 'SA'
                                            | 'SAS'
                                            | 'SNC'
                                            | 'SCS',
                                        { shouldValidate: true }
                                    );
                                }}
                                value={watch('company_type') || ''}
                            >
                                <SelectTrigger
                                    className={cn(
                                        errors.company_type &&
                                            'border-destructive'
                                    )}
                                >
                                    <SelectValue placeholder="Sélectionner un type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SARL">SARL</SelectItem>
                                    <SelectItem value="SA">SA</SelectItem>
                                    <SelectItem value="SAS">SAS</SelectItem>
                                    <SelectItem value="SNC">SNC</SelectItem>
                                    <SelectItem value="SCS">SCS</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.company_type &&
                                typeof errors.company_type.message ===
                                    'string' && (
                                    <p className="text-sm text-destructive">
                                        {errors.company_type.message}
                                    </p>
                                )}
                        </div>

                        {/*Numéro du registre de commerce*/}

                        <div className="space-y-2">
                            <Label htmlFor="registre_commerce_number">
                                Numéro du registre de commerce
                            </Label>
                            <Input
                                id="registre_commerce_number"
                                type="text"
                                {...register('registre_commerce_number')}
                                className={cn(
                                    errors.registre_commerce_number &&
                                        'border-destructive'
                                )}
                                placeholder="Numéro du registre de commerce"
                            />
                        </div>

                        {/*Fichier du  Registre de commerce */}
                        <div className="space-y-2">
                            <Label htmlFor="registre_commerce_file">
                                Registre de commerce *
                            </Label>
                            <Input
                                id="registre_commerce"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={e => {
                                    const file = e.target.files?.[0];
                                    setValue('registre_commerce_file', file, {
                                        shouldValidate: true,
                                    });
                                    if (
                                        file &&
                                        validateFile(
                                            file,
                                            'Registre de commerce'
                                        )
                                    ) {
                                        toast.success(
                                            `Fichier sélectionné : ${file.name}`
                                        );
                                    }
                                }}
                                className={cn(
                                    errors.registre_commerce_file &&
                                        'border-destructive'
                                )}
                            />
                            {watch('registre_commerce_file') && (
                                <p className="text-sm text-muted-foreground">
                                    Fichier sélectionné :{' '}
                                    {
                                        (
                                            watch(
                                                'registre_commerce_file'
                                            ) as File
                                        ).name
                                    }
                                </p>
                            )}
                            {errors.registre_commerce_file &&
                                typeof errors.registre_commerce_file.message ===
                                    'string' && (
                                    <p className="text-sm text-destructive">
                                        {errors.registre_commerce_file.message}
                                    </p>
                                )}
                        </div>

                        {/* Company Address */}
                        <div className="space-y-2">
                            <Label htmlFor="company_address">
                                Adresse de l&apos;entreprise *
                            </Label>
                            <Input
                                id="company_address"
                                {...register('company_address')}
                                className={cn(
                                    errors.company_address &&
                                        'border-destructive'
                                )}
                                placeholder="123 Rue de l'Entreprise, Ville, Département"
                            />
                            {errors.company_address &&
                                typeof errors.company_address.message ===
                                    'string' && (
                                    <p className="text-sm text-destructive">
                                        {errors.company_address.message}
                                    </p>
                                )}
                        </div>

                        {/* Company Location */}
                        <div className="space-y-2">
                            <Label htmlFor="company_location">
                                Localisation de l&apos;entreprise *
                            </Label>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={getCurrentLocation}
                                disabled={locationLoading}
                                className="w-full cursor-pointer"
                            >
                                <MapPin className="mr-2 h-4 w-4" />
                                {locationLoading
                                    ? 'Récupération de la localisation...'
                                    : 'Obtenir la localisation'}
                            </Button>
                            {watch('company_location') && (
                                <p className="text-sm text-muted-foreground">
                                    Lat: {watch('company_location')?.latitude},
                                    Lon: {watch('company_location')?.longitude}
                                </p>
                            )}
                            {errors.company_location &&
                                typeof errors.company_location.message ===
                                    'string' && (
                                    <p className="text-sm text-destructive">
                                        {errors.company_location.message}
                                    </p>
                                )}
                        </div>

                        {/* Company Description */}
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="company_description">
                                Description de l&apos;entreprise *
                            </Label>
                            <Textarea
                                id="company_description"
                                {...register('company_description')}
                                className={cn(
                                    errors.company_description &&
                                        'border-destructive'
                                )}
                            />
                            {errors.company_description &&
                                typeof errors.company_description.message ===
                                    'string' && (
                                    <p className="text-sm text-destructive">
                                        {errors.company_description.message}
                                    </p>
                                )}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {step === 2 && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handlePreviousStep}
                            className="w-full sm:w-auto"
                            disabled={isLoading}
                        >
                            Précédent
                        </Button>
                    )}

                    {step === 1 && selectedRole === 'GESTIONNAIRE' && (
                        <Button
                            type="button"
                            onClick={handleNextStep}
                            className="w-full sm:w-auto"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <svg
                                        className="animate-spin h-5 w-5"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Enregistrement en cours...
                                </div>
                            ) : (
                                'Suivant'
                            )}
                        </Button>
                    )}

                    {(step === 1 && selectedRole === 'PARTICULIER') ||
                    step === 2 ? (
                        <Button
                            type="submit"
                            className="w-full sm:w-auto cursor-pointer"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <svg
                                        className="animate-spin h-5 w-5"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    {step === 2
                                        ? 'Finalisation en cours...'
                                        : 'Envoi en cours...'}
                                </div>
                            ) : step === 2 ? (
                                'Finaliser'
                            ) : (
                                'Soumettre'
                            )}
                        </Button>
                    ) : null}
                </div>
            </form>
        </div>
    );
}
