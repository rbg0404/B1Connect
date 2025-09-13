import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Search, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import SharedLayout from "@/components/shared-layout";
import type { Item } from "@shared/schema";

export default function Items() {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch items
  const { data: itemsData, isLoading: itemsLoading } = useQuery({
    queryKey: ["/api/items"]
  });

  const items = (itemsData as any)?.data || [];
  
  // Filter items based on search term
  const filteredItems = items.filter((item: Item) =>
    item.ItemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.ItemCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getItemTypeColor = (type: string) => {
    switch (type) {
      case "itItems":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "itServices":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "itAssets":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getItemTypeName = (type: string) => {
    switch (type) {
      case "itItems":
        return "Item";
      case "itServices":
        return "Service";
      case "itAssets":
        return "Asset";
      default:
        return type;
    }
  };

  const getStatusColor = (valid: string) => {
    return valid === "tYES" ? "text-green-600" : "text-yellow-600";
  };

  const getStatusName = (valid: string) => {
    return valid === "tYES" ? "Active" : "Inactive";
  };

  return (
    <SharedLayout currentPage="/items">
      <div className="flex h-screen">
        {/* Left Panel - Items List */}
        <div className="w-1/2 border-r border-border overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Box className="h-5 w-5" />
                Items
              </h2>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by item name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-items"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {itemsLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner className="h-8 w-8" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                {searchTerm ? "No items found matching your search" : "No items found"}
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {filteredItems.map((item: Item) => (
                  <Card 
                    key={item.ItemCode} 
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedItem?.ItemCode === item.ItemCode ? 'bg-muted border-primary' : ''
                    }`}
                    onClick={() => setSelectedItem(item)}
                    data-testid={`card-item-${item.ItemCode}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-mono text-sm font-medium">{item.ItemCode}</div>
                        <Badge className={getItemTypeColor(item.ItemType)}>
                          {getItemTypeName(item.ItemType)}
                        </Badge>
                      </div>
                      <div className="font-medium text-foreground mb-1">{item.ItemName}</div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${item.Valid === 'tYES' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                          <span className={getStatusColor(item.Valid)}>
                            {getStatusName(item.Valid)}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Qty: {item.QuantityOnStock || 0}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-border text-sm text-muted-foreground">
            Showing {filteredItems.length} of {items.length} items
          </div>
        </div>

        {/* Right Panel - Item Details */}
        <div className="w-1/2 overflow-hidden flex flex-col">
          {selectedItem ? (
            <>
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedItem.ItemName}</h3>
                    <p className="text-sm text-muted-foreground font-mono">{selectedItem.ItemCode}</p>
                  </div>
                  <Button 
                    size="sm" 
                    data-testid={`button-view-detail-${selectedItem.ItemCode}`}
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
                      <CardTitle className="text-base">Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Item Code</label>
                          <p className="font-mono text-sm">{selectedItem.ItemCode}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Item Name</label>
                          <p className="text-sm">{selectedItem.ItemName}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Type</label>
                          <div>
                            <Badge className={getItemTypeColor(selectedItem.ItemType)}>
                              {getItemTypeName(selectedItem.ItemType)}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Status</label>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${selectedItem.Valid === 'tYES' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                            <span className={`text-sm ${getStatusColor(selectedItem.Valid)}`}>
                              {getStatusName(selectedItem.Valid)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Inventory Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Inventory Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Quantity on Stock</label>
                          <p className="font-mono text-sm">{selectedItem.QuantityOnStock || 0}</p>
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
                <Box className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Select an item to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </SharedLayout>
  );
}