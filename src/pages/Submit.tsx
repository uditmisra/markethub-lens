import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEvidence } from "@/hooks/useEvidence";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EvidenceType, ProductType } from "@/types/evidence";

const Submit = () => {
  const { createEvidence } = useEvidence();
  const navigate = useNavigate();
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
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    createEvidence.mutate(formData, {
      onSuccess: () => {
        navigate("/dashboard");
      },
      onSettled: () => {
        setIsSubmitting(false);
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-foreground">Submit Customer Evidence</h1>
            <p className="text-muted-foreground">
              Share customer testimonials, success stories, and feedback to help build credibility.
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

              <div className="flex gap-4 pt-4">
                <Button type="submit" size="lg" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? "Submitting..." : "Submit Evidence"}
                </Button>
                <Button type="button" variant="outline" size="lg" onClick={() => navigate("/dashboard")}>
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

export default Submit;
