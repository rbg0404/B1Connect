import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, Search, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import SharedLayout from "@/components/shared-layout";
import type { SalesOrder } from "@shared/schema";

export default function SalesOrders() {
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch sales orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/sales-orders"]
  });

  const orders = (ordersData as any)?.data || [];
  
  // Filter orders based on search term
  const filteredOrders = orders.filter((order: SalesOrder) =>
    order.CardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.CardCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.DocNum.toString().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "bost_Open":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "bost_Close":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      case "bost_Paid":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "bost_Delivered":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getStatusName = (status: string) => {
    switch (status) {
      case "bost_Open":
        return "Open";
      case "bost_Close":
        return "Closed";
      case "bost_Paid":
        return "Paid";
      case "bost_Delivered":
        return "Delivered";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <SharedLayout currentPage="/sales-orders">
      <div className="flex h-screen">
        {/* Left Panel - Sales Orders List */}
        <div className="w-1/2 border-r border-border overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Sales Orders
              </h2>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer name, code, or document number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-orders"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {ordersLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner className="h-8 w-8" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                {searchTerm ? "No sales orders found matching your search" : "No sales orders found"}
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {filteredOrders.map((order: SalesOrder) => (
                  <Card 
                    key={order.DocEntry} 
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedOrder?.DocEntry === order.DocEntry ? 'bg-muted border-primary' : ''
                    }`}
                    onClick={() => setSelectedOrder(order)}
                    data-testid={`card-order-${order.DocEntry}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-mono text-sm font-medium">#{order.DocNum}</div>
                        <Badge className={getStatusColor(order.DocumentStatus)}>
                          {getStatusName(order.DocumentStatus)}
                        </Badge>
                      </div>
                      <div className="font-medium text-foreground mb-1">{order.CardName}</div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-muted-foreground">
                          {formatDate(order.DocDate)}
                        </div>
                        <div className="font-mono text-xs text-muted-foreground">
                          ${order.DocTotal.toLocaleString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-border text-sm text-muted-foreground">
            Showing {filteredOrders.length} of {orders.length} sales orders
          </div>
        </div>

        {/* Right Panel - Order Details */}
        <div className="w-1/2 overflow-hidden flex flex-col">
          {selectedOrder ? (
            <>
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Sales Order #{selectedOrder.DocNum}</h3>
                    <p className="text-sm text-muted-foreground">{selectedOrder.CardName}</p>
                  </div>
                  <Button 
                    size="sm" 
                    data-testid={`button-view-detail-${selectedOrder.DocEntry}`}
                    onClick={() => {/* Navigate to individual detail view */}}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Basic Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Order Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Document Entry</label>
                          <p className="font-mono text-sm">{selectedOrder.DocEntry}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Document Number</label>
                          <p className="font-mono text-sm">#{selectedOrder.DocNum}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Status</label>
                          <div>
                            <Badge className={getStatusColor(selectedOrder.DocumentStatus)}>
                              {getStatusName(selectedOrder.DocumentStatus)}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Order Date</label>
                          <p className="text-sm">{formatDate(selectedOrder.DocDate)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Customer Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Customer Code</label>
                          <p className="font-mono text-sm">{selectedOrder.CardCode}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Customer Name</label>
                          <p className="text-sm">{selectedOrder.CardName}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Financial Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Financial Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Total Amount</label>
                          <p className="font-mono text-sm font-medium">
                            ${selectedOrder.DocTotal.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Select a sales order to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </SharedLayout>
  );
}