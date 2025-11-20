import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Evidence } from "@/types/evidence";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import ReviewContent from "@/components/ReviewContent";
import ShareButtons from "@/components/ShareButtons";
import SocialMeta from "@/components/SocialMeta";
import { Building2, Briefcase, Calendar, Star, Globe, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

const PublicEvidenceDetail = () => {
  const { id } = useParams();

  const { data: evidence, isLoading } = useQuery({
    queryKey: ["public-evidence", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evidence")
        .select("*")
        .eq("id", id)
        .eq("status", "published")
        .single();

      if (error) throw error;
      return data as any;
    },
  });

  const { data: relatedTestimonials = [] } = useQuery({
    queryKey: ["related-testimonials", evidence?.product],
    queryFn: async () => {
      if (!evidence) return [];
      
      const { data, error } = await supabase
        .from("evidence")
        .select("*")
        .eq("status", "published")
        .eq("product", evidence.product)
        .neq("id", evidence.id)
        .limit(3);

      if (error) throw error;
      return data as any[];
    },
    enabled: !!evidence,
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${
              i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted"
            }`}
          />
        ))}
      </div>
    );
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      "testimonial": "Testimonial",
      "case-study": "Case Study",
      "review": "Review",
      "quote": "Quote",
      "video": "Video",
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="h-64 bg-muted animate-pulse rounded-lg" />
            <div className="h-96 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!evidence) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Testimonial Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The testimonial you're looking for doesn't exist or hasn't been published yet.
          </p>
          <Button asChild>
            <Link to="/testimonials">View All Testimonials</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const shareUrl = window.location.href;
  const shareTitle = evidence?.title || "Customer Testimonial";
  const shareDescription = evidence?.content ? 
    (evidence.content as any).substring(0, 160) + "..." : 
    "Check out this customer testimonial";

  return (
    <div className="min-h-screen bg-background">
      <SocialMeta 
        title={shareTitle}
        description={shareDescription}
        image={(evidence as any)?.reviewer_avatar}
        url={shareUrl}
        type="article"
      />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/testimonials">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Testimonials
            </Link>
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={(evidence as any).reviewer_avatar} />
                      <AvatarFallback className="text-lg">
                        {(evidence as any).customer_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold text-foreground mb-2">
                        {(evidence as any).customer_name}
                      </h1>
                      {(evidence as any).job_title && (
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Briefcase className="h-4 w-4" />
                          <span>{(evidence as any).job_title}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>{evidence.company}</span>
                      </div>
                    </div>
                  </div>

                  {evidence.rating && (
                    <div className="flex items-center gap-3 mb-4">
                      {renderStars(evidence.rating)}
                      <span className="text-lg font-semibold">{evidence.rating}/5</span>
                    </div>
                  )}

                  <CardTitle className="text-xl mb-4">{evidence.title}</CardTitle>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{getTypeLabel((evidence as any).evidence_type)}</Badge>
                    <Badge variant="outline" className="capitalize">{evidence.product}</Badge>
                    {(evidence as any).company_size && (
                      <Badge variant="outline">{(evidence as any).company_size}</Badge>
                    )}
                    {evidence.industry && (
                      <Badge variant="outline">{evidence.industry}</Badge>
                    )}
                  </div>
                </CardHeader>

                <Separator />

                <CardContent className="pt-6">
                  <ReviewContent 
                    reviewData={(evidence as any).review_data} 
                    content={evidence.content}
                  />

                  {evidence.results && (
                    <div className="mt-6">
                      <h3 className="font-semibold text-lg mb-3">Key Results</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {evidence.results}
                      </p>
                    </div>
                  )}

                  {(evidence as any).use_cases && (
                    <div className="mt-6">
                      <h3 className="font-semibold text-lg mb-3">Use Cases</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {(evidence as any).use_cases}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Share This Testimonial</CardTitle>
                </CardHeader>
                <CardContent>
                  <ShareButtons 
                    url={shareUrl}
                    title={shareTitle}
                    description={shareDescription}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Published</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date((evidence as any).review_date || (evidence as any).created_at), "MMMM d, yyyy")}
                      </p>
                    </div>
                  </div>

                  {(evidence as any).external_url && (
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Original Source</p>
                        <a 
                          href={(evidence as any).external_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline break-all"
                        >
                          View on {(evidence as any).integration_source || 'External Site'}
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {relatedTestimonials.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Related Testimonials</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {relatedTestimonials.map((related: any) => (
                      <Link 
                        key={related.id} 
                        to={`/testimonials/${related.id}`}
                        className="block p-3 rounded-lg border hover:bg-accent transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={related.reviewer_avatar} />
                            <AvatarFallback>
                              {related.customer_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {related.customer_name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {related.company}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {related.title}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicEvidenceDetail;
