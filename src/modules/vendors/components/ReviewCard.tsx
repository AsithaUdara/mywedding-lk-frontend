import React from "react";
import { Star } from "lucide-react";

interface ReviewCardProps {
  review: {
    name: string;
    date: string;
    text: string;
    rating: number;
  };
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  return (
    <article className="rounded-xl border border-slate-100 bg-slate-50/50 p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          {review.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-charcoal">{review.name}</p>
          <p className="text-xs text-slate-500">{review.date}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}
          />
        ))}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{review.text}</p>
    </article>
  );
};

export default ReviewCard;
