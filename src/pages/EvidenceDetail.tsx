import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Evidence } from "@/types/evidence";
import { useParams, useNavigate } from "react-router-dom";
import { Building2, Calendar, Mail, User, Briefcase, ArrowLeft, FileText, Target, Loader2 } from "lucide-react";

const EvidenceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: evidence, isLoading } = useQuery({
    queryKey: ["evidence", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evidence")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      
      return {
        id: data.id,
        customerName: data.customer_name,
        company: data.company,
        email: data.email,
        jobTitle: data.job_title,
        evidenceType: data.evidence_type,
        product: data.product,
        title: data.title,
        content: data.content,
        results: data.results,
        useCases: data.use_cases,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      } as Evidence;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!evidence) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-card-foreground">Evidence Not Found</h2>
            <p className="text-muted-foreground mb-6">The evidence you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
          </Card>
        </div>
      </div>
    );
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
    video: "Video Testimonial"
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8 shadow-medium">
              <div className="flex items-start gap-4 mb-6">
                <Badge variant="outline" className="text-sm">
                  {typeLabels[evidence.evidenceType]}
                </Badge>
                <Badge variant="outline" className={`text-sm ${statusColors[evidence.status]}`}>
                  {evidence.status}
                </Badge>
                <Badge variant="secondary" className="text-sm ml-auto">
                  {evidence.product}
                </Badge>
              </div>

              <h1 className="text-3xl font-bold mb-4 text-card-foreground">
                {evidence.title}
              </h1>

              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {evidence.content}
                </p>
              </div>
            </Card>

            {evidence.results && (
              <Card className="p-6 bg-success/5 border-success/20">
                <div className="flex items-start gap-3 mb-3">
                  <Target className="h-5 w-5 text-success mt-1" />
                  <h3 className="text-xl font-semibold text-card-foreground">Key Results & Metrics</h3>
                </div>
                <p className="text-card-foreground leading-relaxed">{evidence.results}</p>
              </Card>
            )}

            {evidence.useCases && (
              <Card className="p-6 bg-gradient-card">
                <h3 className="text-xl font-semibold mb-3 text-card-foreground">Use Cases</h3>
                <p className="text-muted-foreground">{evidence.useCases}</p>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-card">
              <h3 className="text-lg font-semibold mb-4 text-card-foreground">Customer Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium text-card-foreground">{evidence.customerName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-medium text-card-foreground">{evidence.company}</p>
                  </div>
                </div>

                {evidence.jobTitle && (
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Job Title</p>
                      <p className="font-medium text-card-foreground">{evidence.jobTitle}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium text-card-foreground break-all">{evidence.email}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-card">
              <h3 className="text-lg font-semibold mb-4 text-card-foreground">Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium text-card-foreground">
                      {new Date(evidence.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="font-medium text-card-foreground">
                      {new Date(evidence.updatedAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-hero">
              <h3 className="text-lg font-semibold mb-3 text-primary-foreground">Actions</h3>
              <div className="space-y-2">
                <Button variant="secondary" className="w-full">
                  Edit Evidence
                </Button>
                <Button variant="secondary" className="w-full">
                  Export
                </Button>
                <Button variant="secondary" className="w-full">
                  Share
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvidenceDetail;
