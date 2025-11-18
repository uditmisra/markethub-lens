import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { FileText, Users, BarChart3, Star, MessageSquare, Award } from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: MessageSquare,
      title: "Collect Testimonials",
      description: "Gather customer feedback and testimonials through simple, customizable forms."
    },
    {
      icon: Users,
      title: "Case Studies",
      description: "Document detailed customer success stories and use cases for your products."
    },
    {
      icon: BarChart3,
      title: "Track & Organize",
      description: "Manage all your customer evidence in one central, searchable dashboard."
    },
    {
      icon: Award,
      title: "Showcase Success",
      description: "Highlight customer wins and build credibility with prospects."
    },
    {
      icon: Star,
      title: "Filter & Sort",
      description: "Easily find the right evidence by product, type, or status."
    },
    {
      icon: FileText,
      title: "Export & Share",
      description: "Use collected evidence across your marketing materials and campaigns."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-5" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
              Turn Customer Success Into Marketing Gold
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Collect, organize, and showcase customer testimonials, case studies, and evidence that drives conversions.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" asChild className="shadow-medium">
                <Link to="/auth">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/dashboard">View Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Everything You Need for Customer Evidence</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A complete platform designed for product marketing teams to capture and leverage customer success stories.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-medium transition-shadow bg-gradient-card">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="p-12 text-center bg-gradient-hero">
          <h2 className="text-3xl font-bold mb-4 text-primary-foreground">Ready to Start Collecting Evidence?</h2>
          <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join product marketing teams who are already leveraging customer success stories to drive growth.
          </p>
          <Button size="lg" variant="secondary" asChild className="shadow-large">
            <Link to="/auth">Get Started Now</Link>
          </Button>
        </Card>
      </section>
    </div>
  );
};

export default Index;
