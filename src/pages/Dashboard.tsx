import { Header } from "@/components/Header";
import { EvidenceCard } from "@/components/EvidenceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useEvidence } from "@/hooks/useEvidence";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, FileText, CheckCircle2, Clock, Archive, Loader2, LogOut, Shield, Download, Filter, Calendar as CalendarIcon, X } from "lucide-react";
import { EvidenceType, EvidenceStatus, ProductType } from "@/types/evidence";
import { exportToCSV, exportToJSON } from "@/utils/exportData";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { calculateCompleteness } from "@/utils/calculateCompleteness";
import { toast } from "sonner";

const Dashboard = () => {
  const { evidence, isLoading, updateEvidence } = useEvidence();
  const { signOut } = useAuth();
  const { roles, isAdmin, isReviewer } = useUserRole();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<EvidenceType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<EvidenceStatus | "all">("all");
  const [filterProduct, setFilterProduct] = useState<ProductType | "all">("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [filterRating, setFilterRating] = useState<string>("all");
  const [filterCompanySize, setFilterCompanySize] = useState<string>("all");
  const [filterIndustry, setFilterIndustry] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterCompleteness, setFilterCompleteness] = useState<string>("all");
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Extract unique company sizes and industries from evidence
  const uniqueCompanySizes = Array.from(new Set(evidence.map(e => e.company_size).filter(Boolean)));
  const uniqueIndustries = Array.from(new Set(evidence.map(e => e.industry).filter(Boolean)));

  const filteredEvidence = evidence.filter(ev => {
    const matchesSearch = ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ev.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ev.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ev.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ev.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ev.results?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ev.useCases?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || ev.evidenceType === filterType;
    const matchesStatus = filterStatus === "all" || ev.status === filterStatus;
    const matchesProduct = filterProduct === "all" || ev.product === filterProduct;
    const matchesSource = filterSource === "all" || 
                         (filterSource === "manual" && !ev.integration_source) ||
                         ev.integration_source === filterSource;
    const matchesRating = filterRating === "all" || 
                         (filterRating === "5" && ev.rating === 5) ||
                         (filterRating === "4+" && ev.rating && ev.rating >= 4) ||
                         (filterRating === "3+" && ev.rating && ev.rating >= 3);
    const matchesCompanySize = filterCompanySize === "all" || ev.company_size === filterCompanySize;
    const matchesIndustry = filterIndustry === "all" || ev.industry === filterIndustry;
    
    const reviewDate = new Date(ev.review_date || ev.createdAt);
    const matchesDateFrom = !dateFrom || reviewDate >= dateFrom;
    const matchesDateTo = !dateTo || reviewDate <= dateTo;
    
    const completeness = calculateCompleteness(ev);
    const matchesCompleteness = filterCompleteness === "all" ||
                               (filterCompleteness === "excellent" && completeness.score >= 90) ||
                               (filterCompleteness === "good" && completeness.score >= 70 && completeness.score < 90) ||
                               (filterCompleteness === "fair" && completeness.score >= 50 && completeness.score < 70) ||
                               (filterCompleteness === "incomplete" && completeness.score < 50);
    
    return matchesSearch && matchesType && matchesStatus && matchesProduct && matchesSource && 
           matchesRating && matchesCompanySize && matchesIndustry && matchesDateFrom && matchesDateTo &&
           matchesCompleteness;
  });

  const clearAllFilters = () => {
    setSearchTerm("");
    setFilterType("all");
    setFilterStatus("all");
    setFilterProduct("all");
    setFilterSource("all");
    setFilterRating("all");
    setFilterCompanySize("all");
    setFilterIndustry("all");
    setDateFrom(undefined);
    setDateTo(undefined);
    setFilterCompleteness("all");
    setActivePreset(null);
  };

  const applyPreset = (preset: string) => {
    clearAllFilters();
    setActivePreset(preset);
    
    switch(preset) {
      case "high-value":
        // 5-star enterprise + excellent quality
        setFilterRating("5");
        setFilterCompleteness("excellent");
        setFilterCompanySize("1001-5000"); // Typically enterprise size
        break;
      case "needs-attention":
        // Pending from last 7 days
        setFilterStatus("pending");
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        setDateFrom(sevenDaysAgo);
        break;
      case "top-testimonials":
        // 5-star published with excellent/good quality
        setFilterRating("5");
        setFilterStatus("published");
        setFilterCompleteness("excellent");
        break;
      case "my-published":
        setFilterStatus("published");
        break;
    }
  };

  const handleQuickPublish = async (id: string) => {
    try {
      await updateEvidence.mutateAsync({
        id,
        updates: { status: "published" as EvidenceStatus },
      });
      toast.success("Evidence published successfully!");
    } catch (error) {
      toast.error("Failed to publish evidence");
    }
  };

  const hasActiveFilters = searchTerm || filterType !== "all" || filterStatus !== "all" || 
                          filterProduct !== "all" || filterSource !== "all" || filterRating !== "all" || 
                          filterCompanySize !== "all" || filterIndustry !== "all" || dateFrom || dateTo ||
                          filterCompleteness !== "all";

  const stats = [
    {
      label: "Total Evidence",
      value: evidence.length,
      icon: FileText,
      color: "text-primary"
    },
    {
      label: "Published",
      value: evidence.filter(e => e.status === "published").length,
      icon: CheckCircle2,
      color: "text-success"
    },
    {
      label: "Pending Review",
      value: evidence.filter(e => e.status === "pending").length,
      icon: Clock,
      color: "text-warning"
    },
    {
      label: "Archived",
      value: evidence.filter(e => e.status === "archived").length,
      icon: Archive,
      color: "text-muted-foreground"
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-foreground">Evidence Dashboard</h1>
              {(isAdmin || isReviewer) && (
                <Badge variant="outline" className="text-sm">
                  <Shield className="h-3 w-3 mr-1" />
                  {isAdmin ? "Admin" : "Reviewer"}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">Manage and organize all your customer evidence</p>
          </div>
          <div className="flex gap-2">
            <Button asChild size="lg" className="shadow-medium">
              <Link to="/submit">
                <Plus className="h-4 w-4 mr-2" />
                Add Evidence
              </Link>
            </Button>
            <Button onClick={signOut} variant="outline" size="lg">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 bg-gradient-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-card-foreground">{stat.value}</p>
                </div>
                <div className={`p-3 bg-muted rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Filters and Search */}
        <Card className="p-6 mb-8">
          {/* Filter Presets */}
          <div className="mb-6 pb-6 border-b">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Quick Filters</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activePreset === "high-value" ? "default" : "outline"}
                size="sm"
                onClick={() => applyPreset("high-value")}
                className="gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                High-value Reviews
              </Button>
              <Button
                variant={activePreset === "needs-attention" ? "default" : "outline"}
                size="sm"
                onClick={() => applyPreset("needs-attention")}
                className="gap-2"
              >
                <Clock className="h-4 w-4" />
                Needs Attention
              </Button>
              <Button
                variant={activePreset === "top-testimonials" ? "default" : "outline"}
                size="sm"
                onClick={() => applyPreset("top-testimonials")}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Top Testimonials
              </Button>
              <Button
                variant={activePreset === "my-published" ? "default" : "outline"}
                size="sm"
                onClick={() => applyPreset("my-published")}
                className="gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                My Published Reviews
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Filters & Search</h2>
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  {filteredEvidence.length} results
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                {showAdvancedFilters ? "Hide" : "Show"} Advanced
              </Button>
            </div>
          </div>
          
          {/* Basic Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search evidence..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setActivePreset(null); }}
                className="pl-9"
              />
            </div>

            <Select value={filterType} onValueChange={(value) => { setFilterType(value as EvidenceType | "all"); setActivePreset(null); }}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="testimonial">Testimonial</SelectItem>
                <SelectItem value="case-study">Case Study</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="quote">Quote</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={(value) => { setFilterStatus(value as EvidenceStatus | "all"); setActivePreset(null); }}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterProduct} onValueChange={(value) => { setFilterProduct(value as ProductType | "all"); setActivePreset(null); }}>
              <SelectTrigger>
                <SelectValue placeholder="Product" />
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

            <Select value={filterSource} onValueChange={(value) => { setFilterSource(value); setActivePreset(null); }}>
              <SelectTrigger>
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="g2">G2</SelectItem>
                <SelectItem value="capterra">Capterra</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t">
              <Select value={filterRating} onValueChange={(value) => { setFilterRating(value); setActivePreset(null); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">⭐⭐⭐⭐⭐ (5 stars)</SelectItem>
                  <SelectItem value="4+">⭐⭐⭐⭐ (4+ stars)</SelectItem>
                  <SelectItem value="3+">⭐⭐⭐ (3+ stars)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterCompanySize} onValueChange={(value) => { setFilterCompanySize(value); setActivePreset(null); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Company Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sizes</SelectItem>
                  {uniqueCompanySizes.map(size => (
                    <SelectItem key={size} value={size!}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterIndustry} onValueChange={(value) => { setFilterIndustry(value); setActivePreset(null); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {uniqueIndustries.map(industry => (
                    <SelectItem key={industry} value={industry!}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterCompleteness} onValueChange={(value) => { setFilterCompleteness(value); setActivePreset(null); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Quality Score" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Quality</SelectItem>
                  <SelectItem value="excellent">Excellent (90%+)</SelectItem>
                  <SelectItem value="good">Good (70-89%)</SelectItem>
                  <SelectItem value="fair">Fair (50-69%)</SelectItem>
                  <SelectItem value="incomplete">Incomplete (&lt;50%)</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        !dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "MMM dd") : "From date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={(date) => { setDateFrom(date); setActivePreset(null); }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        !dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "MMM dd") : "To date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={(date) => { setDateTo(date); setActivePreset(null); }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {filteredEvidence.length} of {evidence.length} evidence items
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportToCSV(filteredEvidence)}
                disabled={filteredEvidence.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportToJSON(filteredEvidence)}
                disabled={filteredEvidence.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
            </div>
          </div>
        </Card>

        {/* Evidence Grid */}
        <div>
          {filteredEvidence.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvidence.map((item) => (
                <EvidenceCard 
                  key={item.id} 
                  evidence={item}
                  showQuickActions={isAdmin || isReviewer}
                  onQuickPublish={handleQuickPublish}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                {evidence.length === 0 ? 'No evidence yet' : 'No evidence found'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {evidence.length === 0 
                  ? 'Get started by submitting evidence manually or setting up a review site integration.'
                  : searchTerm || filterType !== "all" || filterStatus !== "all" || filterProduct !== "all"
                  ? "Try adjusting your filters or search term"
                  : "Start by adding your first piece of customer evidence"}
              </p>
              {evidence.length === 0 ? (
                <div className="flex gap-3 justify-center">
                  <Button asChild>
                    <Link to="/submit">
                      <Plus className="h-4 w-4 mr-2" />
                      Submit Evidence
                    </Link>
                  </Button>
                  {isAdmin && (
                    <Button variant="outline" asChild>
                      <Link to="/integrations">
                        Set Up Integration
                      </Link>
                    </Button>
                  )}
                </div>
              ) : (
                <Button asChild>
                  <Link to="/submit">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Evidence
                  </Link>
                </Button>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
