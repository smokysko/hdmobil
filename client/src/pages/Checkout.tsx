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
import { useShippingMethods, usePaymentMethods } from "@/hooks/useShipping";
import type { ShippingMethod, PaymentMethod } from "@/services/shipping";
import { supabase } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Banknote,
  Building2,
  CheckCircle2,
  CreditCard,
  MapPin,
  Package,
  Smartphone,
  Store,
  Truck,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { z } from "zod";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

declare global {
  interface Window {
    Packeta: {
      Widget: {
        pick: (
          apiKey: string,
          callback: (point: PacketaWidgetPoint | null) => void,
          options?: { country?: string; zboxOnly?: boolean }
        ) => void;
      };
    };
  }
}

interface PacketaWidgetPoint {
  id: number;
  name: string;
  nameStreet: string;
  street: string;
  city: string;
  zip: string;
  country: string;
}

interface PacketaPoint {
  id: string;
  name: string;
  address: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const PACKETA_API_KEY = import.meta.env.VITE_PACKETA_API_KEY as string;

const checkoutSchema = z.object({
  email: z.string().email("Neplatná emailová adresa"),
  firstName: z.string().min(2, "Meno je povinné"),
  lastName: z.string().min(2, "Priezvisko je povinné"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  note: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

function getShippingIcon(code: string) {
  if (code === "packeta_zbox") return <MapPin className="h-5 w-5" />;
  if (code === "packeta_home") return <Package className="h-5 w-5" />;
  if (code === "personal") return <Store className="h-5 w-5" />;
  return <Truck className="h-5 w-5" />;
}

function getPaymentIcon(code: string) {
  if (code === "bank_transfer") return <Building2 className="mb-3 h-6 w-6" />;
  if (code === "cod") return <Banknote className="mb-3 h-6 w-6" />;
  if (code === "google_pay" || code === "apple_pay") return <Smartphone className="mb-3 h-6 w-6" />;
  return <CreditCard className="mb-3 h-6 w-6" />;
}

export default function Checkout() {
  const { items, cartTotal, clearCart, appliedDiscount, discountAmount } = useCart();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState<ShippingMethod | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [packetaPoint, setPacketaPoint] = useState<PacketaPoint | null>(null);
  const [shippingError, setShippingError] = useState("");
  const [packetaError, setPacketaError] = useState("");

  const { data: shippingMethods = [], isLoading: shippingLoading } = useShippingMethods();
  const { data: paymentMethods = [], isLoading: paymentLoading } = usePaymentMethods();

  useDocumentTitle("Pokladňa");

  useEffect(() => {
    if (document.getElementById("packeta-widget-script")) return;
    const script = document.createElement("script");
    script.id = "packeta-widget-script";
    script.src = "https://widget.packeta.com/v6/www/js/library.js";
    script.async = true;
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (shippingMethods.length > 0 && !selectedShipping) {
      setSelectedShipping(shippingMethods[0]);
    }
  }, [shippingMethods, selectedShipping]);

  useEffect(() => {
    if (paymentMethods.length > 0 && !selectedPayment) {
      setSelectedPayment(paymentMethods[0]);
    }
  }, [paymentMethods, selectedPayment]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { country: "SK" },
  });

  const isPacketaZbox = selectedShipping?.code === "packeta_zbox";

  const shippingCost =
    selectedShipping
      ? selectedShipping.free_shipping_threshold !== null &&
        cartTotal >= selectedShipping.free_shipping_threshold
        ? 0
        : Number(selectedShipping.price)
      : 0;

  const paymentFee = selectedPayment ? Number(selectedPayment.fee_fixed) : 0;
  const total = cartTotal + shippingCost + paymentFee - discountAmount;

  function openPacketaWidget() {
    if (!window.Packeta?.Widget) {
      toast.error("Packeta widget sa načítava, skúste o chvíľu znova");
      return;
    }
    window.Packeta.Widget.pick(
      PACKETA_API_KEY,
      (point) => {
        if (point) {
          setPacketaPoint({
            id: String(point.id),
            name: point.name,
            address: point.nameStreet || `${point.street}, ${point.city}`,
          });
          setPacketaError("");
        }
      },
      { country: "sk", zboxOnly: true }
    );
  }

  const onSubmit = async (data: CheckoutForm) => {
    if (!selectedShipping) {
      setShippingError("Vyberte spôsob dopravy");
      return;
    }
    setShippingError("");

    if (!isPacketaZbox) {
      if (!data.address || !data.city || !data.zipCode) {
        toast.error("Vyplňte doručovaciu adresu");
        return;
      }
    } else if (!packetaPoint) {
      setPacketaError("Vyberte Z-BOX odberné miesto");
      return;
    }
    setPacketaError("");

    setIsProcessing(true);
    try {
      const orderItems = items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }));

      const { data: result, error: fnError } = await supabase.functions.invoke("orders/create", {
        body: {
          items: orderItems,
          billingFirstName: data.firstName,
          billingLastName: data.lastName,
          billingEmail: data.email,
          billingPhone: data.phone,
          billingStreet: data.address || "",
          billingCity: data.city || "",
          billingZip: data.zipCode || "",
          billingCountry: data.country || "SK",
          shippingMethodId: selectedShipping.id,
          paymentMethodId: selectedPayment?.id,
          customerNote: data.note,
          discountCode: appliedDiscount?.code,
          packetaPointId: packetaPoint?.id || null,
          packetaPointName: packetaPoint?.name || null,
        },
      });

      if (fnError) throw new Error("Nepodarilo sa vytvoriť objednávku");
      if (!result.success) throw new Error(result.error || "Nepodarilo sa vytvoriť objednávku");

      clearCart();

      const isCardPayment =
        selectedPayment?.code === "card" ||
        selectedPayment?.code === "google_pay" ||
        selectedPayment?.code === "apple_pay";

      if (isCardPayment) {
        const origin = window.location.origin;
        const paymentRes = await fetch(`${SUPABASE_URL}/functions/v1/payments/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            apikey: SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            orderId: result.data.orderId,
            method: selectedPayment.code,
            returnUrl: `${origin}/success`,
            cancelUrl: `${origin}/checkout`,
          }),
        });

        const paymentResult = await paymentRes.json();
        if (!paymentResult.success || !paymentResult.data?.paymentUrl) {
          throw new Error(paymentResult.error || "Nepodarilo sa inicializovať platobnú bránu");
        }
        window.location.href = paymentResult.data.paymentUrl;
        return;
      }

      toast.success("Objednávka bola úspešne odoslaná!");
      setLocation(
        `/success?orderId=${result.data.orderId}&orderNumber=${encodeURIComponent(result.data.orderNumber)}`
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Nastala chyba pri odosielaní objednávky"
      );
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
          Pokladňa
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
                    Kontaktné údaje
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 pt-2 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="email">Emailová adresa</Label>
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
                      placeholder="Ján"
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
                      placeholder="Novák"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-xs text-destructive">{errors.lastName.message}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="phone">Telefón</Label>
                    <Input
                      id="phone"
                      {...register("phone")}
                      className="mt-1.5"
                      placeholder="+421 900 000 000"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border bg-card shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 font-display text-xl font-bold">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary">
                      <Package className="h-5 w-5" />
                    </div>
                    Spôsob dopravy
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  {shippingLoading ? (
                    <div className="flex justify-center py-4">
                      <Spinner className="h-5 w-5" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {shippingMethods.map((method) => {
                        const effectivePrice =
                          method.free_shipping_threshold !== null &&
                          cartTotal >= method.free_shipping_threshold
                            ? 0
                            : Number(method.price);
                        const isSelected = selectedShipping?.id === method.id;
                        return (
                          <label
                            key={method.id}
                            className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                              isSelected
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/40 hover:bg-secondary/30"
                            }`}
                            onClick={() => {
                              setSelectedShipping(method);
                              setShippingError("");
                              if (method.code !== "packeta_zbox") setPacketaPoint(null);
                            }}
                          >
                            <div
                              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${
                                isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                              }`}
                            >
                              {getShippingIcon(method.code)}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{method.name_sk}</p>
                              {method.description_sk && (
                                <p className="text-xs text-muted-foreground">{method.description_sk}</p>
                              )}
                              {method.delivery_days_min !== null && (
                                <p className="text-xs text-muted-foreground">
                                  Doručenie za {method.delivery_days_min}
                                  {method.delivery_days_max && method.delivery_days_max !== method.delivery_days_min
                                    ? `–${method.delivery_days_max}`
                                    : ""}{" "}
                                  {method.delivery_days_max === 0 ? "deň" : "pracovné dni"}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              {effectivePrice === 0 ? (
                                <span className="font-semibold text-primary">Zdarma</span>
                              ) : (
                                <span className="font-semibold text-foreground">
                                  {effectivePrice.toFixed(2)} EUR
                                </span>
                              )}
                              {method.free_shipping_threshold !== null && effectivePrice > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  Zdarma od {method.free_shipping_threshold} EUR
                                </p>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                  {shippingError && (
                    <p className="mt-2 text-xs text-destructive">{shippingError}</p>
                  )}

                  {isPacketaZbox && (
                    <div className="mt-4 rounded-xl border border-border bg-secondary/20 p-4">
                      <p className="mb-3 text-sm font-medium text-foreground">
                        Odberné miesto Z-BOX
                      </p>
                      {packetaPoint ? (
                        <div className="flex items-start justify-between gap-3 rounded-lg bg-card p-3 shadow-sm">
                          <div className="flex items-start gap-3">
                            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {packetaPoint.name}
                              </p>
                              <p className="text-xs text-muted-foreground">{packetaPoint.address}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPacketaPoint(null)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={openPacketaWidget}
                        >
                          <MapPin className="mr-2 h-4 w-4" />
                          Vybrať Z-BOX
                        </Button>
                      )}
                      {packetaError && (
                        <p className="mt-2 text-xs text-destructive">{packetaError}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {!isPacketaZbox && (
                <Card className="rounded-2xl border-border bg-card shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 font-display text-xl font-bold">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary">
                        <MapPin className="h-5 w-5" />
                      </div>
                      Doručovacia adresa
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-6 pt-2 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label htmlFor="address">Ulica a číslo</Label>
                      <Input
                        id="address"
                        {...register("address")}
                        className="mt-1.5"
                        placeholder="Hlavná 123"
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
                      <Label htmlFor="zipCode">PSČ</Label>
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
                        placeholder="SK"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="rounded-2xl border-border bg-card shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 font-display text-xl font-bold">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    Spôsob platby
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  {paymentLoading ? (
                    <div className="flex justify-center py-4">
                      <Spinner className="h-5 w-5" />
                    </div>
                  ) : (
                    <RadioGroup
                      value={selectedPayment?.id || ""}
                      onValueChange={(value) => {
                        const method = paymentMethods.find((m) => m.id === value);
                        if (method) setSelectedPayment(method);
                      }}
                      className="grid gap-3 sm:grid-cols-3"
                    >
                      {paymentMethods.map((method) => (
                        <div key={method.id}>
                          <RadioGroupItem
                            value={method.id}
                            id={`payment-${method.id}`}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={`payment-${method.id}`}
                            className="flex cursor-pointer flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 transition-all hover:bg-secondary hover:text-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                          >
                            {getPaymentIcon(method.code)}
                            <span className="text-center text-sm font-medium">{method.name_sk}</span>
                            <span className="mt-1 text-xs text-muted-foreground">
                              {Number(method.fee_fixed) > 0
                                ? `+${Number(method.fee_fixed).toFixed(2)} EUR`
                                : "Zdarma"}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border bg-card shadow-sm">
                <CardContent className="pt-6">
                  <Label htmlFor="note">Poznámka k objednávke (voliteľné)</Label>
                  <Input
                    id="note"
                    {...register("note")}
                    className="mt-1.5"
                    placeholder="Napr. zazvoniť 2×"
                  />
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
                    SPRACOVÁVA SA...
                  </>
                ) : selectedPayment?.code === "card" ||
                  selectedPayment?.code === "google_pay" ||
                  selectedPayment?.code === "apple_pay" ? (
                  `ZAPLATIŤ – ${total.toFixed(2)} EUR`
                ) : (
                  `OBJEDNAŤ – ${total.toFixed(2)} EUR`
                )}
              </Button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-3xl border border-border bg-card p-8 shadow-sm">
              <h2 className="mb-6 font-display text-xl font-bold text-foreground">
                Súhrn objednávky
              </h2>

              <div className="mb-8 space-y-6">
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
                      <h4 className="line-clamp-1 text-sm font-bold text-foreground">
                        {item.name}
                      </h4>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Množstvo: {item.quantity}
                      </p>
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
                  <span className="text-muted-foreground">Medzisúčet (s DPH)</span>
                  <span className="font-medium">{cartTotal.toFixed(2)} EUR</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-primary">
                    <span>Zľava ({appliedDiscount?.code})</span>
                    <span className="font-medium">-{discountAmount.toFixed(2)} EUR</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Doprava</span>
                  <span className="font-medium">
                    {selectedShipping
                      ? shippingCost === 0
                        ? "Zdarma"
                        : `${shippingCost.toFixed(2)} EUR`
                      : "—"}
                  </span>
                </div>
                {paymentFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Poplatok za platbu</span>
                    <span className="font-medium">{paymentFee.toFixed(2)} EUR</span>
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
                    <h4 className="text-sm font-bold text-foreground">Bezpečný nákup</h4>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      Vaše údaje sú v bezpečí. Po odoslaní objednávky vám príde email s pokynmi
                      k platbe a faktúrou.
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
