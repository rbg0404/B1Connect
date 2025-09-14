import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Cog, Users, Box, ShoppingCart, Clock, LogOut, MapPin, Building, Warehouse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SharedLayoutProps {
  children: React.ReactNode;
  currentPage: string;
}

export default function SharedLayout({ children, currentPage }: SharedLayoutProps) {
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

  const navigationItems = [
    { path: "/dashboard", icon: Cog, label: "Dashboard", id: "nav-dashboard" },
    { path: "/business-partners", icon: Users, label: "Business Partners", id: "nav-partners" },
    { path: "/items", icon: Box, label: "Items", id: "nav-items" },
    { path: "/sales-orders", icon: ShoppingCart, label: "Sales Orders", id: "nav-orders" },
    { path: "/location-master", icon: MapPin, label: "Location Master", id: "nav-locations" },
    { path: "/branch-master", icon: Building, label: "Branch Master", id: "nav-branches" },
    { path: "/warehouse-master", icon: Warehouse, label: "Warehouse Master", id: "nav-warehouses" },
    { path: "/configuration", icon: Cog, label: "Configuration", id: "nav-config" }
  ];

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
            {navigationItems.map(({ path, icon: Icon, label, id }) => (
              <Button
                key={path}
                variant={currentPage === path ? "default" : "ghost"}
                className="w-full justify-start"
                data-testid={id}
                onClick={() => setLocation(path)}
              >
                <Icon className="mr-2 h-4 w-4" />
                {label}
              </Button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}