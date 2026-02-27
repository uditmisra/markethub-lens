import { useEffect, useState } from "react";
import { Heart, Star, Sparkles, MessageCircle } from "lucide-react";

interface StatsHeroProps {
  totalCount: number;
  averageRating: number;
}

const AnimatedCounter = ({ end, duration = 1500, suffix = "" }: { end: number; duration?: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (end === 0) return;
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start * 10) / 10);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{suffix === "." ? count.toFixed(1) : Math.round(count)}{suffix === "." ? "" : suffix}</span>;
};

const FloatingParticle = ({ delay, icon: Icon, className }: { delay: number; icon: any; className?: string }) => (
  <div
    className={`absolute animate-float-particle opacity-60 ${className}`}
    style={{ animationDelay: `${delay}s` }}
  >
    <Icon className="h-5 w-5" />
  </div>
);

const StatsHero = ({ totalCount, averageRating }: StatsHeroProps) => {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/95 via-primary/80 to-accent/60 p-8 md:p-12 text-primary-foreground mb-10">
      {/* Floating particles */}
      <FloatingParticle delay={0} icon={Heart} className="top-6 left-[10%] text-primary-foreground/30" />
      <FloatingParticle delay={1.2} icon={Sparkles} className="top-12 right-[15%] text-primary-foreground/20" />
      <FloatingParticle delay={2.4} icon={Heart} className="bottom-8 left-[25%] text-primary-foreground/25" />
      <FloatingParticle delay={0.8} icon={Star} className="top-4 right-[30%] text-primary-foreground/20" />
      <FloatingParticle delay={3.2} icon={Sparkles} className="bottom-6 right-[10%] text-primary-foreground/30" />
      <FloatingParticle delay={1.8} icon={Heart} className="top-16 left-[50%] text-primary-foreground/15" />

      <div className="relative z-10 text-center">
        <div className="inline-flex items-center gap-2 bg-primary-foreground/15 backdrop-blur-sm rounded-full px-5 py-2 text-sm font-medium mb-6">
          <Heart className="h-4 w-4 fill-current" />
          Wall of Love
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
          Our Customers Love Us
        </h1>
        <p className="text-lg md:text-xl opacity-85 mb-10 max-w-2xl mx-auto">
          Real stories, real impact. Here's what people are saying.
        </p>

        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          <div className="flex flex-col items-center">
            <div className="text-5xl md:text-6xl font-bold tabular-nums">
              <AnimatedCounter end={totalCount} />
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-sm opacity-80">
              <MessageCircle className="h-4 w-4" />
              Testimonials
            </div>
          </div>
          <div className="w-px bg-primary-foreground/20 hidden md:block" />
          <div className="flex flex-col items-center">
            <div className="text-5xl md:text-6xl font-bold tabular-nums">
              <AnimatedCounter end={averageRating} suffix="." />
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-sm opacity-80">
              <Star className="h-4 w-4 fill-current" />
              Average Rating
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsHero;
