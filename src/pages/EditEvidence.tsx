import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/FileUpload";
import { useEvidence } from "@/hooks/useEvidence";
import { useUserRole } from "@/hooks/useUserRole";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EvidenceType, ProductType, EvidenceStatus } from "@/types/evidence";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EditEvidence = () => {
  const { id } = useParams();
  const { updateEvidence } = useEvidence();
  const { canApprove } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    company: "",
    email: "",
    jobTitle: "",
    evidenceType: "" as EvidenceType,
    product: "" as ProductType,
    title: "",
    content: "",
    results: "",
    useCases: "",
    status: "" as EvidenceStatus,
    fileUrl: "",
  });

  const { data: evidence, isLoading } = useQuery({
    queryKey: ["evidence", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evidence")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (evidence) {
      setFormData({
        customerName: evidence.customer_name,
        company: evidence.company,
        email: evidence.email,
        jobTitle: evidence.job_title || "",
        evidenceType: evidence.evidence_type,
        product: evidence.product,
        title: evidence.title,
        content: evidence.content,
        results: evidence.results || "",
        useCases: evidence.use_cases || "",
        status: evidence.status,
        fileUrl: evidence.file_url || "",
      });
    }
  }, [evidence]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    updateEvidence.mutate(
      { id: id!, updates: formData },
      {
        onSuccess: () => {
          navigate(`/evidence/${id}`);
        },
        onSettled: () => {
          setIsSubmitting(false);
        },
      }
    );
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
            <h2 className="text-2xl font-bold mb-2">Evidence Not Found</h2>
            <p className="text-muted-foreground mb-6">The evidence you're trying to edit doesn't exist.</p>
            <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/evidence/${id}`)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Evidence
        </Button>

        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-foreground">Edit Evidence</h1>
            <p className="text-muted-foreground">
              Update customer testimonial details and information.
            </p>
          </div>

          <Card className="p-8 shadow-medium">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input 
                    id="customerName" 
                    placeholder="John Doe" 
                    required 
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company *</Label>
                  <Input 
                    id="company" 
                    placeholder="Acme Inc." 
                    required 
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="john@acme.com" 
                    required 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input 
                    id="jobTitle" 
                    placeholder="Product Manager" 
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="evidenceType">Evidence Type *</Label>
                  <Select 
                    required
                    value={formData.evidenceType}
                    onValueChange={(value) => setFormData({ ...formData, evidenceType: value as EvidenceType })}
                  >
                    <SelectTrigger id="evidenceType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="testimonial">Testimonial</SelectItem>
                      <SelectItem value="case-study">Case Study</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="quote">Quote</SelectItem>
                      <SelectItem value="video">Video Testimonial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product">Product/Service *</Label>
                  <Select 
                    required
                    value={formData.product}
                    onValueChange={(value) => setFormData({ ...formData, product: value as ProductType })}
                  >
                    <SelectTrigger id="product">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="platform">Platform</SelectItem>
                      <SelectItem value="analytics">Analytics Tool</SelectItem>
                      <SelectItem value="integration">Integration</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {canApprove && (
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as EvidenceStatus })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Title/Headline *</Label>
                <Input 
                  id="title" 
                  placeholder="e.g., Increased conversion rate by 45%" 
                  required 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Full Testimonial/Story *</Label>
                <Textarea 
                  id="content" 
                  placeholder="Share the full customer testimonial, success story, or feedback..."
                  className="min-h-32"
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="results">Key Results/Metrics</Label>
                <Textarea 
                  id="results" 
                  placeholder="e.g., 45% increase in conversions, $100K saved annually, 3x faster deployment"
                  className="min-h-24"
                  value={formData.results}
                  onChange={(e) => setFormData({ ...formData, results: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="useCases">Use Cases/Applications</Label>
                <Input 
                  id="useCases" 
                  placeholder="e.g., Lead generation, Customer onboarding, Sales enablement"
                  value={formData.useCases}
                  onChange={(e) => setFormData({ ...formData, useCases: e.target.value })}
                />
              </div>

              <FileUpload 
                onFileUploaded={(url) => setFormData({ ...formData, fileUrl: url })}
                currentFileUrl={formData.fileUrl}
                onFileRemoved={() => setFormData({ ...formData, fileUrl: "" })}
              />

              <div className="flex gap-4 pt-4">
                <Button type="submit" size="lg" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="lg" 
                  onClick={() => navigate(`/evidence/${id}`)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditEvidence;
