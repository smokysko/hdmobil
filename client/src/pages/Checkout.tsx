import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, CreditCard, Truck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { z } from "zod";

const checkoutSchema = z.object({
  email: z.string().email("Neplatná emailová adresa"),
  firstName: z.string().min(2, "Meno je povinné"),
  lastName: z.string().min(2, "Priezvisko je povinné"),
  address: z.string().min(5, "Adresa je povinná"),
  city: z.string().min(2, "Mesto je povinné"),
  zipCode: z.string().min(3, "PSČ je povinné"),
  country: z.string().min(2, "Krajina je povinná"),
  cardNumber: z.string().min(16, "Neplatné číslo karty").max(19),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, "Neplatný dátum platnosti (MM/RR)"),
  cvc: z.string().min(3, "Neplatné CVC").max(4),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { items, cartTotal, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
  });

  const shipping = cartTotal > 500 ? 0 : 15;
  const tax = cartTotal * 0.08;
  const total = cartTotal + shipping + tax;

  const onSubmit = async (data: CheckoutForm) => {
    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log("Order submitted:", { ...data, items, total });
    toast.success("Objednávka bola úspešne odoslaná!");
    clearCart();
    setLocation("/success");
  };

  if (items.length === 0) {
    setLocation("/cart");
    return null;
  }

  return (
    <Layout>
      <div className="container py-12 md:py-20">
        <h1 className="mb-8 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Pokladňa
        </h1>

        <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Contact & Shipping */}
              <Card className="border-border bg-card shadow-sm rounded-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 font-display text-xl font-bold">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary">
                      <Truck className="h-5 w-5" />
                    </div>
                    Doručovacie údaje
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 sm:grid-cols-2 pt-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="email">Emailová adresa</Label>
                    <Input id="email" {...register("email")} className="mt-1.5" placeholder="john@example.com" />
                    {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="firstName">Meno</Label>
                    <Input id="firstName" {...register("firstName")} className="mt-1.5" placeholder="John" />
                    {errors.firstName && <p className="mt-1 text-xs text-destructive">{errors.firstName.message}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="lastName">Priezvisko</Label>
                    <Input id="lastName" {...register("lastName")} className="mt-1.5" placeholder="Doe" />
                    {errors.lastName && <p className="mt-1 text-xs text-destructive">{errors.lastName.message}</p>}
                  </div>
                  
                  <div className="sm:col-span-2">
                    <Label htmlFor="address">Adresa</Label>
                    <Input id="address" {...register("address")} className="mt-1.5" placeholder="123 Tech Street" />
                    {errors.address && <p className="mt-1 text-xs text-destructive">{errors.address.message}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="city">Mesto</Label>
                    <Input id="city" {...register("city")} className="mt-1.5" placeholder="Silicon Valley" />
                    {errors.city && <p className="mt-1 text-xs text-destructive">{errors.city.message}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="zipCode">PSČ</Label>
                    <Input id="zipCode" {...register("zipCode")} className="mt-1.5" placeholder="94000" />
                    {errors.zipCode && <p className="mt-1 text-xs text-destructive">{errors.zipCode.message}</p>}
                  </div>
                  
                  <div className="sm:col-span-2">
                    <Label htmlFor="country">Krajina</Label>
                    <Input id="country" {...register("country")} className="mt-1.5" placeholder="United States" />
                    {errors.country && <p className="mt-1 text-xs text-destructive">{errors.country.message}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Payment */}
              <Card className="border-border bg-card shadow-sm rounded-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 font-display text-xl font-bold">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    Spôsob platby
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 pt-2">
                  <RadioGroup defaultValue="card" className="grid grid-cols-3 gap-4">
                    <div>
                      <RadioGroupItem value="card" id="card" className="peer sr-only" />
                      <Label
                        htmlFor="card"
                        className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-secondary hover:text-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary transition-all cursor-pointer"
                      >
                        <CreditCard className="mb-3 h-6 w-6" />
                        Karta
                      </Label>
                    </div>
                    {/* Add more payment methods if needed */}
                  </RadioGroup>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label htmlFor="cardNumber">Číslo karty</Label>
                      <Input id="cardNumber" {...register("cardNumber")} className="mt-1.5" placeholder="0000 0000 0000 0000" />
                      {errors.cardNumber && <p className="mt-1 text-xs text-destructive">{errors.cardNumber.message}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="expiryDate">Dátum platnosti</Label>
                      <Input id="expiryDate" {...register("expiryDate")} className="mt-1.5" placeholder="MM/YY" />
                      {errors.expiryDate && <p className="mt-1 text-xs text-destructive">{errors.expiryDate.message}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="cvc">CVC</Label>
                      <Input id="cvc" {...register("cvc")} className="mt-1.5" placeholder="123" />
                      {errors.cvc && <p className="mt-1 text-xs text-destructive">{errors.cvc.message}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" size="lg" className="w-full font-display tracking-wide h-14 text-lg rounded-full shadow-lg hover:shadow-xl transition-all" disabled={isProcessing}>
                {isProcessing ? "SPRACOVÁVA SA..." : `ZAPLATIŤ ${total.toFixed(2)} €`}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-3xl border border-border bg-card p-8 shadow-sm">
              <h2 className="font-display text-xl font-bold text-foreground mb-6">Súhrn objednávky</h2>
              
              <div className="space-y-6 mb-8">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-border bg-secondary/30 p-2">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold line-clamp-1 text-foreground">{item.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">Množstvo: {item.quantity}</p>
                      <p className="text-sm font-bold text-foreground mt-1">{(item.salePrice || item.price) * item.quantity} €</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator className="bg-border/50 mb-4" />
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Medzisúčet</span>
                  <span className="font-medium">{cartTotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Doprava</span>
                    <span className="font-medium">
                      {shipping === 0 ? "Zdarma" : `${shipping.toFixed(2)} €`}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Odhadovaná daň</span>
                  <span className="font-medium">{tax.toFixed(2)} €</span>
                </div>
                
                <Separator className="bg-border/50 my-2" />
                
                <div className="flex justify-between text-xl font-bold">
                  <span>Spolu</span>
                  <span className="text-foreground">{total.toFixed(2)} €</span>
                </div>
              </div>
              
              <div className="mt-8 rounded-2xl bg-secondary/30 p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Bezpečná platba</h4>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      Vaše platobné údaje sú šifrované a v bezpečí. Nikdy neukladáme údaje o vašej kreditnej karte.
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
