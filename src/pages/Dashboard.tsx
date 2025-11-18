import { Header } from "@/components/Header";
import { EvidenceCard } from "@/components/EvidenceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useEvidence } from "@/hooks/useEvidence";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, FileText, CheckCircle2, Clock, Archive, Loader2, LogOut } from "lucide-react";
import { EvidenceType, EvidenceStatus, ProductType } from "@/types/evidence";

const Dashboard = () => {
  const { evidence, isLoading } = useEvidence();
  const { signOut } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<EvidenceType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<EvidenceStatus | "all">("all");
  const [filterProduct, setFilterProduct] = useState<ProductType | "all">("all");

  const filteredEvidence = evidence.filter(ev => {
    const matchesSearch = ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ev.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ev.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || ev.evidenceType === filterType;
    const matchesStatus = filterStatus === "all" || ev.status === filterStatus;
    const matchesProduct = filterProduct === "all" || ev.product === filterProduct;
    
    return matchesSearch && matchesType && matchesStatus && matchesProduct;
  });

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
            <h1 className="text-4xl font-bold text-foreground mb-2">Evidence Dashboard</h1>
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

        {/* Filters */}
        <Card className="p-6 mb-8 shadow-soft">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search evidence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={(value) => setFilterType(value as EvidenceType | "all")}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
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

            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as EvidenceStatus | "all")}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterProduct} onValueChange={(value) => setFilterProduct(value as ProductType | "all")}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by product" />
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
          </div>
        </Card>

        {/* Evidence Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-foreground">
              {filteredEvidence.length} {filteredEvidence.length === 1 ? 'Result' : 'Results'}
            </h2>
          </div>
          
          {filteredEvidence.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredEvidence.map((evidence) => (
                <EvidenceCard key={evidence.id} evidence={evidence} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">No evidence found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters or add new customer evidence.
              </p>
              <Button asChild>
                <Link to="/submit">Add Evidence</Link>
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
