import { supabase } from '@/lib/supabase';

export interface Review {
  id: string;
  product_id: string;
  customer_id: string;
  rating: number;
  title: string | null;
  content: string;
  is_verified_purchase: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  customer?: {
    full_name: string | null;
    email: string;
  };
}

export interface ReviewStats {
  average: number;
  count: number;
  distribution: { rating: number; count: number; percentage: number }[];
}

export interface CreateReviewInput {
  product_id: string;
  rating: number;
  title?: string;
  content: string;
}

export interface UpdateReviewInput {
  rating?: number;
  title?: string;
  content?: string;
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('product_reviews')
    .select(`
      *,
      customer:customer_id(full_name, email)
    `)
    .eq('product_id', productId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getReviewStats(productId: string): Promise<ReviewStats> {
  const { data, error } = await supabase
    .from('product_reviews')
    .select('rating')
    .eq('product_id', productId)
    .eq('is_approved', true);

  if (error) throw error;

  const reviews = data || [];
  const count = reviews.length;

  if (count === 0) {
    return {
      average: 0,
      count: 0,
      distribution: [5, 4, 3, 2, 1].map((rating) => ({
        rating,
        count: 0,
        percentage: 0,
      })),
    };
  }

  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const average = Math.round((sum / count) * 10) / 10;

  const distribution = [5, 4, 3, 2, 1].map((rating) => {
    const ratingCount = reviews.filter((r) => r.rating === rating).length;
    return {
      rating,
      count: ratingCount,
      percentage: Math.round((ratingCount / count) * 100),
    };
  });

  return { average, count, distribution };
}

export async function getUserReview(
  productId: string,
  userId: string
): Promise<Review | null> {
  const { data, error } = await supabase
    .from('product_reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('customer_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createReview(input: CreateReviewInput): Promise<Review> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const isVerified = await checkVerifiedPurchase(input.product_id, user.id);

  const { data, error } = await supabase
    .from('product_reviews')
    .insert({
      product_id: input.product_id,
      customer_id: user.id,
      rating: input.rating,
      title: input.title || null,
      content: input.content,
      is_verified_purchase: isVerified,
      is_approved: false,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('ALREADY_REVIEWED');
    }
    throw error;
  }

  return data;
}

export async function updateReview(
  reviewId: string,
  input: UpdateReviewInput
): Promise<Review> {
  const { data, error } = await supabase
    .from('product_reviews')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', reviewId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteReview(reviewId: string): Promise<void> {
  const { error } = await supabase
    .from('product_reviews')
    .delete()
    .eq('id', reviewId);

  if (error) throw error;
}

async function checkVerifiedPurchase(
  productId: string,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('order_items')
    .select(`
      id,
      order:order_id(customer_id, status)
    `)
    .eq('product_id', productId);

  if (!data) return false;

  return data.some((item) => {
    const order = item.order as unknown as { customer_id: string; status: string } | null;
    return (
      order &&
      order.customer_id === userId &&
      order.status === 'delivered'
    );
  });
}

export async function getAllReviews(params: {
  page?: number;
  limit?: number;
  isApproved?: boolean;
}): Promise<{ reviews: Review[]; total: number }> {
  const { page = 1, limit = 20, isApproved } = params;

  let query = supabase
    .from('product_reviews')
    .select(
      `
      *,
      customer:customer_id(full_name, email)
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (isApproved !== undefined) {
    query = query.eq('is_approved', isApproved);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    reviews: data || [],
    total: count || 0,
  };
}

export async function approveReview(reviewId: string): Promise<Review> {
  const { data, error } = await supabase
    .from('product_reviews')
    .update({ is_approved: true })
    .eq('id', reviewId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function rejectReview(reviewId: string): Promise<void> {
  const { error } = await supabase
    .from('product_reviews')
    .delete()
    .eq('id', reviewId);

  if (error) throw error;
}
