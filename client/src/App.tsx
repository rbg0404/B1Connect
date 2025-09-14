import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LoginPage from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import BusinessPartners from "@/pages/business-partners";
import Items from "@/pages/items";
import SalesOrders from "@/pages/sales-orders";
import LocationMaster from "@/pages/location-master";
import BranchMaster from "@/pages/branch-master";
import WarehouseMaster from "@/pages/warehouse-master";
import Configuration from "@/pages/configuration";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/business-partners" component={BusinessPartners} />
      <Route path="/items" component={Items} />
      <Route path="/sales-orders" component={SalesOrders} />
      <Route path="/location-master" component={LocationMaster} />
      <Route path="/branch-master" component={BranchMaster} />
      <Route path="/warehouse-master" component={WarehouseMaster} />
      <Route path="/configuration" component={Configuration} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
