import { formatDistanceToNow } from 'date-fns';
import { sk } from 'date-fns/locale';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import ReviewStars from './ReviewStars';
import { useI18n } from '@/i18n';
import { useProductReviews, useReviewStats } from '@/hooks/useReviews';
import { CheckCircle2, MessageSquare } from 'lucide-react';
import type { Review, ReviewStats } from '@/services/reviews';

interface ReviewListProps {
  productId: string;
}

function ReviewStatsSummary({ stats }: { stats: ReviewStats }) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col sm:flex-row gap-8 p-6 rounded-xl border border-border bg-secondary/20">
      <div className="flex flex-col items-center justify-center text-center">
        <span className="text-5xl font-bold text-foreground">{stats.average.toFixed(1)}</span>
        <ReviewStars rating={stats.average} size="md" className="mt-2" />
        <span className="text-sm text-muted-foreground mt-1">
          {stats.count} {t.reviews.reviewsCount}
        </span>
      </div>

      <div className="flex-1 space-y-2">
        {stats.distribution.map(({ rating, count, percentage }) => (
          <div key={rating} className="flex items-center gap-3">
            <span className="w-8 text-sm font-medium text-muted-foreground">
              {rating} {t.reviews.star}
            </span>
            <Progress value={percentage} className="h-2 flex-1" />
            <span className="w-8 text-sm text-muted-foreground text-right">
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewItem({ review }: { review: Review }) {
  const { t } = useI18n();
  const customerName = review.customer?.full_name || review.customer?.email?.split('@')[0] || t.reviews.anonymous;
  const initials = customerName.slice(0, 2).toUpperCase();
  const timeAgo = formatDistanceToNow(new Date(review.created_at), {
    addSuffix: true,
    locale: sk,
  });

  return (
    <div className="border-b border-border pb-6 last:border-0 last:pb-0">
      <div className="flex items-start gap-4">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-medium text-foreground">{customerName}</span>
            {review.is_verified_purchase && (
              <Badge variant="secondary" className="text-xs gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {t.reviews.verifiedPurchase}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3 mb-3">
            <ReviewStars rating={review.rating} size="sm" />
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
          </div>

          {review.title && (
            <h4 className="font-medium text-foreground mb-1">{review.title}</h4>
          )}
          <p className="text-muted-foreground text-sm leading-relaxed">
            {review.content}
          </p>
        </div>
      </div>
    </div>
  );
}

function ReviewListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-8 p-6 rounded-xl border border-border bg-secondary/20">
        <div className="flex flex-col items-center">
          <Skeleton className="h-12 w-16" />
          <Skeleton className="h-4 w-24 mt-2" />
          <Skeleton className="h-3 w-16 mt-1" />
        </div>
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-2 flex-1" />
              <Skeleton className="h-4 w-8" />
            </div>
          ))}
        </div>
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4 pb-6 border-b border-border">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ReviewList({ productId }: ReviewListProps) {
  const { t } = useI18n();
  const { data: reviews, isLoading: reviewsLoading } = useProductReviews(productId);
  const { data: stats, isLoading: statsLoading } = useReviewStats(productId);

  if (reviewsLoading || statsLoading) {
    return <ReviewListSkeleton />;
  }

  if (!stats || stats.count === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="font-medium text-foreground mb-1">{t.reviews.noReviews}</h3>
        <p className="text-sm text-muted-foreground">{t.reviews.beFirst}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ReviewStatsSummary stats={stats} />

      <div className="space-y-6">
        {reviews?.map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}
