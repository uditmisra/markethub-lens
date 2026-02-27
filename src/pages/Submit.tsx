import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { FileUpload } from "@/components/FileUpload";
import { useEvidence } from "@/hooks/useEvidence";
import { useState } from "react";
import { Link } from "react-router-dom";
import { EvidenceType, ProductType } from "@/types/evidence";
import { ArrowLeft, ArrowRight, CheckCircle, MessageSquare, Send } from "lucide-react";

const TOTAL_STEPS = 4;

const Submit = () => {
  const { createEvidence } = useEvidence();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
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
    fileUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    createEvidence.mutate(formData, {
      onSuccess: () => {
        setSubmitted(true);
      },
      onSettled: () => {
        setIsSubmitting(false);
      },
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.customerName && formData.company && formData.email;
      case 2: return formData.evidenceType && formData.product && formData.title && formData.content;
      case 3: return true; // optional step
      case 4: return true; // optional step
      default: return false;
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-lg mx-auto text-center">
            <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-foreground">Thank you!</h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Your testimonial has been submitted successfully.
            </p>
            <Card className="p-6 text-left mb-8 bg-gradient-card">
              <h3 className="font-semibold mb-3 text-card-foreground">What happens next?</h3>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                  Our team reviews your testimonial (usually within 24 hours)
                </li>
                <li className="flex gap-3">
                  <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  Once published, it appears on our public Wall of Love
                </li>
                <li className="flex gap-3">
                  <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                  You can track your submissions in "Testimonial Library"
                </li>
              </ol>
            </Card>
            <div className="flex gap-3 justify-center">
              <Button asChild>
                <Link to="/dashboard">View My Submissions</Link>
              </Button>
              <Button variant="outline" onClick={() => { setSubmitted(false); setCurrentStep(1); setFormData({ customerName: "", company: "", email: "", jobTitle: "", evidenceType: "" as EvidenceType, product: "" as ProductType, title: "", content: "", results: "", useCases: "", fileUrl: "" }); }}>
                Submit Another
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <MessageSquare className="h-4 w-4" />
              We'd love to hear from you
            </div>
            <h1 className="text-4xl font-bold mb-2 text-foreground">Share Your Feedback</h1>
            <p className="text-muted-foreground">
              Tell us about your experience — it only takes a couple of minutes.
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Step {currentStep} of {TOTAL_STEPS}</span>
              <span>{Math.round((currentStep / TOTAL_STEPS) * 100)}%</span>
            </div>
            <Progress value={(currentStep / TOTAL_STEPS) * 100} className="h-2" />
          </div>

          <Card className="p-8 shadow-medium">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Step 1: About You */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-1 text-card-foreground">About You</h2>
                    <p className="text-sm text-muted-foreground">We'll use this to credit you publicly.</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Your Name *</Label>
                      <Input id="customerName" placeholder="Jane Smith" required value={formData.customerName} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company *</Label>
                      <Input id="company" placeholder="Acme Inc." required value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" placeholder="jane@acme.com" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input id="jobTitle" placeholder="Product Manager" value={formData.jobTitle} onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })} />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Your Experience */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-1 text-card-foreground">Your Experience</h2>
                    <p className="text-sm text-muted-foreground">Tell us what you loved and how it helped.</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="evidenceType">Feedback Type *</Label>
                      <Select value={formData.evidenceType} onValueChange={(value) => setFormData({ ...formData, evidenceType: value as EvidenceType })} required>
                        <SelectTrigger id="evidenceType"><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="testimonial">Testimonial</SelectItem>
                          <SelectItem value="case-study">Case Study</SelectItem>
                          <SelectItem value="review">Review</SelectItem>
                          <SelectItem value="quote">Quote</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product">Product/Service *</Label>
                      <Select value={formData.product} onValueChange={(value) => setFormData({ ...formData, product: value as ProductType })} required>
                        <SelectTrigger id="product"><SelectValue placeholder="Select product" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="platform">Platform</SelectItem>
                          <SelectItem value="analytics">Analytics</SelectItem>
                          <SelectItem value="integration">Integration</SelectItem>
                          <SelectItem value="api">API</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Headline *</Label>
                    <Input id="title" placeholder="e.g., Increased conversion rate by 45%" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Your Story *</Label>
                    <Textarea id="content" placeholder="What did you love? How did it help your team?" className="min-h-32" required value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} />
                  </div>
                </div>
              )}

              {/* Step 3: Results (Optional) */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-1 text-card-foreground">Results (Optional)</h2>
                    <p className="text-sm text-muted-foreground">Numbers make great testimonials! Share any measurable results.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="results">Measurable Results</Label>
                    <Textarea id="results" placeholder="e.g., 45% increase in conversions, 2x revenue growth..." className="min-h-24" value={formData.results} onChange={(e) => setFormData({ ...formData, results: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="useCases">Use Cases</Label>
                    <Textarea id="useCases" placeholder="How do you use the product day to day?" className="min-h-24" value={formData.useCases} onChange={(e) => setFormData({ ...formData, useCases: e.target.value })} />
                  </div>
                </div>
              )}

              {/* Step 4: Attachments (Optional) */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-1 text-card-foreground">Attachments (Optional)</h2>
                    <p className="text-sm text-muted-foreground">Have a screenshot or video? Add it here.</p>
                  </div>
                  <FileUpload 
                    onFileUploaded={(url) => setFormData({ ...formData, fileUrl: url })}
                    currentFileUrl={formData.fileUrl}
                    onFileRemoved={() => setFormData({ ...formData, fileUrl: "" })}
                  />
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setCurrentStep(s => s - 1)}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                
                {currentStep < TOTAL_STEPS ? (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(s => s + 1)}
                    disabled={!canProceed()}
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting || !canProceed()}>
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Submitting..." : "Submit Feedback"}
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Submit;
