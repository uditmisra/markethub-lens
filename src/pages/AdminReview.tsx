import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useEvidence } from "@/hooks/useEvidence";
import { useUserRole } from "@/hooks/useUserRole";
import { EvidenceStatus } from "@/types/evidence";
import { toast } from "sonner";
import { Eye, CheckCircle, XCircle, Archive } from "lucide-react";

export default function AdminReview() {
  const navigate = useNavigate();
  const { evidence, isLoading, updateEvidence } = useEvidence();
  const { canApprove, isLoading: roleLoading } = useUserRole();
  const [statusFilter, setStatusFilter] = useState<EvidenceStatus | "all">("pending");
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
      toast.success(`Evidence ${newStatus} successfully`);
      setActionDialog({ open: false, evidenceId: "", action: null, title: "" });
    } catch (error) {
      toast.error(`Failed to ${actionDialog.action} evidence`);
    }
  };

  const openActionDialog = (id: string, action: "approve" | "publish" | "reject", title: string) => {
    setActionDialog({ open: true, evidenceId: id, action, title });
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
          <CardContent>
            {filteredEvidence.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No evidence found for this status
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvidence.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell>{item.company}</TableCell>
                        <TableCell className="capitalize">{item.evidenceType}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[item.status]}>
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/evidence/${item.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {item.status === "pending" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openActionDialog(item.id, "approve", item.title)}
                              >
                                <CheckCircle className="h-4 w-4 text-blue-500" />
                              </Button>
                            )}
                            {item.status === "approved" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openActionDialog(item.id, "publish", item.title)}
                              >
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              </Button>
                            )}
                            {(item.status === "pending" || item.status === "approved") && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openActionDialog(item.id, "reject", item.title)}
                              >
                                <XCircle className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
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
                if (actionDialog.action === "approve") handleStatusChange("approved");
                if (actionDialog.action === "publish") handleStatusChange("published");
                if (actionDialog.action === "reject") handleStatusChange("archived");
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
