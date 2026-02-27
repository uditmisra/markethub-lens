import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Evidence } from "@/types/evidence";
import { useParams, useNavigate } from "react-router-dom";
import { useEvidence } from "@/hooks/useEvidence";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { Building2, Calendar, Mail, User, Briefcase, ArrowLeft, FileText, Target, Loader2, Edit, Trash2, Archive } from "lucide-react";
import ReviewContent from "@/components/ReviewContent";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const statusLabels: Record<string, string> = {
  pending: "Pending Review",
  approved: "Published",
  published: "Published",
  archived: "Archived",
};

const EvidenceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canDelete, canEditAll } = useUserRole();
  const { deleteEvidence, archiveEvidence } = useEvidence();
  
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
        createdBy: data.created_by,
        review_data: data.review_data,
      } as Evidence & { createdBy: string };
    },
  });

  const canEdit = canEditAll || (user && evidence?.createdBy === user.id);

  const handleDelete = () => {
    deleteEvidence.mutate(id!, {
      onSuccess: () => {
        navigate("/dashboard");
      },
    });
  };

  const handleArchive = () => {
    archiveEvidence.mutate(id!);
  };

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
            <h2 className="text-2xl font-bold mb-2 text-card-foreground">Testimonial Not Found</h2>
            <p className="text-muted-foreground mb-6">The testimonial you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/dashboard")}>Back to Library</Button>
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
          Back to Library
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
                  {statusLabels[evidence.status] || evidence.status}
                </Badge>
                <Badge variant="secondary" className="text-sm ml-auto">
                  {evidence.product}
                </Badge>
              </div>

              <h1 className="text-3xl font-bold mb-4 text-card-foreground">
                {evidence.title}
              </h1>

              <ReviewContent 
                reviewData={evidence.review_data}
                content={evidence.content}
              />
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
                    <p className="text-sm text-muted-foreground">Submitted</p>
                    <p className="font-medium text-card-foreground">
                      {new Date(evidence.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', month: 'long', day: 'numeric' 
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
                        year: 'numeric', month: 'long', day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-hero">
              <h3 className="text-lg font-semibold mb-3 text-primary-foreground">Actions</h3>
              <div className="space-y-2">
                {canEdit && (
                  <Button 
                    variant="secondary" 
                    className="w-full"
                    onClick={() => navigate(`/evidence/${id}/edit`)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
                
                {evidence.status !== "archived" && canEdit && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="secondary" className="w-full">
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Archive Testimonial</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will hide the testimonial from public view. You can unarchive it later.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleArchive}>Archive</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {canDelete && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Testimonial</AlertDialogTitle>
                        <AlertDialogDescription>
                          This permanently removes the testimonial. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvidenceDetail;
