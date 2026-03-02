import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserRole } from "@/hooks/useUserRole";
import { useUsers, AppRole } from "@/hooks/useUsers";
import { useEvidence } from "@/hooks/useEvidence";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, FileText, CheckCircle2, Clock, Plug, Shield, ArrowRight, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const ROLE_COLORS: Record<AppRole, string> = {
  admin: "bg-red-500/10 text-red-500 border-red-500/20",
  reviewer: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  submitter: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

export default function AdminPanel() {
  const navigate = useNavigate();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { users, isLoading: usersLoading, updateUserRole } = useUsers();
  const { evidence, isLoading: evidenceLoading } = useEvidence();

  const { data: integrationCount = 0 } = useQuery({
    queryKey: ["integration-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("integrations")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);
      return count ?? 0;
    },
  });

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    navigate("/dashboard");
    return null;
  }

  const stats = [
    { label: "Total Users", value: users.length, icon: Users, color: "text-blue-500" },
    { label: "Testimonials", value: evidence.length, icon: FileText, color: "text-primary" },
    { label: "Pending Review", value: evidence.filter((e) => e.status === "pending").length, icon: Clock, color: "text-warning" },
    { label: "Published", value: evidence.filter((e) => e.status === "published").length, icon: CheckCircle2, color: "text-success" },
    { label: "Active Integrations", value: integrationCount, icon: Plug, color: "text-purple-500" },
  ];

  const quickLinks = [
    { label: "Pending Review", description: "Review and publish testimonials", path: "/admin/review" },
    { label: "Connections", description: "Manage G2, Capterra, Gartner imports", path: "/integrations" },
    { label: "Embed Widget", description: "Generate embed code for your site", path: "/widgets" },
  ];

  const handleRoleChange = async (userId: string, role: AppRole) => {
    try {
      await updateUserRole.mutateAsync({ userId, role });
      toast.success("Role updated");
    } catch {
      toast.error("Failed to update role");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-foreground">Admin Panel</h1>
            <Badge variant="outline" className="text-sm">
              <Shield className="h-3 w-3 mr-1" />
              Admin Only
            </Badge>
          </div>
          <p className="text-muted-foreground">System overview and user management</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-5 bg-gradient-card">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <div className={`p-2 bg-muted rounded-lg ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
              </div>
              <p className="text-3xl font-bold text-card-foreground">
                {evidenceLoading || usersLoading ? "—" : stat.value}
              </p>
            </Card>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {quickLinks.map((link) => (
            <Card
              key={link.path}
              className="p-6 hover:shadow-medium transition-shadow cursor-pointer"
              onClick={() => navigate(link.path)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">{link.label}</h3>
                  <p className="text-sm text-muted-foreground">{link.description}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
              </div>
            </Card>
          ))}
        </div>

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {usersLoading ? (
              <div className="py-12 text-center text-muted-foreground">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">No users found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Change Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar_url ?? undefined} />
                            <AvatarFallback>
                              {(user.full_name ?? "?").slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">{user.full_name ?? "Unknown"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <Badge className={ROLE_COLORS[user.role]}>{user.role}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Select
                          value={user.role}
                          onValueChange={(value) => handleRoleChange(user.id, value as AppRole)}
                          disabled={updateUserRole.isPending}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="reviewer">Reviewer</SelectItem>
                            <SelectItem value="submitter">Submitter</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
