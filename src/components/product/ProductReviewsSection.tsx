"use client";

import { useState } from 'react';
import { Star, MessageSquare, CheckCircle2, AlertCircle, Loader2, Sparkles, User } from 'lucide-react';
import Link from 'next/link';

interface ReviewItem {
  id: string;
  rating: number;
  title: string;
  comment: string;
  author: string;
  createdAt: Date | string;
}

interface ProductReviewsSectionProps {
  productId: string;
  initialReviews: ReviewItem[];
  currentUserId?: string | null;
}

export function ProductReviewsSection({
  productId,
  initialReviews,
  currentUserId,
}: ProductReviewsSectionProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0';

  // Calculate rating distribution
  const distribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { stars, count, percentage };
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !comment.trim()) {
      setStatus('error');
      setMessage('Please provide both a title and review comment.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating,
          title: title.trim(),
          comment: comment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setStatus('success');
      setMessage('Thank you! Your review has been published.');
      if (data.review) {
        setReviews([data.review, ...reviews]);
      }
      setTitle('');
      setComment('');
      setTimeout(() => {
        setIsFormOpen(false);
        setStatus('idle');
      }, 2000);
    } catch (err: unknown) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Error submitting review');
    }
  };

  return (
    <div className="mt-16 border-t border-border/80 pt-12">
      {/* Header & Stats Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Engineer Feedback</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground font-heading">
            Customer Reviews & Benchmarks
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real feedback from verified hardware developers and roboticists.
          </p>
        </div>

        <div className="flex items-center gap-6 glass p-4 sm:p-6 rounded-2xl border border-border/80">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-foreground font-mono">
              {averageRating}
            </div>
            <div className="flex items-center justify-center gap-0.5 mt-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i <= Math.round(Number(averageRating))
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-muted-foreground font-mono mt-1 block">
              Based on {totalReviews} reviews
            </span>
          </div>

          <div className="h-12 w-px bg-border/80 hidden sm:block"></div>

          <div>
            {!currentUserId ? (
              <Link
                href={`/login?redirect=/product/${productId}`}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow-md inline-block text-center whitespace-nowrap"
              >
                Sign In to Review
              </Link>
            ) : (
              <button
                onClick={() => setIsFormOpen(!isFormOpen)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow-md whitespace-nowrap"
              >
                {isFormOpen ? 'Cancel Review' : 'Write a Review'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Write Review Collapsible Form */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="mb-12 glass p-6 sm:p-8 rounded-3xl border border-border/80 shadow-xl space-y-5 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <h3 className="text-lg font-bold text-foreground font-heading">
              Write Your Product Review
            </h3>
            <span className="text-xs font-mono text-muted-foreground">1 Review Per Customer</span>
          </div>

          {status === 'error' && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {status === 'success' && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* Star Rating Picker */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
              Overall Rating
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-muted-foreground hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-3 text-xs font-mono font-bold text-primary">
                {rating} / 5 Stars
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
              Headline / Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Exceptional precision & easy micro-ROS integration"
              className="w-full bg-background/80 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
              Review Comment *
            </label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe build quality, pinouts, performance under load, or driver compatibility..."
              className="w-full bg-background/80 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-5 py-2.5 bg-muted text-muted-foreground hover:bg-muted/80 rounded-xl font-bold text-xs uppercase tracking-wider transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Verified Review</span>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Review List & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rating Breakdown Bar Graph */}
        <div className="lg:col-span-1 glass p-6 rounded-2xl border border-border/70 space-y-3 h-fit">
          <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold mb-4">
            Rating Breakdown
          </h4>
          {distribution.map(({ stars, count, percentage }) => (
            <div key={stars} className="flex items-center gap-3 text-xs font-mono">
              <span className="w-12 text-muted-foreground">{stars} Stars</span>
              <div className="flex-1 h-2 bg-muted/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="w-8 text-right text-muted-foreground">{count}</span>
            </div>
          ))}
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-4">
          {reviews.length === 0 ? (
            <div className="p-8 text-center glass rounded-2xl border border-border/70 space-y-3">
              <div className="w-12 h-12 bg-muted/40 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-foreground">No Reviews Yet</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Be the first hardware engineer to test and review this component.
              </p>
            </div>
          ) : (
            reviews.map((r) => (
              <div
                key={r.id}
                className="glass p-5 sm:p-6 rounded-2xl border border-border/70 space-y-3 hover:border-border transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs font-mono">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-foreground block">{r.author}</span>
                      <span className="text-[10px] text-emerald-500 font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Stars and Title */}
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                  <h5 className="text-sm font-bold text-foreground">{r.title}</h5>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {r.comment}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
