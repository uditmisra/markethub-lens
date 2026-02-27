import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Building2, Briefcase, Calendar } from "lucide-react";
import { format } from "date-fns";

interface TestimonialCardProps {
  testimonial: any;
  index: number;
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    testimonial: "Testimonial",
    "case-study": "Case Study",
    review: "Review",
    quote: "Quote",
    video: "Video",
  };
  return labels[type] || type;
};

const TestimonialCard = ({ testimonial, index }: TestimonialCardProps) => {
  const rating = testimonial.rating;
  const borderColor =
    rating === 5
      ? "border-l-yellow-400"
      : rating === 4
        ? "border-l-primary"
        : "border-l-secondary";

  const displayContent = testimonial.review_data?.love || testimonial.content;

  return (
    <Link
      to={`/testimonials/${testimonial.id}`}
      className="block mb-5 break-inside-avoid"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div
        className={`group relative bg-card rounded-xl border border-l-4 ${borderColor} p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
      >
        {/* Decorative quote */}
        <span className="absolute top-3 right-4 text-6xl leading-none font-serif text-primary/8 select-none pointer-events-none">
          "
        </span>

        {/* Content */}
        <p className="text-sm text-foreground/85 leading-relaxed mb-4 relative z-10">
          {displayContent}
        </p>

        {/* Rating */}
        {rating && (
          <div className="flex gap-0.5 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
              />
            ))}
          </div>
        )}

        {/* Author */}
        <div className="flex items-center gap-3 pt-3 border-t border-border/50">
          <Avatar className="h-9 w-9">
            <AvatarImage src={testimonial.reviewer_avatar} />
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {testimonial.customer_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {testimonial.customer_name}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {testimonial.job_title && (
                <>
                  <span className="truncate">{testimonial.job_title}</span>
                  <span>·</span>
                </>
              )}
              <span className="truncate">{testimonial.company}</span>
            </div>
          </div>
        </div>

        {/* Footer tags */}
        <div className="flex items-center justify-between mt-3 pt-2">
          <div className="flex gap-1.5 flex-wrap">
            <Badge variant="secondary" className="text-[10px] px-2 py-0">
              {getTypeLabel(testimonial.evidence_type)}
            </Badge>
          </div>
          <span className="text-[10px] text-muted-foreground">
            {format(new Date(testimonial.created_at), "MMM yyyy")}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default TestimonialCard;
