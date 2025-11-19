import { ThumbsUp, ThumbsDown, Target, MessageSquare, Lightbulb, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ReviewData {
  love?: string;
  hate?: string;
  problems_solving?: string;
  recommendations?: string;
  best_use_case?: string;
  comment?: string;
}

interface ReviewContentProps {
  reviewData?: ReviewData;
  content?: string;
}

const ReviewContent = ({ reviewData, content }: ReviewContentProps) => {
  // If we have structured review data, display it nicely
  if (reviewData && Object.keys(reviewData).some(key => reviewData[key as keyof ReviewData])) {
    return (
      <div className="space-y-6">
        {reviewData.love && (
          <Card className="p-6 border-l-4 border-l-green-500">
            <div className="flex items-start gap-3">
              <ThumbsUp className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">What customers love</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{reviewData.love}</p>
              </div>
            </div>
          </Card>
        )}

        {reviewData.hate && (
          <Card className="p-6 border-l-4 border-l-amber-500">
            <div className="flex items-start gap-3">
              <ThumbsDown className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">Areas for improvement</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{reviewData.hate}</p>
              </div>
            </div>
          </Card>
        )}

        {reviewData.problems_solving && (
          <Card className="p-6 border-l-4 border-l-blue-500">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">Problems being solved</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{reviewData.problems_solving}</p>
              </div>
            </div>
          </Card>
        )}

        {reviewData.recommendations && (
          <Card className="p-6 border-l-4 border-l-purple-500">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">Recommendations</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{reviewData.recommendations}</p>
              </div>
            </div>
          </Card>
        )}

        {reviewData.best_use_case && (
          <Card className="p-6 border-l-4 border-l-indigo-500">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">Best use cases</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{reviewData.best_use_case}</p>
              </div>
            </div>
          </Card>
        )}

        {reviewData.comment && (
          <Card className="p-6 border-l-4 border-l-gray-500">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">Additional comments</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{reviewData.comment}</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    );
  }

  // Fallback to displaying plain content
  return (
    <div className="prose prose-gray max-w-none">
      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  );
};

export default ReviewContent;
