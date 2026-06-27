import { PerformanceReview } from "../../types/models";
import { Badge } from "../common/Badge";

const Stars = ({ value }: { value?: number }) => {
  if (!value) return <span className="text-xs text-slate-400">No rating</span>;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`w-3.5 h-3.5 ${s <= value ? "text-amber-400" : "text-slate-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-slate-500 ml-1">{value}/5</span>
    </div>
  );
};

export const FeedbackCard = ({ review }: { review: PerformanceReview }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-card-hover transition-shadow">
    <div className="flex items-start justify-between gap-3 mb-2">
      <div>
        <p className="text-sm font-semibold text-slate-900">Period: {review.review_period}</p>
        <p className="text-xs text-slate-400 mt-0.5">Reviewer #{review.reviewer_id}</p>
      </div>
      <Badge label={review.status} />
    </div>
    <Stars value={review.rating} />
  </div>
);
