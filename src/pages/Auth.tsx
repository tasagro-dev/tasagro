
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp, resendConfirmation, requestPasswordReset } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleResendConfirmation = async () => {
    if (!email) {
      toast({
        title: 'Ingresá tu email',
        description: 'Necesitamos tu email para reenviar la confirmación.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const { error } = await resendConfirmation(email);
    setLoading(false);

    toast({
      title: error ? 'No se pudo reenviar' : 'Correo reenviado',
      description: error
        ? 'Revisá el email ingresado e intentá nuevamente.'
        : 'Si la cuenta existe, te enviamos un nuevo correo de confirmación.',
      variant: error ? 'destructive' : 'default',
    });
  };

  const handlePasswordReset = async () => {
    if (!email) {
      toast({
        title: 'Ingresá tu email',
        description: 'Necesitamos tu email para enviarte el enlace de recuperación.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const { error } = await requestPasswordReset(email);
    setLoading(false);

    toast({
      title: error ? 'No se pudo enviar' : 'Revisá tu correo',
      description: error
        ? 'Ocurrió un problema al generar el enlace de recuperación.'
        : 'Si la cuenta existe, te enviamos un enlace para restablecer tu contraseña.',
      variant: error ? 'destructive' : 'default',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp && password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let result;
      if (isSignUp) {
        result = await signUp(email, password);
        if (!result.error) {
          toast({
            title: "¡Registro exitoso!",
            description: "Tu cuenta ha sido creada. Ahora puedes iniciar sesión.",
          });
          setIsSignUp(false);
          setPassword('');
          setConfirmPassword('');
        }
      } else {
        result = await signIn(email, password);
        if (!result.error) {
          toast({
            title: "¡Bienvenido!",
            description: "Has iniciado sesión correctamente.",
          });
          navigate('/dashboard');
        }
      }

      if (result.error) {
        let errorMessage = "Ha ocurrido un error. Intenta nuevamente.";
        
        if (result.error.message.includes('Invalid login credentials')) {
          errorMessage = "No pudimos iniciar sesión. Verificá tu contraseña o usá 'Olvidé mi contraseña'.";
        } else if (result.error.message.includes('User already registered')) {
          errorMessage = "Este email ya está registrado. Intenta iniciar sesión.";
        } else if (result.error.message.includes('Email not confirmed')) {
          errorMessage = "Tu cuenta todavía no fue confirmada. Podés reenviar el correo de verificación abajo.";
        } else if (result.error.message.includes('weak_password') || result.error.message.includes('weak') || result.error.message.includes('pwned')) {
          errorMessage = "La contraseña es demasiado débil o común. Elegí una más segura con al menos 8 caracteres, combinando letras, números y símbolos.";
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ha ocurrido un error inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
          </CardTitle>
          <CardDescription className="text-center">
            {isSignUp 
              ? 'Completa tus datos para crear una cuenta' 
              : 'Ingresa tus credenciales para acceder'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
            </Button>

            {!isSignUp && (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                disabled={loading}
                onClick={handlePasswordReset}
              >
                Olvidé mi contraseña
              </Button>
            )}
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setPassword('');
                setConfirmPassword('');
              }}
              className="text-sm text-primary hover:underline"
              disabled={loading}
            >
              {isSignUp 
                ? '¿Ya tenés cuenta? Iniciá sesión' 
                : '¿No tenés cuenta? Registrate'
              }
            </button>

            {!isSignUp && (
              <button
                type="button"
                onClick={handleResendConfirmation}
                className="mt-3 text-sm text-primary hover:underline disabled:opacity-50"
                disabled={loading}
              >
                Reenviar correo de confirmación
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
