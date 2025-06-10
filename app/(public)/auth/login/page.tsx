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
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner'; // ou ton système de toast
import { useState } from 'react';
import { useCustomRouter } from '@/core/useCustomRouter';
import { loginUser } from '@/core/loginUser';

const loginSchema = z.object({
    email: z.string().email('Adresse email invalide'),
    password: z
        .string()
        .min(8, 'Le mot de passe doit avoir au moins 8 caractères'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginForm: React.FC = () => {
    const router = useCustomRouter();
    const [error, setError] = useState<string | null>(null);
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const [loading, setLoading] = useState(false);

    const onSubmit = async (data: LoginFormData) => {
        setLoading(true);
        try {
            const result = await loginUser(data.email, data.password);
            if (!result.success) {
                setError(result.error || 'Erreur lors de la connexion');
                toast.error(result.error || 'Erreur lors de la connexion');
                return;
            }
            // Succès
            toast.success('Connexion réussie !');
            reset();
            router.push('/gestionnaire/dashboard');
        } catch (error) {
            let message = 'Erreur lors de la connexion';
            if (error instanceof Error) {
                if (error.message.includes('Failed to fetch')) {
                    message =
                        'Erreur réseau ou CORS : vérifiez la connexion ou la configuration du serveur.';
                } else {
                    message = error.message;
                }
            }
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto mt-8 bg-white shadow-lg my-4 p-6 rounded-lg">
            <CardHeader>
                <CardTitle className="text-2xl montserrat-bold text-gray-800">
                    Connexion
                </CardTitle>
                <CardDescription className="text-gray-500">
                    Veuillez entrer vos identifiants pour vous connecter à votre
                    compte
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                            className="mt-1 placeholder:text-gray-400"
                            placeholder="votre@email.com"
                            disabled={loading}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.email.message}
                            </p>
                        )}
                    </div>
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
                            disabled={loading}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.password.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <Label
                            htmlFor="remember"
                            className="flex items-center space-x-2"
                        >
                            <input
                                id="remember"
                                type="checkbox"
                                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                                disabled={loading}
                            />
                            <span className="montserrat-regular text-gray-600">
                                Se souvenir de moi
                            </span>
                        </Label>
                    </div>
                    <div>
                        {error && (
                            <p className="text-red-500 text-sm mt-1">{error}</p>
                        )}
                    </div>
                    <Button
                        type="submit"
                        className="w-full bg-primary text-white montserrat-bold hover:bg-[#357ABD]"
                        disabled={loading}
                    >
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </Button>
                </form>
            </CardContent>
            <CardFooter>
                <p className="text-sm text-gray-600">
                    Pas de compte ?{' '}
                    <button
                        type="button"
                        onClick={() => router.push('/auth/register')}
                        className="text-primary hover:underline"
                        disabled={loading}
                    >
                        Créer un compte
                    </button>
                </p>
            </CardFooter>
        </Card>
    );
};

export default LoginForm;
