import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

interface WidgetConfig {
  theme?: 'light' | 'dark';
  layout?: 'grid' | 'carousel' | 'list';
  maxItems?: number;
  product?: string;
  showRating?: boolean;
  showAvatar?: boolean;
}

interface TestimonialWidgetProps {
  config?: WidgetConfig;
}

const TestimonialWidget = ({ config = {} }: TestimonialWidgetProps) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    theme = 'light',
    layout = 'grid',
    maxItems = 6,
    product,
    showRating = true,
    showAvatar = true,
  } = config;

  useEffect(() => {
    fetchReviews();
  }, [product, maxItems]);

  const fetchReviews = async () => {
    try {
      let query = supabase
        .from('evidence')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(maxItems);

      if (product) {
        query = query.eq('product', product as any);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const containerClass = `testimonial-widget ${theme} ${layout}`;
  const gridClass = layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 
                    layout === 'list' ? 'flex flex-col gap-4' : 
                    'flex overflow-x-auto gap-4 pb-4';

  return (
    <div className={containerClass} data-theme={theme}>
      <style>{`
        .testimonial-widget {
          font-family: system-ui, -apple-system, sans-serif;
          padding: 1rem;
        }
        .testimonial-widget.dark {
          background: #0f172a;
          color: #f1f5f9;
        }
        .testimonial-widget.light {
          background: #ffffff;
          color: #0f172a;
        }
      `}</style>
      
      <div className={gridClass}>
        {reviews.map((review: any) => (
          <Card key={review.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="space-y-3">
              {showRating && review.rating && (
                <div className="flex items-center justify-between">
                  {renderStars(review.rating)}
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              <div>
                <h3 className="font-semibold text-sm mb-1">{review.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {review.content}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t">
                {showAvatar && review.reviewer_avatar && (
                  <img
                    src={review.reviewer_avatar}
                    alt={review.customer_name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{review.customer_name}</p>
                  {review.job_title && (
                    <p className="text-xs text-muted-foreground truncate">
                      {review.job_title} at {review.company}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TestimonialWidget;
