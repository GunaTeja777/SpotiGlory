"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { Star, MessageSquare, ShieldCheck, Heart, User } from "lucide-react";

interface ReviewItem {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export const CommunityReviewCard: React.FC = () => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>("");
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState({ totalReviews: 12430, averageRating: 4.9 });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/reviews");
      if (res.ok) {
        const data = await res.json();
        if (data.status === "success") {
          setReviews(data.reviews || []);
          setStats({
            totalReviews: data.totalReviews,
            averageRating: data.averageRating
          });
        }
      }
    } catch (e) {
      console.error("Failed to load community reviews", e);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setErrorMsg("Please write a short comment about your vibe accuracy experience.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment })
      });

      const data = await res.json();
      if (res.ok && data.status === "success") {
        setSuccessMsg("Thank you! Your feedback has been stored and calibrated in real-time.");
        setComment("");
        setRating(5);
        fetchReviews(); // Refresh review list
      } else {
        throw new Error(data.error || "Failed to submit review");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 🌟 Submit Feedback Card */}
      <GlassCard variant="elevated" radius="3xl" className="p-6 border-white/18 text-left">
        <div className="flex items-center gap-3 pb-3.5 border-b border-white/10 mb-4">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <Heart className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Share Your Vibe Feedback</h4>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Submit a real-time review to update global community analytics
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Star Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono text-gray-400 uppercase font-bold tracking-wider">
              VIBE ACCURACY RATING:
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const isLit = hoverRating !== null ? star <= hoverRating : star <= rating;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 text-amber-400 hover:scale-115 transition-transform duration-200"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        isLit ? "fill-amber-400 text-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" : "text-white/20"
                      }`}
                    />
                  </button>
                );
              })}
              <span className="text-xs font-mono font-bold text-gray-300 ml-2">
                {rating === 5 ? "🔥 Mind-blowing Accuracy" : rating === 4 ? "✨ Very Accurate" : rating === 3 ? "👍 Decent Vibe" : rating === 2 ? "👎 Off Vibe" : "💩 Completely Inaccurate"}
              </span>
            </div>
          </div>

          {/* Comment Box */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono text-gray-400 uppercase font-bold tracking-wider">
              REVIEW COMMENT:
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How accurate was your chronotype, top genres, and RAG playlist suggestions?"
              rows={3}
              maxLength={300}
              className="w-full px-3 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-amber-500/40 transition-colors resize-none"
            />
          </div>

          {/* Error & Success Messages */}
          {errorMsg && (
            <p className="text-[11px] font-mono text-red-400 mt-1">
              ⚠️ {errorMsg}
            </p>
          )}

          {successMsg && (
            <p className="text-[11px] font-mono text-[#1DB954] mt-1 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> {successMsg}
            </p>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-1">
            <GlassButton
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              className="text-xs font-bold shadow-[0_0_15px_rgba(251,191,36,0.2)] hover:shadow-[0_0_20px_rgba(251,191,36,0.4)]"
            >
              {isSubmitting ? "Submitting Review..." : "Submit Real-Time Review"}
            </GlassButton>
          </div>
        </form>
      </GlassCard>

      {/* 📈 Live Global Community Card */}
      <GlassCard variant="interactive" radius="3xl" className="p-6 border-white/14 text-left">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-bold text-white">Live Community Reviews</h4>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono font-bold text-amber-300">{stats.averageRating} / 5.0 Rating</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{stats.totalReviews.toLocaleString()} total reviews</p>
          </div>
        </div>

        {/* Scrollable Reviews Feed */}
        <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1 select-none">
          {reviews.length === 0 ? (
            <p className="text-xs text-gray-500 italic text-center py-6">No community feedback loaded.</p>
          ) : (
            reviews.slice(0, 5).map((rev) => (
              <div
                key={rev.id}
                className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-1.5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-200"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                      <User className="w-3 h-3 text-purple-300" />
                    </div>
                    <span className="text-[11px] font-bold text-white truncate max-w-[120px]">
                      {rev.user_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < rev.rating ? "fill-amber-400 text-amber-400" : "text-white/10"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-[11px] text-gray-300 leading-relaxed pl-1 italic">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
};
