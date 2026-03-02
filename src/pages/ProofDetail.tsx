import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormatStudio } from "@/components/FormatStudio";
import { TagBadge } from "@/components/TagBadge";
import { TagSelector } from "@/components/TagSelector";
import { useTags } from "@/hooks/useTags";
import { useUserRole } from "@/hooks/useUserRole";
import { useEvidence } from "@/hooks/useEvidence";
import { useAuth } from "@/hooks/useAuth";
import { useProofAnalytics } from "@/hooks/useProofAnalytics";
import { Tag } from "@/types/tags";
import ReviewContent from "@/components/ReviewContent";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft, Building2, Calendar, Mail, Briefcase, Star,
  Edit, Trash2, Archive, Loader2, FileText, ExternalLink, Globe, Eye, Copy,
} from "lucide-react";
import { format } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  published: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  archived: "bg-muted text-muted-foreground border-border",
  approved: "bg-primary/10 text-primary border-primary/20",
};

export default function ProofDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canDelete, canEditAll } = useUserRole();
  const { deleteEvidence, archiveEvidence, updateEvidence } = useEvidence();
  const { tags: allTags } = useTags();

  const { stats, track } = useProofAnalytics(id);

  // Track view on mount
  const { data: proof, isLoading } = useQuery({
    queryKey: ["proof", id],
    queryFn: async () => {
      track.mutate({ eventType: "view" });
      const { data, error } = await supabase
        .from("evidence")
        .select("*, evidence_tags(tag_id)")
        .eq("id", id!)
        .single();

      if (error) throw error;

      const tagMap = Object.fromEntries(allTags.map((t) => [t.id, t]));
      const tags = (data.evidence_tags ?? [])
        .map((et: { tag_id: string }) => tagMap[et.tag_id])
        .filter(Boolean) as Tag[];

      return { ...data, tags };
    },
    enabled: !!id && allTags.length >= 0,
  });

  const canEdit = canEditAll || (user && proof?.created_by === user.id);

  const handleDelete = () => {
    deleteEvidence.mutate(id!, { onSuccess: () => navigate("/library") });
  };

  const handleArchive = () => {
    archiveEvidence.mutate(id!);
  };

  const handlePublish = async () => {
    await updateEvidence.mutateAsync({ id: id!, updates: { status: "published" } });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!proof) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
            <h2 className="text-2xl font-bold mb-2">Not Found</h2>
            <Button onClick={() => navigate("/library")}>Back to Library</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/library")} className="mb-6 -ml-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Library
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header card */}
            <Card className="p-8">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge variant="outline" className={STATUS_COLORS[proof.status] ?? ""}>
                  {proof.status}
                </Badge>
                {proof.integration_source && (
                  <Badge variant="secondary" className="uppercase text-xs">
                    {proof.integration_source}
                  </Badge>
                )}
                {proof.rating && (
                  <div className="flex items-center gap-0.5 ml-auto">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`h-4 w-4 ${s <= proof.rating! ? "fill-amber-400 text-amber-400" : "text-muted/20"}`} />
                    ))}
                  </div>
                )}
              </div>

              <h1 className="text-2xl font-bold mb-4 text-card-foreground">{proof.title}</h1>
              <ReviewContent reviewData={proof.review_data} content={proof.content} />
            </Card>

            {/* Results */}
            {proof.results && (
              <Card className="p-6 bg-success/5 border-success/20">
                <h3 className="font-semibold mb-2 text-success">Key Results</h3>
                <p className="text-card-foreground">{proof.results}</p>
              </Card>
            )}

            {/* Analytics */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground px-1">
              <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" />{stats.views} views</span>
              <span className="flex items-center gap-1.5"><Copy className="h-4 w-4" />{stats.copies} copies</span>
            </div>

            {/* Format Studio */}
            <FormatStudio
              evidenceId={id}
              customerName={proof.customer_name}
              jobTitle={proof.job_title ?? undefined}
              company={proof.company}
              industry={proof.industry ?? undefined}
              companySize={proof.company_size ?? undefined}
              content={proof.content}
              results={proof.results ?? undefined}
              useCases={proof.use_cases ?? undefined}
              rating={proof.rating ?? undefined}
              title={proof.title}
            />

            {/* Tags */}
            <Card className="p-6">
              <h3 className="font-semibold mb-3 text-card-foreground">Tags</h3>
              {canEditAll ? (
                <TagSelector evidenceId={id!} currentTags={proof.tags} />
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {proof.tags.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No tags yet</p>
                  ) : (
                    proof.tags.map((tag: Tag) => <TagBadge key={tag.id} tag={tag} />)
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Customer info */}
            <Card className="p-5 bg-gradient-card">
              <h3 className="font-semibold mb-4 text-card-foreground">Customer</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Company</p>
                    <p className="text-sm font-medium">{proof.company}</p>
                    {proof.company_size && <p className="text-xs text-muted-foreground">{proof.company_size}</p>}
                    {proof.industry && <p className="text-xs text-muted-foreground">{proof.industry}</p>}
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Contact</p>
                    <p className="text-sm font-medium">{proof.customer_name}</p>
                    {proof.job_title && <p className="text-xs text-muted-foreground">{proof.job_title}</p>}
                  </div>
                </div>
                {canEditAll && (
                  <div className="flex items-start gap-2.5">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm break-all">{proof.email}</p>
                    </div>
                  </div>
                )}
                {proof.external_url && (
                  <a
                    href={proof.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View original review
                  </a>
                )}
              </div>
            </Card>

            {/* Dates */}
            <Card className="p-5 bg-gradient-card">
              <h3 className="font-semibold mb-4 text-card-foreground">Timeline</h3>
              <div className="space-y-3">
                {proof.review_date && (
                  <div className="flex items-start gap-2.5">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Review date</p>
                      <p className="text-sm">{format(new Date(proof.review_date), "MMM d, yyyy")}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2.5">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Added</p>
                    <p className="text-sm">{format(new Date(proof.created_at), "MMM d, yyyy")}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Actions */}
            {(canEdit || proof.status === "published") && (
              <Card className="p-5">
                <h3 className="font-semibold mb-3 text-card-foreground">Actions</h3>
                <div className="space-y-2">
                  {proof.status === "published" && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={`/testimonials/${proof.id}`} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4 mr-2" />
                        View public page
                      </a>
                    </Button>
                  )}
                  {canEdit && proof.status === "pending" && (
                    <Button className="w-full" onClick={handlePublish}>
                      <Globe className="h-4 w-4 mr-2" />
                      Publish
                    </Button>
                  )}
                  {canEdit && (
                    <Button variant="outline" className="w-full" onClick={() => navigate(`/evidence/${id}/edit`)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  {canEdit && proof.status !== "archived" && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Archive this proof?</AlertDialogTitle>
                          <AlertDialogDescription>It will be hidden from the public wall but can be restored.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleArchive}>Archive</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  {canDelete && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete permanently?</AlertDialogTitle>
                          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
