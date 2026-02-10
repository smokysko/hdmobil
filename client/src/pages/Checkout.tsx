import { DiscountCodeInput } from "@/components/DiscountCodeInput";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { Banknote, Building2, CheckCircle2, CreditCard, Truck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { z } from "zod";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const checkoutSchema = z.object({
  email: z.string().email("Neplatna emailova adresa"),
  firstName: z.string().min(2, "Meno je povinne"),
  lastName: z.string().min(2, "Priezvisko je povinne"),
  phone: z.string().optional(),
  address: z.string().min(5, "Adresa je povinna"),
  city: z.string().min(2, "Mesto je povinne"),
  zipCode: z.string().min(3, "PSC je povinne"),
  country: z.string().min(2, "Krajina je povinna"),
  paymentMethod: z.enum(["bank_transfer", "cod"]),
  note: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { items, cartTotal, clearCart, appliedDiscount, discountAmount } = useCart();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  useDocumentTitle('Pokladňa');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      country: "Slovensko",
      paymentMethod: "bank_transfer",
    },
  });

  const selectedPayment = watch("paymentMethod");
  const shipping = cartTotal > 100 ? 0 : 4.99;
  const codFee = selectedPayment === "cod" ? 1.5 : 0;
  const total = cartTotal + shipping + codFee - discountAmount;

  const onSubmit = async (data: CheckoutForm) => {
    setIsProcessing(true);

    try {
      const orderItems = items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }));

      const { data: result, error: fnError } = await supabase.functions.invoke('orders/create', {
        body: {
          items: orderItems,
          billingFirstName: data.firstName,
          billingLastName: data.lastName,
          billingEmail: data.email,
          billingPhone: data.phone,
          billingStreet: data.address,
          billingCity: data.city,
          billingZip: data.zipCode,
          billingCountry: data.country === "Slovensko" ? "SK" : data.country,
          customerNote: data.note,
          discountCode: appliedDiscount?.code,
        },
      });

      if (fnError) {
        throw new Error("Nepodarilo sa vytvoriť objednávku");
      }

      if (!result.success) {
        throw new Error(result.error || "Nepodarilo sa vytvoriť objednávku");
      }

      toast.success("Objednávka bola úspešne odoslaná!");
      clearCart();
      setLocation(
        `/success?orderId=${result.data.orderId}&orderNumber=${encodeURIComponent(result.data.orderNumber)}`
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nastala chyba pri odosielaní objednávky");
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    setLocation("/cart");
    return null;
  }

  return (
    <Layout>
      <div className="container py-12 md:py-20">
        <h1 className="mb-8 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Pokladna
        </h1>

        <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <Card className="rounded-2xl border-border bg-card shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 font-display text-xl font-bold">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary">
                      <Truck className="h-5 w-5" />
                    </div>
                    Dorucovacia adresa
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 pt-2 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="email">Emailova adresa</Label>
                    <Input
                      id="email"
                      {...register("email")}
                      className="mt-1.5"
                      placeholder="vas@email.sk"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="firstName">Meno</Label>
                    <Input
                      id="firstName"
                      {...register("firstName")}
                      className="mt-1.5"
                      placeholder="Jan"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-xs text-destructive">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="lastName">Priezvisko</Label>
                    <Input
                      id="lastName"
                      {...register("lastName")}
                      className="mt-1.5"
                      placeholder="Novak"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-xs text-destructive">{errors.lastName.message}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="phone">Telefon (volitelne)</Label>
                    <Input
                      id="phone"
                      {...register("phone")}
                      className="mt-1.5"
                      placeholder="+421 900 000 000"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="address">Ulica a cislo</Label>
                    <Input
                      id="address"
                      {...register("address")}
                      className="mt-1.5"
                      placeholder="Hlavna 123"
                    />
                    {errors.address && (
                      <p className="mt-1 text-xs text-destructive">{errors.address.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="city">Mesto</Label>
                    <Input
                      id="city"
                      {...register("city")}
                      className="mt-1.5"
                      placeholder="Bratislava"
                    />
                    {errors.city && (
                      <p className="mt-1 text-xs text-destructive">{errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="zipCode">PSC</Label>
                    <Input
                      id="zipCode"
                      {...register("zipCode")}
                      className="mt-1.5"
                      placeholder="81101"
                    />
                    {errors.zipCode && (
                      <p className="mt-1 text-xs text-destructive">{errors.zipCode.message}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="country">Krajina</Label>
                    <Input
                      id="country"
                      {...register("country")}
                      className="mt-1.5"
                      placeholder="Slovensko"
                    />
                    {errors.country && (
                      <p className="mt-1 text-xs text-destructive">{errors.country.message}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="note">Poznamka k objednavke (volitelne)</Label>
                    <Input
                      id="note"
                      {...register("note")}
                      className="mt-1.5"
                      placeholder="Napr. zazvonit 2x"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border bg-card shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 font-display text-xl font-bold">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    Sposob platby
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <RadioGroup
                    value={selectedPayment}
                    onValueChange={(value) =>
                      setValue("paymentMethod", value as "bank_transfer" | "cod")
                    }
                    className="grid gap-4 sm:grid-cols-2"
                  >
                    <div>
                      <RadioGroupItem value="bank_transfer" id="bank_transfer" className="peer sr-only" />
                      <Label
                        htmlFor="bank_transfer"
                        className="flex cursor-pointer flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 transition-all hover:bg-secondary hover:text-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary"
                      >
                        <Building2 className="mb-3 h-6 w-6" />
                        <span className="font-medium">Bankovy prevod</span>
                        <span className="mt-1 text-xs text-muted-foreground">Zdarma</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="cod" id="cod" className="peer sr-only" />
                      <Label
                        htmlFor="cod"
                        className="flex cursor-pointer flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 transition-all hover:bg-secondary hover:text-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary"
                      >
                        <Banknote className="mb-3 h-6 w-6" />
                        <span className="font-medium">Dobierka</span>
                        <span className="mt-1 text-xs text-muted-foreground">+1,50 EUR</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              <Button
                type="submit"
                size="lg"
                className="h-14 w-full rounded-full font-display text-lg tracking-wide shadow-lg transition-all hover:shadow-xl"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Spinner className="mr-2 h-5 w-5" />
                    SPRACOVAVA SA...
                  </>
                ) : (
                  `ODOSLAT OBJEDNAVKU - ${total.toFixed(2)} EUR`
                )}
              </Button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-3xl border border-border bg-card p-8 shadow-sm">
              <h2 className="mb-6 font-display text-xl font-bold text-foreground">Suhrn objednavky</h2>

              <div className="mb-8 space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-border bg-secondary/30 p-2">
                      <img src={item.image} alt={item.name} className="h-full w-full object-contain" />
                    </div>
                    <div className="flex-1">
                      <h4 className="line-clamp-1 text-sm font-bold text-foreground">{item.name}</h4>
                      <p className="mt-1 text-xs text-muted-foreground">Mnozstvo: {item.quantity}</p>
                      <p className="mt-1 text-sm font-bold text-foreground">
                        {((item.salePrice || item.price) * item.quantity).toFixed(2)} EUR
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <DiscountCodeInput />
              </div>

              <Separator className="mb-4 bg-border/50" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Medzisucet (s DPH)</span>
                  <span className="font-medium">{cartTotal.toFixed(2)} EUR</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-primary">
                    <span>Zlava ({appliedDiscount?.code})</span>
                    <span className="font-medium">-{discountAmount.toFixed(2)} EUR</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Doprava</span>
                  <span className="font-medium">{shipping === 0 ? "Zdarma" : `${shipping.toFixed(2)} EUR`}</span>
                </div>
                {codFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Dobierka</span>
                    <span className="font-medium">{codFee.toFixed(2)} EUR</span>
                  </div>
                )}

                <Separator className="my-2 bg-border/50" />

                <div className="flex justify-between text-xl font-bold">
                  <span>Spolu</span>
                  <span className="text-foreground">{total.toFixed(2)} EUR</span>
                </div>
              </div>

              <div className="mt-8 rounded-2xl bg-secondary/30 p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Bezpecny nakup</h4>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      Vase udaje su v bezpeci. Po odoslani objednavky vam pride email s pokynmi k platbe a
                      fakturou.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
