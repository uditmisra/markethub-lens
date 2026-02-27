import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";
import SocialMeta from "@/components/SocialMeta";
import StatsHero from "@/components/wall/StatsHero";
import WordCloud from "@/components/wall/WordCloud";
import MasonryGrid from "@/components/wall/MasonryGrid";
import TestimonialCard from "@/components/wall/TestimonialCard";

const PILL_FILTERS = [
  { label: "All", value: "all" },
  { label: "⭐ 5 Stars", value: "5" },
  { label: "⭐ 4+ Stars", value: "4" },
  { label: "Case Studies", value: "case-study" },
  { label: "Reviews", value: "review" },
  { label: "Quotes", value: "quote" },
];

const Testimonials = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ["public-testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evidence")
        .select("*")
        .eq("status", "published")
        .or("rating.gte.4,rating.is.null")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as any[];
    },
  });

  const filteredTestimonials = useMemo(() => {
    return testimonials.filter((t: any) => {
      const matchesSearch =
        !searchQuery ||
        t.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.content.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesFilter = true;
      if (activeFilter === "5") matchesFilter = t.rating === 5;
      else if (activeFilter === "4") matchesFilter = t.rating >= 4;
      else if (activeFilter !== "all") matchesFilter = t.evidence_type === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [testimonials, searchQuery, activeFilter]);

  const averageRating = useMemo(() => {
    const rated = testimonials.filter((t: any) => t.rating);
    if (rated.length === 0) return 0;
    return Math.round((rated.reduce((sum: number, t: any) => sum + t.rating, 0) / rated.length) * 10) / 10;
  }, [testimonials]);

  return (
    <div className="min-h-screen bg-background">
      <SocialMeta
        title="Wall of Love — Customer Testimonials"
        description="Discover what our customers have to say about their experience."
        url={window.location.href}
      />
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <StatsHero totalCount={testimonials.length} averageRating={averageRating} />

          <WordCloud testimonials={testimonials} />

          {/* Search + pill filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search testimonials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {PILL_FILTERS.map((f) => (
                <Badge
                  key={f.value}
                  variant={activeFilter === f.value ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/10 transition-colors px-3 py-1 text-xs"
                  onClick={() => setActiveFilter(f.value)}
                >
                  {f.label}
                </Badge>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="mb-5 break-inside-avoid h-48 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : filteredTestimonials.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No testimonials found matching your criteria</p>
            </Card>
          ) : (
            <MasonryGrid>
              {filteredTestimonials.map((testimonial: any, i: number) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} index={i} />
              ))}
            </MasonryGrid>
          )}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
