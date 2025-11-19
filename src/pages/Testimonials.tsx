import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Evidence } from "@/types/evidence";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Building2, Briefcase, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

const Testimonials = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ["public-testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evidence")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as any[];
    },
  });

  const filteredTestimonials = testimonials.filter((t: any) => {
    const matchesSearch = 
      t.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesProduct = productFilter === "all" || t.product === productFilter;
    const matchesType = typeFilter === "all" || t.evidence_type === typeFilter;
    const matchesRating = ratingFilter === "all" || (t.rating && t.rating >= parseInt(ratingFilter));

    return matchesSearch && matchesProduct && matchesType && matchesRating;
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Customer Testimonials
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what our customers are saying about their experience
            </p>
          </div>

          <div className="bg-card rounded-lg border p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search testimonials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="md:col-span-1"
              />
              
              <Select value={productFilter} onValueChange={setProductFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="platform">Platform</SelectItem>
                  <SelectItem value="analytics">Analytics</SelectItem>
                  <SelectItem value="integration">Integration</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="testimonial">Testimonials</SelectItem>
                  <SelectItem value="case-study">Case Studies</SelectItem>
                  <SelectItem value="review">Reviews</SelectItem>
                  <SelectItem value="quote">Quotes</SelectItem>
                </SelectContent>
              </Select>

              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="3">3+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mb-6 text-sm text-muted-foreground">
            Showing {filteredTestimonials.length} {filteredTestimonials.length === 1 ? 'testimonial' : 'testimonials'}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="h-64 animate-pulse bg-muted" />
              ))}
            </div>
          ) : filteredTestimonials.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No testimonials found matching your criteria</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTestimonials.map((testimonial: any) => (
                <Link key={testimonial.id} to={`/testimonials/${testimonial.id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6 flex flex-col gap-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={testimonial.reviewer_avatar} />
                          <AvatarFallback>
                            {testimonial.customer_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">
                            {testimonial.customer_name}
                          </h3>
                          {testimonial.job_title && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Briefcase className="h-3 w-3" />
                              <span className="truncate">{testimonial.job_title}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Building2 className="h-3 w-3" />
                            <span className="truncate">{testimonial.company}</span>
                          </div>
                        </div>
                      </div>

                      {testimonial.rating && (
                        <div className="flex items-center gap-2">
                          {renderStars(testimonial.rating)}
                          <span className="text-sm font-medium">{testimonial.rating}/5</span>
                        </div>
                      )}

                      <h4 className="font-semibold text-foreground line-clamp-2">
                        {testimonial.title}
                      </h4>

                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {testimonial.review_data?.love || testimonial.content}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {getTypeLabel(testimonial.evidence_type)}
                          </Badge>
                          <Badge variant="outline" className="text-xs capitalize">
                            {testimonial.product}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(testimonial.created_at), "MMM yyyy")}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
