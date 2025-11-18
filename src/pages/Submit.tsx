import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Submit = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Evidence Submitted Successfully!",
      description: "Your customer evidence has been added to the dashboard.",
    });

    setIsSubmitting(false);
    navigate("/dashboard");
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
                  <Input id="customerName" placeholder="John Doe" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company *</Label>
                  <Input id="company" placeholder="Acme Inc." required />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" placeholder="john@acme.com" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input id="jobTitle" placeholder="Product Manager" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="evidenceType">Evidence Type *</Label>
                  <Select required>
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
                  <Select required>
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Full Testimonial/Story *</Label>
                <Textarea 
                  id="content" 
                  placeholder="Share the full customer testimonial, success story, or feedback..."
                  className="min-h-32"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="results">Key Results/Metrics</Label>
                <Textarea 
                  id="results" 
                  placeholder="e.g., 45% increase in conversions, $100K saved annually, 3x faster deployment"
                  className="min-h-24"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="useCases">Use Cases/Applications</Label>
                <Input 
                  id="useCases" 
                  placeholder="e.g., Lead generation, Customer onboarding, Sales enablement"
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
