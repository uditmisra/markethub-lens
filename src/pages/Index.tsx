import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Heart, MessageSquare, CheckCircle, Globe, ArrowRight } from "lucide-react";

const Index = () => {
  const steps = [
    {
      icon: MessageSquare,
      step: "1",
      title: "Customers share feedback",
      description: "A simple form where customers write what they love about your product.",
    },
    {
      icon: CheckCircle,
      step: "2",
      title: "You review & publish",
      description: "One click to make a testimonial live. No extra steps, no confusion.",
    },
    {
      icon: Globe,
      step: "3",
      title: "Beautiful wall + embeds",
      description: "A public Wall of Love you can embed anywhere on your site.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-5" />
        <div className="container mx-auto px-4 py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Heart className="h-4 w-4" />
              Your customers already love you
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground leading-tight">
              Your Wall of Love —{" "}
              <span className="text-primary">Automatically</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Collect customer testimonials. Publish them with one click. 
              Display them beautifully. Share them everywhere.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" asChild className="shadow-medium text-base px-8">
                <Link to="/testimonials">
                  See the Wall of Love
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base px-8">
                <Link to="/auth">Start Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Three steps. That's it.</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            No complex setup. No training needed. Just testimonials, published.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <Card key={index} className="p-8 text-center hover:shadow-medium transition-shadow bg-gradient-card relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                {step.step}
              </div>
              <div className="bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center mb-5 mx-auto">
                <step.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Wall of Love Preview */}
      <section className="bg-muted/30 py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">See what customers are saying</h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-8">
            Real testimonials from real customers, published and ready to share.
          </p>
          <Button size="lg" asChild className="shadow-medium">
            <Link to="/testimonials">
              View the Wall of Love
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <Card className="p-12 text-center bg-gradient-hero">
          <h2 className="text-3xl font-bold mb-4 text-primary-foreground">Ready to show off your happy customers?</h2>
          <p className="text-primary-foreground/90 mb-8 max-w-xl mx-auto">
            Start collecting testimonials in minutes. No credit card required.
          </p>
          <Button size="lg" variant="secondary" asChild className="shadow-large">
            <Link to="/auth">Get Started Free</Link>
          </Button>
        </Card>
      </section>
    </div>
  );
};

export default Index;
