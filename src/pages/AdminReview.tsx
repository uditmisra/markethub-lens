import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useEvidence } from "@/hooks/useEvidence";
import { useUserRole } from "@/hooks/useUserRole";
import { EvidenceStatus } from "@/types/evidence";
import { toast } from "sonner";
import { Eye, CheckCircle, XCircle, Archive, Trash2, Copy, ExternalLink, Share2 } from "lucide-react";

export default function AdminReview() {
  const navigate = useNavigate();
  const { evidence, isLoading, updateEvidence, bulkUpdateEvidence, bulkDeleteEvidence } = useEvidence();
  const { canApprove, isLoading: roleLoading } = useUserRole();
  const [statusFilter, setStatusFilter] = useState<EvidenceStatus | "all">("pending");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    evidenceId: string;
    action: "approve" | "publish" | "reject" | null;
    title: string;
  }>({
    open: false,
    evidenceId: "",
    action: null,
    title: "",
  });
  const [bulkActionDialog, setBulkActionDialog] = useState<{
    open: boolean;
    action: "approve" | "publish" | "reject" | "delete" | null;
  }>({
    open: false,
    action: null,
  });
  const [publishSuccessDialog, setPublishSuccessDialog] = useState<{
    open: boolean;
    evidenceId: string;
    title: string;
  }>({
    open: false,
    evidenceId: "",
    title: "",
  });

  // Redirect if not authorized
  if (!roleLoading && !canApprove) {
    navigate("/dashboard");
    return null;
  }

  const filteredEvidence = evidence.filter((item) =>
    statusFilter === "all" ? true : item.status === statusFilter
  );

  const statusColors = {
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    approved: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    published: "bg-green-500/10 text-green-500 border-green-500/20",
    archived: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  };

  const handleStatusChange = async (newStatus: EvidenceStatus) => {
    try {
      await updateEvidence.mutateAsync({
        id: actionDialog.evidenceId,
        updates: { status: newStatus },
      });
      
      // Show success dialog for publish action
      if (newStatus === "published") {
        setPublishSuccessDialog({
          open: true,
          evidenceId: actionDialog.evidenceId,
          title: actionDialog.title,
        });
      } else {
        toast.success(`Evidence ${newStatus} successfully`);
      }
      
      setActionDialog({ open: false, evidenceId: "", action: null, title: "" });
    } catch (error) {
      toast.error(`Failed to ${actionDialog.action} evidence`);
    }
  };

  const copyPublicLink = (id: string) => {
    const url = `${window.location.origin}/testimonials/${id}`;
    navigator.clipboard.writeText(url);
    toast.success("Public link copied to clipboard!");
  };

  const shareToTwitter = (id: string, title: string) => {
    const url = `${window.location.origin}/testimonials/${id}`;
    const text = `Check out this testimonial: ${title}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareToLinkedIn = (id: string) => {
    const url = `${window.location.origin}/testimonials/${id}`;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
  };

  const handleBulkAction = async () => {
    if (selectedIds.length === 0) return;

    try {
      if (bulkActionDialog.action === "delete") {
        await bulkDeleteEvidence.mutateAsync(selectedIds);
      } else {
        const statusMap = {
          approve: "approved" as EvidenceStatus,
          publish: "published" as EvidenceStatus,
          reject: "archived" as EvidenceStatus,
        };
        const newStatus = statusMap[bulkActionDialog.action!];
        await bulkUpdateEvidence.mutateAsync({ ids: selectedIds, status: newStatus });
      }
      setSelectedIds([]);
      setBulkActionDialog({ open: false, action: null });
    } catch (error) {
      toast.error("Failed to perform bulk action");
    }
  };

  const openActionDialog = (id: string, action: "approve" | "publish" | "reject", title: string) => {
    setActionDialog({ open: true, evidenceId: id, action, title });
  };

  const openBulkActionDialog = (action: "approve" | "publish" | "reject" | "delete") => {
    setBulkActionDialog({ open: true, action });
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredEvidence.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEvidence.map(e => e.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (isLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Evidence Review</h1>
          <p className="text-muted-foreground">Review and manage evidence submissions</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Filter by Status</span>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as EvidenceStatus | "all")}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Evidence</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </CardTitle>
          </CardHeader>
        </Card>

        {selectedIds.length > 0 && (
          <Card className="mb-6 bg-primary/5 border-primary/20">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{selectedIds.length} selected</span>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
                    Clear
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openBulkActionDialog("approve")}
                    className="gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve Selected
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openBulkActionDialog("publish")}
                    className="gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Publish Selected
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openBulkActionDialog("reject")}
                    className="gap-2"
                  >
                    <Archive className="h-4 w-4" />
                    Reject Selected
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => openBulkActionDialog("delete")}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-0">
            {filteredEvidence.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No evidence found for this status
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedIds.length === filteredEvidence.length && filteredEvidence.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvidence.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(item.id)}
                          onCheckedChange={() => toggleSelect(item.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium max-w-xs truncate">{item.title}</TableCell>
                      <TableCell>{item.customerName}</TableCell>
                      <TableCell>
                        <div>
                          <div>{item.company}</div>
                          {item.company_size && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {item.company_size}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.evidenceType}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[item.status]}>{item.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {item.rating ? (
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            <span className="text-sm font-medium">{item.rating}/5</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/evidence/${item.id}`)}
                            className="gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                          {item.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openActionDialog(item.id, "approve", item.title)}
                              className="gap-2 text-blue-500 hover:text-blue-600"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Approve
                            </Button>
                          )}
                          {item.status === "approved" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openActionDialog(item.id, "publish", item.title)}
                              className="gap-2 text-green-500 hover:text-green-600"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Publish
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openActionDialog(item.id, "reject", item.title)}
                            className="gap-2 text-red-500 hover:text-red-600"
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      <AlertDialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialog.action === "approve" && "Approve Evidence"}
              {actionDialog.action === "publish" && "Publish Evidence"}
              {actionDialog.action === "reject" && "Reject Evidence"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {actionDialog.action} "{actionDialog.title}"?
              {actionDialog.action === "reject" && " This will archive the evidence."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const statusMap = {
                  approve: "approved" as EvidenceStatus,
                  publish: "published" as EvidenceStatus,
                  reject: "archived" as EvidenceStatus,
                };
                handleStatusChange(statusMap[actionDialog.action!]);
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkActionDialog.open} onOpenChange={(open) => setBulkActionDialog({ ...bulkActionDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkActionDialog.action === "approve" && "Approve Selected Evidence"}
              {bulkActionDialog.action === "publish" && "Publish Selected Evidence"}
              {bulkActionDialog.action === "reject" && "Reject Selected Evidence"}
              {bulkActionDialog.action === "delete" && "Delete Selected Evidence"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {bulkActionDialog.action} {selectedIds.length} item(s)?
              {bulkActionDialog.action === "delete" && " This action cannot be undone."}
              {bulkActionDialog.action === "reject" && " This will archive the selected evidence."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkAction}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Publish Success Dialog */}
      <Dialog open={publishSuccessDialog.open} onOpenChange={(open) => setPublishSuccessDialog({ ...publishSuccessDialog, open })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Successfully Published!
            </DialogTitle>
            <DialogDescription>
              "{publishSuccessDialog.title}" is now live and visible on your public testimonials page.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Public URL:</p>
              <p className="text-xs text-muted-foreground break-all">
                {window.location.origin}/testimonials/{publishSuccessDialog.evidenceId}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={() => copyPublicLink(publishSuccessDialog.evidenceId)}
                className="w-full"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.open(`/testimonials/${publishSuccessDialog.evidenceId}`, '_blank')}
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Public Page
              </Button>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Share:</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareToTwitter(publishSuccessDialog.evidenceId, publishSuccessDialog.title)}
                  className="flex-1"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareToLinkedIn(publishSuccessDialog.evidenceId)}
                  className="flex-1"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  LinkedIn
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setPublishSuccessDialog({ open: false, evidenceId: "", title: "" })}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
