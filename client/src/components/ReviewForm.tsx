import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ReviewStars from './ReviewStars';
import { useI18n } from '@/i18n';
import { useCreateReview, useUpdateReview } from '@/hooks/useReviews';
import { useAuth } from '@/_core/hooks/useAuth';
import { Link } from 'wouter';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import type { Review } from '@/services/reviews';

interface ReviewFormProps {
  productId: string;
  existingReview?: Review | null;
  onSuccess?: () => void;
}

export default function ReviewForm({
  productId,
  existingReview,
  onSuccess,
}: ReviewFormProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const createReview = useCreateReview();
  const updateReview = useUpdateReview();

  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [content, setContent] = useState(existingReview?.content || '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isEditing = !!existingReview;
  const isLoading = createReview.isPending || updateReview.isPending;

  if (!user) {
    return (
      <div className="rounded-xl border border-border bg-secondary/30 p-6 text-center">
        <p className="text-muted-foreground mb-4">{t.reviews.loginToReview}</p>
        <div className="flex justify-center gap-3">
          <Link href="/auth/login">
            <Button variant="outline">{t.nav.login}</Button>
          </Link>
          <Link href="/auth/register">
            <Button>{t.nav.register}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (rating === 0) {
      setError(t.reviews.ratingRequired);
      return;
    }

    if (content.length < 20) {
      setError(t.reviews.contentTooShort);
      return;
    }

    try {
      if (isEditing && existingReview) {
        await updateReview.mutateAsync({
          reviewId: existingReview.id,
          productId,
          input: { rating, title: title || undefined, content },
        });
      } else {
        await createReview.mutateAsync({
          product_id: productId,
          rating,
          title: title || undefined,
          content,
        });
      }
      setSuccess(true);
      if (!isEditing) {
        setRating(0);
        setTitle('');
        setContent('');
      }
      onSuccess?.();
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === 'ALREADY_REVIEWED') {
          setError(t.reviews.alreadyReviewed);
        } else {
          setError(t.reviews.submitError);
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>{t.reviews.yourRating}</Label>
        <ReviewStars
          rating={rating}
          size="lg"
          interactive
          onChange={setRating}
          className="py-1"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-title">{t.reviews.titleOptional}</Label>
        <Input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t.reviews.titlePlaceholder}
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-content">{t.reviews.yourReview}</Label>
        <Textarea
          id="review-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t.reviews.contentPlaceholder}
          rows={4}
          minLength={20}
          required
        />
        <p className="text-xs text-muted-foreground">
          {t.reviews.minCharacters.replace('{count}', '20')}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500/50 bg-green-500/10">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700 dark:text-green-400">
            {isEditing ? t.reviews.updateSuccess : t.reviews.submitSuccess}
          </AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEditing ? t.reviews.updateReview : t.reviews.submitReview}
      </Button>
    </form>
  );
}
