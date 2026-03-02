import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface FormatStudioProps {
  customerName: string;
  jobTitle?: string;
  company: string;
  industry?: string;
  companySize?: string;
  content: string;
  results?: string;
  useCases?: string;
  rating?: number;
  title: string;
}

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2 shrink-0">
      {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
};

const FormatBlock = ({ text }: { text: string }) => (
  <div className="relative">
    <Textarea
      value={text}
      readOnly
      className="resize-none bg-muted/40 font-mono text-sm min-h-[120px] pr-4"
      rows={Math.min(12, text.split("\n").length + 2)}
    />
  </div>
);

export const FormatStudio = ({
  customerName,
  jobTitle,
  company,
  industry,
  companySize,
  content,
  results,
  useCases,
  rating,
  title,
}: FormatStudioProps) => {
  const attribution = jobTitle
    ? `— ${customerName}, ${jobTitle} at ${company}`
    : `— ${customerName}, ${company}`;

  const shortAttribution = jobTitle
    ? `${customerName}, ${jobTitle} @ ${company}`
    : `${customerName} @ ${company}`;

  // Trim content to first 2-3 sentences for pull quote
  const sentences = content.match(/[^.!?]+[.!?]+/g) ?? [content];
  const pullQuoteContent = sentences.slice(0, 2).join(" ").trim();

  const stars = rating ? "⭐".repeat(rating) : "";

  const pullQuote = `"${pullQuoteContent}"\n\n${attribution}`;

  const emailSnippet = `Here's what ${customerName} from ${company} had to say:\n\n"${content}"\n\n${attribution}${industry ? `\nIndustry: ${industry}` : ""}${companySize ? ` · ${companySize}` : ""}`;

  const landingPageHero = `${stars ? `${stars}\n\n` : ""}"${content}"\n\n${customerName}\n${jobTitle ? `${jobTitle}, ` : ""}${company}${industry ? ` · ${industry}` : ""}`;

  const socialPost = `"${pullQuoteContent}"\n\n${shortAttribution}${industry ? ` · ${industry}` : ""}\n\n${results ? `Key result: ${results}\n\n` : ""}#CustomerStory #SocialProof`;

  const caseStudy = [
    `## ${title}`,
    "",
    `**Customer:** ${customerName}${jobTitle ? `, ${jobTitle}` : ""} at ${company}`,
    industry ? `**Industry:** ${industry}` : null,
    companySize ? `**Company Size:** ${companySize}` : null,
    "",
    useCases ? `### Challenge\n${useCases}` : null,
    "",
    `### What They Said\n"${content}"`,
    "",
    results ? `### Results\n${results}` : null,
    "",
    `*${attribution.replace("— ", "")}*`,
  ]
    .filter((line) => line !== null)
    .join("\n");

  const formats = [
    { id: "pull-quote", label: "Pull Quote", text: pullQuote, hint: "Twitter, LinkedIn, slides" },
    { id: "email", label: "Email", text: emailSnippet, hint: "Email campaigns, nurture sequences" },
    { id: "landing-page", label: "Landing Page", text: landingPageHero, hint: "Homepage, product pages" },
    { id: "social", label: "Social Post", text: socialPost, hint: "LinkedIn, Twitter" },
    { id: "case-study", label: "Case Study", text: caseStudy, hint: "Blog, PDF, sales collateral" },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Format Studio</h3>
        <span className="text-xs text-muted-foreground ml-1">— pick a format, copy and use anywhere</span>
      </div>

      <Tabs defaultValue="pull-quote">
        <TabsList className="grid grid-cols-5 mb-4">
          {formats.map((f) => (
            <TabsTrigger key={f.id} value={f.id} className="text-xs">
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {formats.map((f) => (
          <TabsContent key={f.id} value={f.id}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-xs text-muted-foreground">{f.hint}</p>
              <CopyButton text={f.text} />
            </div>
            <FormatBlock text={f.text} />
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
};
