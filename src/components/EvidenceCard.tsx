import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Evidence } from "@/types/evidence";
import { Building2, Calendar, FileText, ExternalLink, Star, Users, Briefcase, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { calculateCompleteness, getCompletenessLabel, getCompletenessColor } from "@/utils/calculateCompleteness";

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
  const completeness = calculateCompleteness(evidence);
  const completenessInfo = getCompletenessLabel(completeness.score);

  const renderStarRating = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating
                ? "fill-yellow-500 text-yellow-500"
                : "fill-muted text-muted"
            }`}
          />
        ))}
        <span className="text-sm font-medium ml-1">{rating}/5</span>
      </div>
    );
  };

  return (
    <Link to={`/evidence/${evidence.id}`}>
      <Card className="p-6 hover:shadow-medium transition-all cursor-pointer bg-gradient-card group relative">
        {/* Completeness Badge */}
        <div className="absolute top-4 right-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1.5 border border-border">
                  <div className="flex items-center gap-1.5">
                    <div className={`h-2 w-2 rounded-full ${getCompletenessColor(completeness.score)}`} />
                    <span className="text-xs font-medium">{completeness.score}%</span>
                  </div>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Data Completeness</span>
                    <span className={`text-sm font-semibold ${completenessInfo.color}`}>
                      {completenessInfo.label}
                    </span>
                  </div>
                  <Progress value={completeness.score} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {completeness.filledFields} of {completeness.totalFields} fields completed
                  </div>
                  {completeness.missingFields.length > 0 && (
                    <div className="text-xs">
                      <div className="font-medium mb-1">Missing:</div>
                      <div className="text-muted-foreground">
                        {completeness.missingFields.join(", ")}
                      </div>
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-start justify-between mb-4 pr-20">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {typeLabels[evidence.evidenceType]}
              </Badge>
              <Badge variant="outline" className={`text-xs ${statusColors[evidence.status]}`}>
                {evidence.status}
              </Badge>
              {evidence.integration_source && (
                <Badge variant="secondary" className="text-xs">
                  {evidence.integration_source === "g2" ? "G2" : evidence.integration_source === "capterra" ? "Capterra" : "Imported"}
                </Badge>
              )}
              {evidence.company_size && (
                <Badge variant="outline" className="text-xs gap-1">
                  <Users className="h-3 w-3" />
                  {evidence.company_size}
                </Badge>
              )}
              {evidence.industry && (
                <Badge variant="outline" className="text-xs gap-1">
                  <Briefcase className="h-3 w-3" />
                  {evidence.industry}
                </Badge>
              )}
            </div>
            
            {/* Rating */}
            {evidence.rating && (
              <div className="mb-2">
                {renderStarRating(evidence.rating)}
              </div>
            )}
            
            <h3 className="text-xl font-semibold text-card-foreground mb-2 group-hover:text-primary transition-colors">
              {evidence.title}
            </h3>
            {evidence.external_url && (
              <a 
                href={evidence.external_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                View original review <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          {evidence.reviewer_avatar ? (
            <Avatar className="h-10 w-10">
              <AvatarImage src={evidence.reviewer_avatar} alt={evidence.customerName} />
              <AvatarFallback>{evidence.customerName.charAt(0)}</AvatarFallback>
            </Avatar>
          ) : (
            <FileText className="h-5 w-5 text-muted-foreground" />
          )}
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
              <div>
                <span className="font-medium">{evidence.company}</span>
                {evidence.jobTitle && (
                  <span className="text-xs block text-muted-foreground/70">{evidence.jobTitle}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(evidence.review_date || evidence.createdAt).toLocaleDateString()}</span>
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
