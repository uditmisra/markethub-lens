import { useState, useRef } from "react";
import { useIntegrations, Integration, IntegrationType } from "@/hooks/useIntegrations";
import { useUserRole } from "@/hooks/useUserRole";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, RefreshCw, Trash2, ExternalLink, AlertCircle, Clock, Upload, FileText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDistanceToNow } from "date-fns";
import { parseGartnerPaste, parseGartnerCSV } from "@/utils/parseGartnerReviews";
import { useToast } from "@/hooks/use-toast";

export default function Integrations() {
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { integrations, isLoading, createIntegration, updateIntegration, deleteIntegration, triggerSync, importGartnerReviews } = useIntegrations();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [formData, setFormData] = useState({
    integration_type: "g2" as IntegrationType,
    product_id: "",
    api_key: "",
    sync_frequency: "daily",
    is_active: true,
  });

  // Gartner import state
  const [gartnerPasteText, setGartnerPasteText] = useState("");
  const [gartnerImportDialogOpen, setGartnerImportDialogOpen] = useState(false);
  const [importingIntegrationId, setImportingIntegrationId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (roleLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to access this page. Admin access required.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const isGartner = formData.integration_type === "gartner";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingIntegration) {
      await updateIntegration.mutateAsync({
        id: editingIntegration.id,
        product_id: formData.product_id,
        config: isGartner ? {} : { api_key: formData.api_key },
        sync_frequency: formData.sync_frequency,
        is_active: formData.is_active,
      });
    } else {
      await createIntegration.mutateAsync({
        integration_type: formData.integration_type,
        product_id: isGartner ? "gartner-manual" : formData.product_id,
        config: isGartner ? {} : { api_key: formData.api_key },
        sync_frequency: isGartner ? "manual" : formData.sync_frequency,
        is_active: formData.is_active,
      });
    }
    
    setIsDialogOpen(false);
    setEditingIntegration(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      integration_type: "g2",
      product_id: "",
      api_key: "",
      sync_frequency: "daily",
      is_active: true,
    });
  };

  const handleEdit = (integration: Integration) => {
    setEditingIntegration(integration);
    setFormData({
      integration_type: integration.integration_type,
      product_id: integration.product_id,
      api_key: integration.config?.api_key || "",
      sync_frequency: integration.sync_frequency,
      is_active: integration.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleResetSyncStatus = async (integration: Integration) => {
    await updateIntegration.mutateAsync({
      id: integration.id,
      last_sync_status: "pending",
    } as any);
  };

  const handleGartnerImport = async (integrationId: string) => {
    setImportingIntegrationId(integrationId);
    setGartnerPasteText("");
    setGartnerImportDialogOpen(true);
  };

  const handleGartnerPasteSubmit = async () => {
    if (!importingIntegrationId || !gartnerPasteText.trim()) return;

    const reviews = parseGartnerPaste(gartnerPasteText);
    if (reviews.length === 0) {
      toast({ title: "Error", description: "Could not parse any reviews from the pasted text.", variant: "destructive" });
      return;
    }

    await importGartnerReviews.mutateAsync({ integrationId: importingIntegrationId, reviews });
    setGartnerImportDialogOpen(false);
    setGartnerPasteText("");
  };

  const handleGartnerCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !importingIntegrationId) return;

    const text = await file.text();
    const reviews = parseGartnerCSV(text);
    if (reviews.length === 0) {
      toast({ title: "Error", description: "Could not parse any reviews from the CSV file.", variant: "destructive" });
      return;
    }

    await importGartnerReviews.mutateAsync({ integrationId: importingIntegrationId, reviews });
    setGartnerImportDialogOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getSyncStatusBadge = (status?: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default">Completed</Badge>;
      case "running":
        return <Badge variant="secondary">Running</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">Never synced</Badge>;
    }
  };

  const getIntegrationLabel = (type: string) => {
    switch (type) {
      case "g2": return "G2";
      case "capterra": return "CAPTERRA";
      case "gartner": return "GARTNER";
      default: return type.toUpperCase();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Review Site Integrations</h1>
            <p className="text-muted-foreground">
              Import customer reviews from G2, Capterra, and Gartner Peer Insights
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingIntegration(null);
                resetForm();
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Integration
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingIntegration ? "Edit Integration" : "Add Integration"}
                </DialogTitle>
                <DialogDescription>
                  Configure a review site integration to import customer reviews
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Integration Type</Label>
                  <Select
                    value={formData.integration_type}
                    onValueChange={(value) => setFormData({ ...formData, integration_type: value as IntegrationType })}
                    disabled={!!editingIntegration}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g2">G2</SelectItem>
                      <SelectItem value="capterra">Capterra</SelectItem>
                      <SelectItem value="gartner">Gartner Peer Insights</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isGartner ? (
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      Gartner reviews are imported manually. After creating this integration, use the <strong>"Import Reviews"</strong> button to paste or upload reviews from your Gartner Peer Insights page.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="product_id">
                        Product {formData.integration_type === "g2" ? "Slug" : "ID"}
                      </Label>
                      <Input
                        id="product_id"
                        value={formData.product_id}
                        onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                        placeholder={formData.integration_type === "g2" ? "e.g., spotdraft" : "Enter product ID from review site"}
                        required
                      />
                      {formData.integration_type === "g2" && (
                        <p className="text-xs text-muted-foreground">
                          Enter the product slug from your G2 product URL (e.g., "spotdraft" from g2.com/products/spotdraft)
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="api_key">API Key</Label>
                      <Input
                        id="api_key"
                        type="password"
                        value={formData.api_key}
                        onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                        placeholder="Enter API key"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="frequency">Sync Frequency</Label>
                      <Select
                        value={formData.sync_frequency}
                        onValueChange={(value) => setFormData({ ...formData, sync_frequency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual Only</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingIntegration ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Gartner Import Dialog */}
        <Dialog open={gartnerImportDialogOpen} onOpenChange={setGartnerImportDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Import Gartner Reviews</DialogTitle>
              <DialogDescription>
                Paste reviews copied from your Gartner Peer Insights product page, or upload a CSV file.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Paste Reviews</Label>
                <Textarea
                  value={gartnerPasteText}
                  onChange={(e) => setGartnerPasteText(e.target.value)}
                  placeholder={"Copy and paste reviews from Gartner Peer Insights here...\n\nExample format:\nOverall Rating 4.5/5\nJohn Doe, Product Manager at Acme Corp\nJanuary 15, 2025\nWhat do you like most: Great product for managing contracts...\nWhat needs improvement: Could use better reporting..."}
                  className="min-h-[200px] font-mono text-sm"
                />
                <Button
                  onClick={handleGartnerPasteSubmit}
                  disabled={!gartnerPasteText.trim() || importGartnerReviews.isPending}
                  className="w-full"
                >
                  {importGartnerReviews.isPending ? (
                    <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Importing...</>
                  ) : (
                    <><Upload className="h-4 w-4 mr-2" /> Import Pasted Reviews</>
                  )}
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Upload CSV</Label>
                <p className="text-xs text-muted-foreground">
                  CSV with columns: Name, Company, Job Title, Rating, Title, Review, Date
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleGartnerCSVUpload}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {integrations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No integrations configured yet</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Integration
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {integrations.map((integration) => (
              <Card key={integration.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {getIntegrationLabel(integration.integration_type)}
                        {integration.is_active ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {integration.integration_type === "gartner"
                          ? "Manual import"
                          : `Product ID: ${integration.product_id}`}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Frequency:</span>
                      <span className="capitalize">{integration.sync_frequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      {getSyncStatusBadge(integration.last_sync_status)}
                    </div>
                    {integration.last_sync_at && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Last synced</span>
                        <span>{formatDistanceToNow(new Date(integration.last_sync_at), { addSuffix: true })}</span>
                      </div>
                    )}
                    
                    {integration.last_sync_total !== undefined && integration.last_sync_total !== null && (
                      <div className="text-xs pt-2 border-t">
                        {integration.last_sync_total === 0 ? (
                          <div className="text-warning font-medium">
                            ⚠️ {getIntegrationLabel(integration.integration_type)} returned 0 reviews
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="font-medium text-foreground">Last sync results:</div>
                            <div className="flex flex-wrap gap-2">
                              <span className="text-muted-foreground">Fetched: <span className="font-medium text-foreground">{integration.last_sync_total}</span></span>
                              {integration.last_sync_imported !== undefined && (
                                <span className="text-muted-foreground">Imported: <span className="font-medium text-success">{integration.last_sync_imported}</span></span>
                              )}
                              {integration.last_sync_skipped !== undefined && integration.last_sync_skipped > 0 && (
                                <span className="text-muted-foreground">Skipped: <span className="font-medium text-muted-foreground">{integration.last_sync_skipped}</span></span>
                              )}
                              {integration.last_sync_failed !== undefined && integration.last_sync_failed > 0 && (
                                <span className="text-muted-foreground">Failed: <span className="font-medium text-destructive">{integration.last_sync_failed}</span></span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {integration.last_sync_status === 'running' && (
                      <Alert className="mt-2 border-blue-500/20 bg-blue-500/5">
                        <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                        <AlertDescription className="text-xs">
                          <strong>Sync in progress...</strong> Please wait while we fetch and import reviews.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {integration.last_sync_error && integration.last_sync_status === 'failed' && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs break-words">
                          <strong>Sync Failed:</strong> {integration.last_sync_error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-4 border-t">
                    {integration.integration_type === "gartner" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGartnerImport(integration.id)}
                        disabled={importGartnerReviews.isPending}
                        className="flex-1"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Import Reviews
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => triggerSync.mutate(integration.id)}
                        disabled={triggerSync.isPending || integration.last_sync_status === "running"}
                        className="flex-1"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync Now
                      </Button>
                    )}
                    {integration.last_sync_status === "running" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResetSyncStatus(integration)}
                      >
                        Reset
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(integration)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteIntegration.mutate(integration.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
