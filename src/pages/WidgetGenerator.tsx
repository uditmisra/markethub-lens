import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import TestimonialWidget from "@/components/widgets/TestimonialWidget";

const WidgetGenerator = () => {
  const [copied, setCopied] = useState(false);
  const [config, setConfig] = useState({
    theme: 'light' as 'light' | 'dark',
    layout: 'grid' as 'grid' | 'carousel' | 'list',
    maxItems: 6,
    product: '',
    showRating: true,
    showAvatar: true,
  });

  const baseUrl = window.location.origin;
  const queryParams = new URLSearchParams({
    theme: config.theme,
    layout: config.layout,
    maxItems: config.maxItems.toString(),
    showRating: config.showRating.toString(),
    showAvatar: config.showAvatar.toString(),
    ...(config.product && { product: config.product }),
  }).toString();

  const embedUrl = `${baseUrl}/embed?${queryParams}`;
  const embedCode = `<iframe 
  src="${embedUrl}" 
  width="100%" 
  height="600" 
  frameborder="0" 
  scrolling="auto"
  style="border: none; border-radius: 8px;"
></iframe>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      toast.success("Embed code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy embed code");
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Widget Generator</h1>
          <p className="text-muted-foreground">
            Create embeddable testimonial widgets for your website
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Widget Configuration</CardTitle>
                <CardDescription>
                  Customize how your testimonials will appear
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={config.theme}
                    onValueChange={(value: 'light' | 'dark') =>
                      setConfig({ ...config, theme: value })
                    }
                  >
                    <SelectTrigger id="theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="layout">Layout</Label>
                  <Select
                    value={config.layout}
                    onValueChange={(value: 'grid' | 'carousel' | 'list') =>
                      setConfig({ ...config, layout: value })
                    }
                  >
                    <SelectTrigger id="layout">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grid</SelectItem>
                      <SelectItem value="carousel">Carousel</SelectItem>
                      <SelectItem value="list">List</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxItems">Max Items</Label>
                  <Input
                    id="maxItems"
                    type="number"
                    min="1"
                    max="20"
                    value={config.maxItems}
                    onChange={(e) =>
                      setConfig({ ...config, maxItems: parseInt(e.target.value) || 6 })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product">Filter by Product (optional)</Label>
                  <Select
                    value={config.product}
                    onValueChange={(value) => setConfig({ ...config, product: value })}
                  >
                    <SelectTrigger id="product">
                      <SelectValue placeholder="All products" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All products</SelectItem>
                      <SelectItem value="platform">Platform</SelectItem>
                      <SelectItem value="analytics">Analytics</SelectItem>
                      <SelectItem value="integration">Integration</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="showRating">Show Rating</Label>
                  <Switch
                    id="showRating"
                    checked={config.showRating}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, showRating: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="showAvatar">Show Avatar</Label>
                  <Switch
                    id="showAvatar"
                    checked={config.showAvatar}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, showAvatar: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Embed Code</CardTitle>
                <CardDescription>
                  Copy and paste this code into your website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={embedCode}
                  readOnly
                  rows={8}
                  className="font-mono text-sm"
                />
                <Button onClick={handleCopy} className="w-full">
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Embed Code
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  See how your widget will look on your website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <TestimonialWidget config={config} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetGenerator;
