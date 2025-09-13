import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Cog, Users, Box, ShoppingCart, Clock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { DashboardStats } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check session on component mount
  const { data: sessionData, error: sessionError, isLoading: sessionLoading } = useQuery({
    queryKey: ["/api/session"],
    retry: false
  });

  // Redirect to login if no session
  useEffect(() => {
    if (sessionError || (sessionData && !(sessionData as any)?.success)) {
      setLocation("/");
    }
  }, [sessionError, sessionData, setLocation]);

  // Fetch dashboard stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard-stats"],
    enabled: !!(sessionData as any)?.success
  });


  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/logout"),
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Logged Out",
        description: "Successfully disconnected from SAP B1"
      });
      setLocation("/");
    },
    onError: () => {
      // Force redirect even if logout fails
      setLocation("/");
    }
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  if (!(sessionData as any)?.success) {
    return null;
  }

  const session = (sessionData as any)?.data;
  const stats = (statsData as any)?.data;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <Cog className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">SAP B1 Dashboard</h1>
              <p className="text-sm text-muted-foreground">Service Layer Integration</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center space-x-2 text-sm text-muted-foreground">
              <span data-testid="text-username">{session?.username}</span>
              <span className="text-border">|</span>
              <span data-testid="text-database">ZZZ_IT_TEST_LIVE_DB</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="hidden sm:inline">Active Session</span>
            </div>
            
            <Button
              onClick={handleLogout}
              variant="secondary"
              size="sm"
              disabled={logoutMutation.isPending}
              data-testid="button-logout"
            >
              {logoutMutation.isPending ? (
                <LoadingSpinner className="mr-2 h-4 w-4" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-card border-r border-border h-screen sticky top-0">
          <nav className="p-4 space-y-2">
            <Button variant="default" className="w-full justify-start" data-testid="nav-dashboard">
              <Cog className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start" data-testid="nav-partners" onClick={() => setLocation("/business-partners")}>
              <Users className="mr-2 h-4 w-4" />
              Business Partners
            </Button>
            <Button variant="ghost" className="w-full justify-start" data-testid="nav-items" onClick={() => setLocation("/items")}>
              <Box className="mr-2 h-4 w-4" />
              Items
            </Button>
            <Button variant="ghost" className="w-full justify-start" data-testid="nav-orders" onClick={() => setLocation("/sales-orders")}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Sales Orders
            </Button>
            <Button variant="ghost" className="w-full justify-start" data-testid="nav-config" onClick={() => setLocation("/configuration")}>
              <Cog className="mr-2 h-4 w-4" />
              Configuration
            </Button>
          </nav>
        </aside>

        {/* Main Dashboard Content */}
        <main className="flex-1 p-6">
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Partners</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-total-partners">
                      {statsLoading ? <LoadingSpinner className="h-6 w-6" /> : stats?.totalPartners || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Items</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-active-items">
                      {statsLoading ? <LoadingSpinner className="h-6 w-6" /> : stats?.activeItems || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <Box className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Open Orders</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-open-orders">
                      {statsLoading ? <LoadingSpinner className="h-6 w-6" /> : stats?.openOrders || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Session Timeout</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-session-timeout">
                      {statsLoading ? <LoadingSpinner className="h-6 w-6" /> : stats?.sessionTimeRemaining || "0:00"}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </main>
      </div>
    </div>
  );
}
