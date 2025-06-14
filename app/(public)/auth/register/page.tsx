'use client';

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { z } from 'zod';
import PhoneInput, {
    getCountryCallingCode,
    Country as CountryCode,
} from 'react-phone-number-input';
import fr from 'react-phone-number-input/locale/fr';
import 'react-phone-number-input/style.css';
import { isValidPhoneNumber } from 'react-phone-number-input';
import { toast } from 'sonner';
import { useCustomRouter } from '@/core/useCustomRouter';
import { httpClient } from '@/core/httpClient';

// Schéma de validation
const registerSchema = z
    .object({
        firstName: z.string().min(1, 'Le prénom est requis'),
        lastName: z.string().min(1, 'Le nom est requis'),
        email: z.string().email('Adresse email invalide'),
        phone: z
            .string()
            .min(1, 'Le numéro de téléphone est requis')
            .refine(value => isValidPhoneNumber(value), {
                message:
                    'Numéro de téléphone invalide pour le pays sélectionné',
            }),
        password: z
            .string()
            .min(8, {
                message: 'Le mot de passe doit contenir au moins 8 caractères',
            })
            .regex(/[a-z]/, {
                message:
                    'Le mot de passe doit contenir au moins une lettre minuscule',
            })
            .regex(/[A-Z]/, {
                message:
                    'Le mot de passe doit contenir au moins une lettre majuscule',
            })
            .regex(/[0-9]/, {
                message: 'Le mot de passe doit contenir au moins un chiffre',
            })
            .max(100, {
                message: 'Le mot de passe ne peut pas dépasser 100 caractères',
            }),
        confirmPassword: z.string().min(1, 'Confirmez votre mot de passe'),
        acceptTerms: z.boolean().refine(val => val === true, {
            message: 'Vous devez accepter les conditions d’utilisation',
        }),
    })
    .refine(data => data.password === data.confirmPassword, {
        message: 'Les mots de passe ne correspondent pas',
        path: ['confirmPassword'],
    });

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterForm: React.FC = () => {
    const router = useCustomRouter();
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control,
        watch,
        setValue,
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
            acceptTerms: false,
        },
    });

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<CountryCode>('FR');
    const [phoneNumber, setPhoneNumber] = useState<string>('');

    const acceptTerms = watch('acceptTerms');
    const passwordCriteria = [
        'Au moins 8 caractères',
        'Au moins une lettre minuscule',
        'Au moins une lettre majuscule',
        'Au moins un chiffre',
        'Maximum 100 caractères',
    ];

    const onSubmit = async (data: RegisterFormData) => {
        setLoading(true);
        setErrorMessage(null);
        try {
            await httpClient.post('/auth/register', {
                body: {
                    nom: data.firstName,
                    prenom: data.lastName,
                    email: data.email,
                    telephone: data.phone,
                    motDePasse: data.password,
                },
            });

            reset();
            toast.success(
                'Inscription réussie ! Vous pouvez maintenant vous connecter.'
            );
            router.push('/auth/login');
        } catch (error) {
            let message = 'Erreur lors de l’inscription';
            if (error instanceof Error) {
                if (error.message.includes('Failed to fetch')) {
                    message =
                        'Erreur réseau ou CORS : vérifiez la connexion ou la configuration du serveur.';
                } else {
                    message = error.message;
                }
            }
            setErrorMessage(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto my-8 bg-white shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl montserrat-bold text-gray-800">
                    Inscription
                </CardTitle>
                <CardDescription className="text-gray-500">
                    Créez un compte pour accéder à GestiLoc
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {errorMessage && (
                    <p className="text-red-500 text-sm text-center">
                        {errorMessage}
                    </p>
                )}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Autres champs inchangés */}
                    <div>
                        <Label
                            htmlFor="firstName"
                            className="montserrat-regular text-gray-600"
                        >
                            Prénom
                        </Label>
                        <Input
                            id="firstName"
                            {...register('firstName')}
                            className="mt-1"
                            placeholder="Jean"
                        />
                        {errors.firstName && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.firstName.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <Label
                            htmlFor="lastName"
                            className="montserrat-regular text-gray-600"
                        >
                            Nom
                        </Label>
                        <Input
                            id="lastName"
                            {...register('lastName')}
                            className="mt-1"
                            placeholder="Dupont"
                        />
                        {errors.lastName && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.lastName.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <Label
                            htmlFor="email"
                            className="montserrat-regular text-gray-600"
                        >
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            {...register('email')}
                            className="mt-1"
                            placeholder="votre@email.com"
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Champ de numéro de téléphone */}
                    <div>
                        <Label
                            htmlFor="phone"
                            className="montserrat-regular text-gray-600"
                        >
                            Numéro de téléphone
                        </Label>
                        <div className="flex items-center space-x-2 mt-1">
                            <Controller
                                name="phone"
                                control={control}
                                render={() => (
                                    <>
                                        {/* Sélecteur de pays */}
                                        <PhoneInput
                                            international
                                            defaultCountry="FR"
                                            labels={fr}
                                            value={`+${getCountryCallingCode(selectedCountry)}`}
                                            onChange={() => {}}
                                            onCountryChange={country => {
                                                if (country) {
                                                    setSelectedCountry(
                                                        country as CountryCode
                                                    );
                                                    const fullNumber = `+${getCountryCallingCode(country)}${phoneNumber}`;
                                                    setValue(
                                                        'phone',
                                                        fullNumber,
                                                        { shouldValidate: true }
                                                    );
                                                }
                                            }}
                                            countrySelectProps={{
                                                disabled: false,
                                            }}
                                            className="w-32 border border-gray-300 rounded-md p-2 font-montserrat-regular focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            numberInputProps={{
                                                style: { display: 'none' },
                                            }} // Masquer le champ de numéro
                                        />
                                        {/* Indicatif non éditable */}
                                        <span className="text-gray-600 font-montserrat-regular px-2">
                                            +
                                            {getCountryCallingCode(
                                                selectedCountry
                                            )}
                                        </span>
                                        {/* Champ pour saisir le numéro */}
                                        <Input
                                            id="phoneNumber"
                                            type="tel"
                                            placeholder="123456789"
                                            value={phoneNumber}
                                            onChange={e => {
                                                const number =
                                                    e.target.value.replace(
                                                        /[^0-9]/g,
                                                        ''
                                                    ); // Accepter uniquement les chiffres
                                                setPhoneNumber(number);
                                                const fullNumber = `+${getCountryCallingCode(selectedCountry)}${number}`;
                                                setValue('phone', fullNumber, {
                                                    shouldValidate: true,
                                                });
                                            }}
                                            className="flex-1"
                                        />
                                    </>
                                )}
                            />
                        </div>
                        {errors.phone && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.phone.message}
                            </p>
                        )}
                    </div>

                    {/* Autres champs inchangés */}
                    <div>
                        <Label
                            htmlFor="password"
                            className="montserrat-regular text-gray-600"
                        >
                            Mot de passe
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            {...register('password')}
                            className="mt-1"
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.password.message}
                            </p>
                        )}
                        <div className="mt-2 p-2 rounded bg-gray-100 text-xs text-gray-600 border border-gray-200">
                            <span className="font-semibold block mb-1">
                                Le mot de passe doit contenir :
                            </span>
                            <ul className="list-disc pl-5 space-y-0.5">
                                {passwordCriteria.map((crit, idx) => (
                                    <li key={idx}>{crit}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div>
                        <Label
                            htmlFor="confirmPassword"
                            className="montserrat-regular text-gray-600"
                        >
                            Confirmer le mot de passe
                        </Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            {...register('confirmPassword')}
                            className="mt-1"
                        />
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="acceptTerms"
                            checked={acceptTerms}
                            onCheckedChange={checked =>
                                setValue('acceptTerms', checked === true)
                            }
                        />
                        <Label
                            htmlFor="acceptTerms"
                            className="montserrat-regular text-gray-600 text-sm"
                        >
                            J’accepte les{' '}
                            <a
                                href="/terms"
                                className="text-primary hover:underline"
                            >
                                conditions d’utilisation
                            </a>
                        </Label>
                    </div>
                    {errors.acceptTerms && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.acceptTerms.message}
                        </p>
                    )}
                    <Button
                        type="submit"
                        className="w-full bg-primary text-white montserrat-bold hover:bg-primary/80 transition-all duration-200 cursor-pointer"
                        disabled={loading}
                    >
                        {loading ? 'Chargement...' : 'Créer un compte'}
                    </Button>
                </form>
            </CardContent>
            <CardFooter>
                <p className="text-sm text-gray-600">
                    Déjà un compte ?{' '}
                    <button
                        type="button"
                        onClick={() => router.push('/auth/login')}
                        className="text-primary hover:underline"
                    >
                        Se connecter
                    </button>
                </p>
            </CardFooter>
        </Card>
    );
};

export default RegisterForm;
