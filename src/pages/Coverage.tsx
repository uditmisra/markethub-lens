import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTags } from "@/hooks/useTags";
import { Tag } from "@/types/tags";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { AlertTriangle, TrendingUp, Calendar, Star, ArrowRight, Plus } from "lucide-react";
import { differenceInMonths } from "date-fns";

const CHART_COLORS = ["hsl(var(--primary))", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#06b6d4", "#ec4899"];
const PIE_COLORS = ["hsl(var(--primary))", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444"];

const FRESHNESS_BRACKETS = [
  { label: "< 3 months", months: 3 },
  { label: "3–6 months", months: 6 },
  { label: "6–12 months", months: 12 },
  { label: "12+ months", months: Infinity },
];

interface ProofItem {
  id: string;
  industry: string | null;
  company_size: string | null;
  rating: number | null;
  status: string;
  created_at: string;
  review_date: string | null;
  tags: Tag[];
}

export default function Coverage() {
  const { tags: allTags } = useTags();

  const { data: proof = [], isLoading } = useQuery({
    queryKey: ["proof-coverage"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evidence")
        .select("id, industry, company_size, rating, status, created_at, review_date, evidence_tags(tag_id)")
        .eq("status", "published");

      if (error) throw error;

      const tagMap = Object.fromEntries(allTags.map((t) => [t.id, t]));
      return (data ?? []).map((item) => ({
        ...item,
        tags: (item.evidence_tags ?? [])
          .map((et: { tag_id: string }) => tagMap[et.tag_id])
          .filter(Boolean) as Tag[],
      })) as ProofItem[];
    },
    enabled: allTags.length >= 0,
  });

  const published = proof;

  // Industry coverage
  const industryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    published.forEach((p) => {
      const key = p.industry || "Unknown";
      counts[key] = (counts[key] ?? 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [published]);

  // Use-case tag coverage
  const useCaseTags = allTags.filter((t) => t.category === "use_case");
  const useCaseCoverage = useMemo(() => {
    return useCaseTags.map((tag) => ({
      name: tag.name,
      count: published.filter((p) => p.tags.some((t) => t.id === tag.id)).length,
    })).sort((a, b) => b.count - a.count);
  }, [published, useCaseTags]);

  // Company size distribution
  const sizeData = useMemo(() => {
    const counts: Record<string, number> = {};
    published.forEach((p) => {
      const key = p.company_size || "Unknown";
      counts[key] = (counts[key] ?? 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [published]);

  // Freshness
  const now = new Date();
  const freshnessData = useMemo(() => {
    const buckets: number[] = new Array(FRESHNESS_BRACKETS.length).fill(0);
    published.forEach((p) => {
      const months = differenceInMonths(now, new Date(p.review_date ?? p.created_at));
      const idx = FRESHNESS_BRACKETS.findIndex((b) => months < b.months);
      buckets[idx === -1 ? FRESHNESS_BRACKETS.length - 1 : idx]++;
    });
    return FRESHNESS_BRACKETS.map((b, i) => ({ name: b.label, count: buckets[i] }));
  }, [published]);

  // Rating distribution
  const ratingData = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    published.forEach((p) => { if (p.rating) counts[p.rating] = (counts[p.rating] ?? 0) + 1; });
    return Object.entries(counts).map(([r, count]) => ({ name: `${r}★`, count }));
  }, [published]);

  // Gap analysis
  const missingIndustries: string[] = []; // would need a predefined list
  const missingUseCases = useCaseCoverage.filter((u) => u.count === 0).map((u) => u.name);
  const staleCount = freshnessData[freshnessData.length - 1].count; // 12+ months

  const avgRating = useMemo(() => {
    const rated = published.filter((p) => p.rating);
    if (!rated.length) return null;
    return (rated.reduce((s, p) => s + (p.rating ?? 0), 0) / rated.length).toFixed(1);
  }, [published]);

  const freshCount = freshnessData[0].count + freshnessData[1].count;

  const stats = [
    { label: "Published Proof", value: published.length, icon: TrendingUp, color: "text-primary" },
    { label: "Avg Rating", value: avgRating ? `${avgRating} ★` : "—", icon: Star, color: "text-amber-500" },
    { label: "Fresh (< 6mo)", value: freshCount, icon: Calendar, color: "text-success" },
    { label: "Use Cases Covered", value: `${useCaseCoverage.filter((u) => u.count > 0).length} / ${useCaseTags.length}`, icon: TrendingUp, color: "text-blue-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-1">Coverage Analysis</h1>
          <p className="text-muted-foreground">Identify gaps in your proof library so you know exactly what to collect next</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <Card key={s.label} className="p-5 bg-gradient-card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold text-card-foreground">{isLoading ? "—" : s.value}</p>
            </Card>
          ))}
        </div>

        {/* Gaps callout */}
        {(missingUseCases.length > 0 || staleCount > 0) && (
          <Card className="p-5 mb-8 border-warning/30 bg-warning/5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">Proof gaps to fill</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {missingUseCases.slice(0, 8).map((uc) => (
                    <Badge key={uc} variant="outline" className="text-xs bg-warning/10 text-warning border-warning/20">
                      Missing: {uc}
                    </Badge>
                  ))}
                  {staleCount > 0 && (
                    <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-600 border-orange-200">
                      {staleCount} proof item{staleCount > 1 ? "s" : ""} over 12 months old
                    </Badge>
                  )}
                </div>
                <Button size="sm" asChild>
                  <Link to="/submit">
                    <Plus className="h-4 w-4 mr-2" />
                    Add proof to fill gaps
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Industry Coverage */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Coverage by Industry</CardTitle>
            </CardHeader>
            <CardContent>
              {industryCounts.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No industry data yet — add industry tags to your proof</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={industryCounts} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Use Case Coverage */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                Coverage by Use Case
                <Button variant="ghost" size="sm" asChild className="text-xs">
                  <Link to="/library">
                    View library <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {useCaseCoverage.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No use-case tags yet — tag your proof to track coverage</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={useCaseCoverage} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      radius={[0, 4, 4, 0]}
                    >
                      {useCaseCoverage.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={entry.count === 0 ? "hsl(var(--muted))" : "hsl(var(--primary))"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Company Size */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Company Size Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {sizeData.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No company size data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={sizeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {sizeData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Freshness */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Proof Freshness</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={freshnessData} margin={{ left: 0, right: 20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {freshnessData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          i === 0 ? "#10b981"
                          : i === 1 ? "hsl(var(--primary))"
                          : i === 2 ? "#f59e0b"
                          : "#ef4444"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground text-center mt-2">Based on review date or import date</p>
            </CardContent>
          </Card>

          {/* Rating Distribution */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Star Rating Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={ratingData} margin={{ left: 0, right: 20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 13 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
