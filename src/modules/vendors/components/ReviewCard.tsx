import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { pv } from "@/modules/vendors/public-theme";

interface ReviewCardProps {
  review: {
    name: string;
    date: string;
    rating: number;
    text: string;
  };
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  return (
    <article className={cn(pv.cardPad, "!p-5")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-foreground">{review.name}</p>
          <p className="text-xs text-muted-foreground">{review.date}</p>
        </div>
        <div className="flex gap-0.5" aria-label={`${review.rating} out of 5 stars`}>
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < review.rating ? "fill-accent text-accent" : "text-muted"}
              aria-hidden
            />
          ))}
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{review.text}</p>
    </article>
  );
};

export default ReviewCard;
