import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getProductReviews,
  getReviewStats,
  getUserReview,
  createReview,
  updateReview,
  deleteReview,
  type CreateReviewInput,
  type UpdateReviewInput,
} from '@/services/reviews';

export function useProductReviews(productId: string | undefined) {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => getProductReviews(productId!),
    enabled: !!productId,
  });
}

export function useReviewStats(productId: string | undefined) {
  return useQuery({
    queryKey: ['reviews', productId, 'stats'],
    queryFn: () => getReviewStats(productId!),
    enabled: !!productId,
  });
}

export function useUserReview(productId: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ['reviews', productId, 'user', userId],
    queryFn: () => getUserReview(productId!, userId!),
    enabled: !!productId && !!userId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateReviewInput) => createReview(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.product_id] });
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      productId,
      input,
    }: {
      reviewId: string;
      productId: string;
      input: UpdateReviewInput;
    }) => updateReview(reviewId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.productId] });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, productId }: { reviewId: string; productId: string }) =>
      deleteReview(reviewId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.productId] });
    },
  });
}
