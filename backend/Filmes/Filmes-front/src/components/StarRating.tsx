import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md";
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const StarRating = ({ rating, max = 5, size = "sm", interactive = false, onChange }: StarRatingProps) => {
  const sizeClass = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const normalizedRating = (rating / (max === 10 ? 2 : 1));

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < Math.round(normalizedRating);
        return (
          <Star
            key={i}
            className={`${sizeClass} ${filled ? "fill-secondary text-secondary" : "text-muted-foreground/30"} ${interactive ? "cursor-pointer hover:text-secondary" : ""}`}
            onClick={() => interactive && onChange?.(i + 1)}
          />
        );
      })}
    </div>
  );
};

export default StarRating;
