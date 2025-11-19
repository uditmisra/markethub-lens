import { useState } from "react";
import { useIntegrations, Integration, IntegrationType } from "@/hooks/useIntegrations";
import { useUserRole } from "@/hooks/useUserRole";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, RefreshCw, Trash2, ExternalLink, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDistanceToNow } from "date-fns";

export default function Integrations() {
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { integrations, isLoading, createIntegration, updateIntegration, deleteIntegration, triggerSync } = useIntegrations();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [formData, setFormData] = useState({
    integration_type: "g2" as IntegrationType,
    product_id: "",
    api_key: "",
    sync_frequency: "daily",
    is_active: true,
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingIntegration) {
      await updateIntegration.mutateAsync({
        id: editingIntegration.id,
        product_id: formData.product_id,
        config: { api_key: formData.api_key },
        sync_frequency: formData.sync_frequency,
        is_active: formData.is_active,
      });
    } else {
      await createIntegration.mutateAsync({
        integration_type: formData.integration_type,
        product_id: formData.product_id,
        config: { api_key: formData.api_key },
        sync_frequency: formData.sync_frequency,
        is_active: formData.is_active,
      });
    }
    
    setIsDialogOpen(false);
    setEditingIntegration(null);
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Review Site Integrations</h1>
            <p className="text-muted-foreground">
              Automatically import customer reviews from G2 and Capterra
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingIntegration(null);
                setFormData({
                  integration_type: "g2",
                  product_id: "",
                  api_key: "",
                  sync_frequency: "daily",
                  is_active: true,
                });
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
                  Configure a review site integration to automatically import customer reviews
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
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="product_id">Product ID</Label>
                  <Input
                    id="product_id"
                    value={formData.product_id}
                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                    placeholder="Enter product ID from review site"
                    required
                  />
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
                        {integration.integration_type.toUpperCase()}
                        {integration.is_active ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>Product ID: {integration.product_id}</CardDescription>
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
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Sync:</span>
                        <span>{formatDistanceToNow(new Date(integration.last_sync_at), { addSuffix: true })}</span>
                      </div>
                    )}
                    {integration.last_sync_error && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          {integration.last_sync_error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-4 border-t">
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
