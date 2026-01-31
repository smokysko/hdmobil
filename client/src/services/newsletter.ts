import { supabase } from "@/lib/supabase";
import { nanoid } from "nanoid";

export interface NewsletterSubscriber {
  id: string;
  email: string;
  language: string;
  discount_code: string | null;
  discount_expires_at: string | null;
  discount_used: boolean;
  gdpr_consent: boolean;
  is_active: boolean;
  subscribed_at: string;
}

export interface SubscribeResult {
  success: boolean;
  discountCode?: string;
  expiresAt?: string;
  error?: string;
  alreadySubscribed?: boolean;
}

function generateDiscountCode(): string {
  return `NEWS-${nanoid(8).toUpperCase()}`;
}

export async function subscribeToNewsletter(
  email: string,
  language: string,
  gdprConsent: boolean
): Promise<SubscribeResult> {
  if (!gdprConsent) {
    return { success: false, error: "GDPR consent is required" };
  }

  const normalizedEmail = email.toLowerCase().trim();

  const { data: existing } = await supabase
    .from("newsletter_subscribers")
    .select("id, is_active, discount_code, discount_expires_at")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (existing) {
    if (existing.is_active) {
      return {
        success: false,
        alreadySubscribed: true,
        error: "Email is already subscribed",
      };
    }

    const discountCode = generateDiscountCode();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error: updateError } = await supabase
      .from("newsletter_subscribers")
      .update({
        is_active: true,
        language,
        discount_code: discountCode,
        discount_expires_at: expiresAt,
        discount_used: false,
        gdpr_consent: true,
        gdpr_consent_at: new Date().toISOString(),
        subscribed_at: new Date().toISOString(),
        unsubscribed_at: null,
      })
      .eq("id", existing.id);

    if (updateError) {
      return { success: false, error: "Failed to resubscribe" };
    }

    return {
      success: true,
      discountCode,
      expiresAt,
    };
  }

  const discountCode = generateDiscountCode();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const { error: insertError } = await supabase
    .from("newsletter_subscribers")
    .insert({
      email: normalizedEmail,
      language,
      discount_code: discountCode,
      discount_expires_at: expiresAt,
      gdpr_consent: true,
      gdpr_consent_at: new Date().toISOString(),
    });

  if (insertError) {
    if (insertError.code === "23505") {
      return {
        success: false,
        alreadySubscribed: true,
        error: "Email is already subscribed",
      };
    }
    return { success: false, error: "Failed to subscribe" };
  }

  return {
    success: true,
    discountCode,
    expiresAt,
  };
}

export async function checkSubscriptionStatus(
  email: string
): Promise<{ subscribed: boolean; discountCode?: string }> {
  const { data } = await supabase
    .from("newsletter_subscribers")
    .select("is_active, discount_code, discount_used, discount_expires_at")
    .eq("email", email.toLowerCase().trim())
    .eq("is_active", true)
    .maybeSingle();

  if (!data) {
    return { subscribed: false };
  }

  return {
    subscribed: true,
    discountCode:
      !data.discount_used &&
      data.discount_expires_at &&
      new Date(data.discount_expires_at) > new Date()
        ? data.discount_code
        : undefined,
  };
}
