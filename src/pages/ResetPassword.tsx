import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ShieldCheck } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updatePassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isRecoveryFlow = useMemo(() => {
    const hash = window.location.hash.replace('#', '');
    const params = new URLSearchParams(hash);
    return params.get('type') === 'recovery';
  }, []);

  useEffect(() => {
    if (!isRecoveryFlow) {
      toast({
        title: 'Enlace inválido',
        description: 'Solicitá un nuevo correo para restablecer tu contraseña.',
        variant: 'destructive',
      });
    }
  }, [isRecoveryFlow, toast]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Las contraseñas no coinciden.',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: 'Error',
        description: 'La nueva contraseña debe tener al menos 8 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const { error } = await updatePassword(password);

    setLoading(false);

    if (error) {
      toast({
        title: 'No se pudo actualizar',
        description: 'Pedí un nuevo enlace e intentá nuevamente.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Contraseña actualizada',
      description: 'Ya podés iniciar sesión con tu nueva contraseña.',
    });

    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-center">Restablecer contraseña</CardTitle>
          <CardDescription className="text-center">
            Elegí una nueva clave para volver a entrar a Tasagro.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isRecoveryFlow && (
            <Alert variant="destructive">
              <AlertTitle>Enlace vencido o inválido</AlertTitle>
              <AlertDescription>
                Volvé a la pantalla de acceso y pedí un nuevo correo de recuperación.
              </AlertDescription>
            </Alert>
          )}

          {isRecoveryFlow && (
            <Alert>
              <ShieldCheck className="h-4 w-4" />
              <AlertTitle>Protegé tu cuenta</AlertTitle>
              <AlertDescription>
                Usá una contraseña nueva y distinta a la anterior.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nueva contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || !isRecoveryFlow}
                minLength={8}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading || !isRecoveryFlow}
                minLength={8}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading || !isRecoveryFlow}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar nueva contraseña
            </Button>
          </form>

          <Button type="button" variant="ghost" className="w-full" onClick={() => navigate('/auth')}>
            Volver al inicio de sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;