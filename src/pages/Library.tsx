import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { TagBadge } from "@/components/TagBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTags } from "@/hooks/useTags";
import { useUserRole } from "@/hooks/useUserRole";
import { Tag, CATEGORY_LABELS, TagCategory } from "@/types/tags";
import { exportToCSV, exportToJSON } from "@/utils/exportData";
import {
  Search, Plus, Download, Star, Building2, Copy, Check,
  Filter, ChevronDown, ChevronUp, Loader2, FileText, ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface ProofItem {
  id: string;
  customer_name: string;
  company: string;
  job_title: string | null;
  industry: string | null;
  company_size: string | null;
  content: string;
  results: string | null;
  status: string;
  rating: number | null;
  created_at: string;
  review_date: string | null;
  integration_source: string | null;
  title: string;
  tags: Tag[];
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        className={`h-3.5 w-3.5 ${s <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
      />
    ))}
  </div>
);

const QuickCopyButton = ({ content, customerName, jobTitle, company }: { content: string; customerName: string; jobTitle: string | null; company: string }) => {
  const [copied, setCopied] = useState(false);
  const sentences = content.match(/[^.!?]+[.!?]+/g) ?? [content];
  const pullQuote = `"${sentences.slice(0, 2).join(" ").trim()}"\n— ${customerName}${jobTitle ? `, ${jobTitle}` : ""} at ${company}`;

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(pullQuote);
    setCopied(true);
    toast.success("Pull quote copied");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2 gap-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
      {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : "Copy quote"}
    </Button>
  );
};

const STATUS_COLORS: Record<string, string> = {
  published: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  archived: "bg-muted text-muted-foreground border-border",
  approved: "bg-primary/10 text-primary border-primary/20",
};

const CATEGORIES: TagCategory[] = ["use_case", "persona", "competitor", "campaign", "sentiment"];

export default function Library() {
  const { tags, tagsByCategory } = useTags();
  const { isAdmin, isReviewer } = useUserRole();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["use_case", "sentiment"]));

  const { data: proofItems = [], isLoading } = useQuery({
    queryKey: ["proof"],
    queryFn: async () => {
      const { data: evidence, error } = await supabase
        .from("evidence")
        .select("*, evidence_tags(tag_id)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const tagMap = Object.fromEntries(tags.map((t) => [t.id, t]));

      return (evidence ?? []).map((item) => ({
        id: item.id,
        customer_name: item.customer_name,
        company: item.company,
        job_title: item.job_title,
        industry: item.industry,
        company_size: item.company_size,
        content: item.content,
        results: item.results,
        status: item.status,
        rating: item.rating,
        created_at: item.created_at,
        review_date: item.review_date,
        integration_source: item.integration_source,
        title: item.title,
        tags: (item.evidence_tags ?? [])
          .map((et: { tag_id: string }) => tagMap[et.tag_id])
          .filter(Boolean) as Tag[],
      })) as ProofItem[];
    },
    enabled: tags.length >= 0, // run even with empty tags
  });

  const industries = useMemo(
    () => Array.from(new Set(proofItems.map((p) => p.industry).filter(Boolean))) as string[],
    [proofItems]
  );

  const filtered = useMemo(() => {
    return proofItems.filter((p) => {
      const matchesSearch =
        !search ||
        p.customer_name.toLowerCase().includes(search.toLowerCase()) ||
        p.company.toLowerCase().includes(search.toLowerCase()) ||
        p.content.toLowerCase().includes(search.toLowerCase()) ||
        p.title.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || p.status === statusFilter;

      const matchesRating =
        ratingFilter === "all" ||
        (ratingFilter === "5" && p.rating === 5) ||
        (ratingFilter === "4+" && p.rating != null && p.rating >= 4) ||
        (ratingFilter === "3+" && p.rating != null && p.rating >= 3);

      const matchesIndustry = industryFilter === "all" || p.industry === industryFilter;

      const matchesTags =
        selectedTagIds.size === 0 ||
        [...selectedTagIds].every((id) => p.tags.some((t) => t.id === id));

      return matchesSearch && matchesStatus && matchesRating && matchesIndustry && matchesTags;
    });
  }, [proofItems, search, statusFilter, ratingFilter, industryFilter, selectedTagIds]);

  const toggleTag = (id: string) =>
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleCategory = (cat: string) =>
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setRatingFilter("all");
    setIndustryFilter("all");
    setSelectedTagIds(new Set());
  };

  const hasFilters =
    search || statusFilter !== "all" || ratingFilter !== "all" || industryFilter !== "all" || selectedTagIds.size > 0;

  const publishedCount = proofItems.filter((p) => p.status === "published").length;
  const pendingCount = proofItems.filter((p) => p.status === "pending").length;
  const avgRating = (() => {
    const rated = proofItems.filter((p) => p.rating);
    if (!rated.length) return null;
    return (rated.reduce((s, p) => s + (p.rating ?? 0), 0) / rated.length).toFixed(1);
  })();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-1">Proof Library</h1>
            <p className="text-muted-foreground">Find, tag, and copy customer proof for any campaign or context</p>
          </div>
          {(isAdmin || isReviewer) && (
            <Button asChild>
              <Link to="/submit">
                <Plus className="h-4 w-4 mr-2" />
                Add Proof
              </Link>
            </Button>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Proof", value: proofItems.length },
            { label: "Published", value: publishedCount },
            { label: "Pending Review", value: pendingCount },
            { label: "Avg Rating", value: avgRating ? `${avgRating} ★` : "—" },
          ].map((s) => (
            <Card key={s.label} className="p-4 bg-gradient-card">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-card-foreground">{isLoading ? "—" : s.value}</p>
            </Card>
          ))}
        </div>

        <div className="flex gap-6">
          {/* Sidebar filters */}
          <aside className="hidden lg:block w-56 shrink-0 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold flex items-center gap-2">
                <Filter className="h-4 w-4" /> Filters
              </span>
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-6 px-2">
                  Clear all
                </Button>
              )}
            </div>

            {/* Status */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Status</p>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rating */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Rating</p>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ratings</SelectItem>
                  <SelectItem value="5">5 stars only</SelectItem>
                  <SelectItem value="4+">4+ stars</SelectItem>
                  <SelectItem value="3+">3+ stars</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Industry */}
            {industries.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Industry</p>
                <Select value={industryFilter} onValueChange={setIndustryFilter}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All industries</SelectItem>
                    {industries.map((i) => (
                      <SelectItem key={i} value={i}>{i}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Tag filters by category */}
            {CATEGORIES.map((cat) => {
              const catTags = tagsByCategory[cat] ?? [];
              if (!catTags.length) return null;
              const expanded = expandedCategories.has(cat);
              return (
                <div key={cat}>
                  <button
                    onClick={() => toggleCategory(cat)}
                    className="w-full flex items-center justify-between text-xs text-muted-foreground uppercase tracking-wide mb-2 hover:text-foreground transition-colors"
                  >
                    {CATEGORY_LABELS[cat]}
                    {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                  {expanded && (
                    <div className="flex flex-wrap gap-1.5">
                      {catTags.map((tag) => (
                        <button key={tag.id} onClick={() => toggleTag(tag.id)}>
                          <Badge
                            variant="outline"
                            className={`text-xs cursor-pointer transition-all ${
                              selectedTagIds.has(tag.id)
                                ? "ring-2 ring-primary ring-offset-1"
                                : "hover:opacity-80"
                            }`}
                          >
                            {tag.name}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Search + export */}
            <div className="flex items-center gap-3 mb-5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer, company, or content..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToCSV(filtered.map((p) => ({ ...p, customerName: p.customer_name, evidenceType: "testimonial", product: "other", email: "", createdAt: p.created_at, updatedAt: p.created_at } as any)))}
                disabled={filtered.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              {hasFilters ? `${filtered.length} of ${proofItems.length}` : proofItems.length} proof items
            </p>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="h-10 w-10 mx-auto mb-4 text-muted-foreground opacity-40" />
                <h3 className="font-semibold mb-1">No proof found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {hasFilters ? "Try adjusting your filters" : "Add your first customer proof"}
                </p>
                {hasFilters && (
                  <Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button>
                )}
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((item) => (
                  <Link key={item.id} to={`/library/${item.id}`} className="group">
                    <Card className="h-full p-5 hover:shadow-medium transition-all hover:-translate-y-0.5 flex flex-col">
                      {/* Top row */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          {item.rating && <StarRating rating={item.rating} />}
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className={`text-xs ${STATUS_COLORS[item.status] ?? ""}`}>
                            {item.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Quote */}
                      <p className="text-sm text-foreground leading-relaxed mb-3 flex-1 line-clamp-4">
                        "{item.content}"
                      </p>

                      {/* Attribution */}
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-foreground">{item.customer_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.job_title ? `${item.job_title} · ` : ""}
                          <span className="flex items-center gap-1 inline-flex">
                            <Building2 className="h-3 w-3" />
                            {item.company}
                          </span>
                        </p>
                        {(item.industry || item.company_size) && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {[item.industry, item.company_size].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </div>

                      {/* Tags */}
                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {item.tags.slice(0, 3).map((tag) => (
                            <TagBadge key={tag.id} tag={tag} />
                          ))}
                          {item.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs text-muted-foreground">
                              +{item.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-border/50">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(item.review_date ?? item.created_at), { addSuffix: true })}
                          {item.integration_source && (
                            <span className="ml-1 uppercase opacity-60">· {item.integration_source}</span>
                          )}
                        </span>
                        <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
                          <QuickCopyButton
                            content={item.content}
                            customerName={item.customer_name}
                            jobTitle={item.job_title}
                            company={item.company}
                          />
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
