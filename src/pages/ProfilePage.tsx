import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

export default function ProfilePage() {
  const { user, updatePassword } = useAuth();
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      toast({ title: 'Erreur', description: 'Les mots de passe ne correspondent pas.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await updatePassword(newPassword);
    setLoading(false);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Mot de passe mis à jour' });
      setNewPassword('');
      setConfirm('');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground font-sans mb-8">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        <h1 className="font-serif text-2xl font-semibold text-foreground mb-8">Mon profil</h1>

        <div className="space-y-6">
          <div>
            <Label className="text-muted-foreground">Email</Label>
            <p className="text-foreground font-sans mt-1">{user?.email}</p>
          </div>

          <hr className="border-border" />

          <form onSubmit={handleChangePassword} className="space-y-4">
            <h2 className="font-serif text-lg font-semibold text-foreground">Changer le mot de passe</h2>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <Input id="new-password" type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" minLength={6} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmer</Label>
              <Input id="confirm-password" type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" minLength={6} />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Mise à jour…' : 'Mettre à jour'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
