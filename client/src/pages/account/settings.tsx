import AccountLayout from '@/components/AccountLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2, MapPin, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const settingsSchema = z.object({
  first_name: z.string().min(1, 'Meno je povinné'),
  last_name: z.string().min(1, 'Priezvisko je povinné'),
  phone: z.string().optional(),
  billing_street: z.string().optional(),
  billing_city: z.string().optional(),
  billing_zip: z.string().optional(),
  billing_country: z.string().optional(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export default function AccountSettings() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  useDocumentTitle('Nastavenia účtu');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      billing_country: 'SK',
    },
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from('customers')
      .select('first_name, last_name, phone, billing_street, billing_city, billing_zip, billing_country')
      .eq('auth_user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          reset({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            phone: data.phone || '',
            billing_street: data.billing_street || '',
            billing_city: data.billing_city || '',
            billing_zip: data.billing_zip || '',
            billing_country: data.billing_country || 'SK',
          });
        }
      });
  }, [user, reset]);

  const onSubmit = async (data: SettingsForm) => {
    if (!user) return;
    setIsSaving(true);
    setSaved(false);

    const { error } = await supabase
      .from('customers')
      .upsert({
        auth_user_id: user.id,
        email: user.email,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone || null,
        billing_street: data.billing_street || null,
        billing_city: data.billing_city || null,
        billing_zip: data.billing_zip || null,
        billing_country: data.billing_country || 'SK',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'auth_user_id' });

    setIsSaving(false);

    if (error) {
      toast.error('Nepodarilo sa uložiť zmeny');
    } else {
      setSaved(true);
      toast.success('Nastavenia boli uložené');
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <AccountLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nastavenia účtu</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Uložte si kontaktné údaje a adresu — pri ďalšom nákupe ich automaticky predvyplníme v košíku.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <h2 className="font-semibold text-base text-foreground">Osobné údaje</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="first_name">Meno</Label>
                <Input
                  id="first_name"
                  {...register('first_name')}
                  className="mt-1.5"
                  placeholder="Ján"
                />
                {errors.first_name && (
                  <p className="mt-1 text-xs text-destructive">{errors.first_name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="last_name">Priezvisko</Label>
                <Input
                  id="last_name"
                  {...register('last_name')}
                  className="mt-1.5"
                  placeholder="Novák"
                />
                {errors.last_name && (
                  <p className="mt-1 text-xs text-destructive">{errors.last_name.message}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="phone">Telefón</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  className="mt-1.5"
                  placeholder="+421 900 000 000"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h2 className="font-semibold text-base text-foreground">Doručovacia adresa</h2>
                <p className="text-xs text-muted-foreground">Predvyplní sa automaticky pri dokončovaní objednávky</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="billing_street">Ulica a číslo</Label>
                <Input
                  id="billing_street"
                  {...register('billing_street')}
                  className="mt-1.5"
                  placeholder="Hlavná 123"
                />
              </div>

              <div>
                <Label htmlFor="billing_city">Mesto</Label>
                <Input
                  id="billing_city"
                  {...register('billing_city')}
                  className="mt-1.5"
                  placeholder="Bratislava"
                />
              </div>

              <div>
                <Label htmlFor="billing_zip">PSČ</Label>
                <Input
                  id="billing_zip"
                  {...register('billing_zip')}
                  className="mt-1.5"
                  placeholder="81101"
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="billing_country">Krajina</Label>
                <Input
                  id="billing_country"
                  {...register('billing_country')}
                  className="mt-1.5"
                  placeholder="SK"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-4">
            <Button
              type="submit"
              disabled={isSaving}
              className="min-w-[160px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ukladám...
                </>
              ) : saved ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Uložené
                </>
              ) : (
                'Uložiť zmeny'
              )}
            </Button>
          </div>
        </form>
      </div>
    </AccountLayout>
  );
}
