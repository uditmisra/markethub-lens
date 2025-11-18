import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Evidence } from "@/types/evidence";
import { Building2, Calendar, FileText } from "lucide-react";
import { Link } from "react-router-dom";

interface EvidenceCardProps {
  evidence: Evidence;
}

const statusColors = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  published: "bg-primary/10 text-primary border-primary/20",
  archived: "bg-muted text-muted-foreground border-border"
};

const typeLabels = {
  testimonial: "Testimonial",
  "case-study": "Case Study",
  review: "Review",
  quote: "Quote",
  video: "Video"
};

export const EvidenceCard = ({ evidence }: EvidenceCardProps) => {
  return (
    <Link to={`/evidence/${evidence.id}`}>
      <Card className="p-6 hover:shadow-medium transition-all cursor-pointer bg-gradient-card group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {typeLabels[evidence.evidenceType]}
              </Badge>
              <Badge variant="outline" className={`text-xs ${statusColors[evidence.status]}`}>
                {evidence.status}
              </Badge>
            </div>
            <h3 className="text-xl font-semibold text-card-foreground mb-2 group-hover:text-primary transition-colors">
              {evidence.title}
            </h3>
          </div>
          <FileText className="h-5 w-5 text-muted-foreground" />
        </div>

        <p className="text-muted-foreground mb-4 line-clamp-3">
          {evidence.content}
        </p>

        {evidence.results && (
          <div className="mb-4 p-3 bg-success/5 border border-success/20 rounded-lg">
            <p className="text-sm text-muted-foreground font-medium">Key Results:</p>
            <p className="text-sm text-card-foreground mt-1">{evidence.results}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              <span>{evidence.company}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(evidence.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {evidence.product}
          </Badge>
        </div>
      </Card>
    </Link>
  );
};
