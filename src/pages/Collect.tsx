import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useUserRole } from "@/hooks/useUserRole";
import { Plus, Copy, Check, Link2, Users, MessageSquare, Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const BASE_URL = window.location.origin;

const CopyLinkButton = ({ campaignId }: { campaignId: string }) => {
  const [copied, setCopied] = useState(false);
  const link = `${BASE_URL}/submit?campaign=${campaignId}`;
  const handle = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="outline" size="sm" onClick={handle} className="gap-1.5">
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy link"}
    </Button>
  );
};

const EmailTemplateButton = ({ campaign }: { campaign: { name: string; id: string; message: string | null } }) => {
  const [copied, setCopied] = useState(false);
  const link = `${BASE_URL}/submit?campaign=${campaign.id}`;
  const template = `Hi [Customer Name],

We'd love to hear about your experience with SpotDraft!${campaign.message ? `\n\n${campaign.message}` : ""}

It only takes 2-3 minutes and really helps us grow.

👉 Share your story: ${link}

Thank you!
The SpotDraft Team`;

  const handle = () => {
    navigator.clipboard.writeText(template);
    setCopied(true);
    toast.success("Email template copied");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="ghost" size="sm" onClick={handle} className="gap-1.5">
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <MessageSquare className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Email template"}
    </Button>
  );
};

export default function Collect() {
  const { campaigns, isLoading, createCampaign, updateCampaign } = useCampaigns();
  const { canApprove } = useUserRole();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", message: "" });

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    await createCampaign.mutateAsync({
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      message: form.message.trim() || undefined,
    });
    setForm({ name: "", description: "", message: "" });
    setOpen(false);
  };

  const totalSubmissions = campaigns.reduce((s, c) => s + (c.submission_count ?? 0), 0);
  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Page header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-1">Collect</h1>
            <p className="text-muted-foreground">Send story request links to customers and track submissions</p>
          </div>
          {canApprove && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />New Campaign</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Story Request Campaign</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <Label>Campaign name *</Label>
                    <Input
                      placeholder="e.g. Q1 Customer Stories"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Internal description</Label>
                    <Input
                      placeholder="Who is this for? e.g. Enterprise renewal segment"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Custom message for customers</Label>
                    <Textarea
                      placeholder="e.g. We're building a case study library and would love to feature your story…"
                      rows={3}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Shown in the email template and on the submit page.</p>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={!form.name.trim() || createCampaign.isPending}>
                      {createCampaign.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Create Campaign
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {[
            { label: "Active Campaigns", value: activeCampaigns, icon: Link2 },
            { label: "Total Campaigns", value: campaigns.length, icon: MessageSquare },
            { label: "Total Submissions", value: totalSubmissions, icon: Users },
          ].map((s) => (
            <Card key={s.label} className="p-5 bg-gradient-card">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <s.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold text-card-foreground">
                {isLoading ? "—" : s.value}
              </p>
            </Card>
          ))}
        </div>

        {/* Campaigns list */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : campaigns.length === 0 ? (
          <Card className="p-16 text-center">
            <Link2 className="h-10 w-10 mx-auto mb-4 text-muted-foreground opacity-40" />
            <h3 className="font-semibold mb-1">No campaigns yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create a campaign to get a shareable link you can send to customers.
            </p>
            {canApprove && (
              <Button onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />New Campaign
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid gap-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{campaign.name}</h3>
                      <Badge
                        variant="outline"
                        className={campaign.status === "active"
                          ? "text-green-600 border-green-200 bg-green-50"
                          : "text-muted-foreground"
                        }
                      >
                        {campaign.status}
                      </Badge>
                    </div>
                    {campaign.description && (
                      <p className="text-sm text-muted-foreground mb-2">{campaign.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {campaign.submission_count} submission{campaign.submission_count !== 1 ? "s" : ""}
                      </span>
                      <span>Created {formatDistanceToNow(new Date(campaign.created_at), { addSuffix: true })}</span>
                    </div>
                    {campaign.message && (
                      <p className="mt-3 text-sm text-muted-foreground italic border-l-2 border-border pl-3">
                        "{campaign.message}"
                      </p>
                    )}
                    {/* Submission link preview */}
                    <div className="mt-3 flex items-center gap-2 bg-muted/50 rounded-md px-3 py-2">
                      <Link2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <code className="text-xs text-muted-foreground truncate flex-1">
                        {BASE_URL}/submit?campaign={campaign.id}
                      </code>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <CopyLinkButton campaignId={campaign.id} />
                    <EmailTemplateButton campaign={campaign} />
                    {canApprove && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-muted-foreground"
                        onClick={() => updateCampaign.mutate({
                          id: campaign.id,
                          status: campaign.status === "active" ? "closed" : "active",
                        })}
                      >
                        {campaign.status === "active"
                          ? <><ToggleRight className="h-3.5 w-3.5" />Close</>
                          : <><ToggleLeft className="h-3.5 w-3.5" />Reopen</>
                        }
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
