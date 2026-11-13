import React, { useState } from 'react';
import { Star, MessageSquare, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import apiService from '../services/apiService';

export const ReviewModal = ({ isOpen, booking, onClose, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please write a brief comment about your rental experience.');
      return;
    }
    if (comment.trim().length > 1000) {
      setError('Comments must be 1,000 characters or fewer.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const reviewPayload = {
        rentalId: booking.id,
        rating: Number(rating),
        comment: comment.trim(),
      };

      const result = await apiService.createReview(reviewPayload);
      setSuccess(true);
      setTimeout(() => {
        if (onReviewSubmitted) onReviewSubmitted(result);
        onClose();
        setSuccess(false);
        setComment('');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to submit review. You may have already reviewed this rental.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Leave a Review</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Posting review for Rental #{booking.id} ({booking.itemName})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Review Submitted!</h4>
            <p className="text-xs text-slate-500">Thank you for sharing your feedback with the community.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Star Rating */}
            <div className="space-y-1 text-center">
              <label className="text-xs font-semibold text-slate-700 block">Rating</label>
              <div className="flex items-center justify-center gap-1.5 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110 cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        (hoverRating || rating) >= star
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-slate-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-slate-400">
                {rating === 5
                  ? 'Excellent, 5 Stars'
                  : rating === 4
                  ? 'Very Good, 4 Stars'
                  : rating === 3
                  ? 'Average, 3 Stars'
                  : rating === 2
                  ? 'Below Average, 2 Stars'
                  : 'Poor, 1 Star'}
              </span>
            </div>

            {/* Comment */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                <span>Your Feedback</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="How was the equipment condition and communication?"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#236B45] focus:outline-hidden"
              />
              <div className="text-right text-[10px] text-slate-400">
                {comment.length} / 1000 characters
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#236B45] hover:bg-[#1b5636] rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Review</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReviewModal;
