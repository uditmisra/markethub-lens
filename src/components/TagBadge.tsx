import { Badge } from "@/components/ui/badge";
import { Tag, CATEGORY_COLORS } from "@/types/tags";

interface TagBadgeProps {
  tag: Tag;
  onRemove?: () => void;
  size?: "sm" | "md";
}

export const TagBadge = ({ tag, onRemove, size = "sm" }: TagBadgeProps) => {
  return (
    <Badge
      variant="outline"
      className={`${CATEGORY_COLORS[tag.category as keyof typeof CATEGORY_COLORS] ?? ""} ${size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-1"} font-normal`}
    >
      {tag.name}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="ml-1.5 hover:opacity-70 transition-opacity leading-none"
          aria-label={`Remove ${tag.name}`}
        >
          ×
        </button>
      )}
    </Badge>
  );
};
