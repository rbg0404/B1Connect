import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SharedLayout from "@/components/shared-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Warehouse } from "lucide-react";

interface WarehouseData {
  WhsCode: string;
  WhsName: string;
  Location?: string;
  Inactive?: string;
  Locked?: string;
  Address?: string;
  Country?: string;
  City?: string;
  BinActivat?: string;
}

export default function WarehouseMaster() {
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseData | null>(null);

  const { data: warehousesData, isLoading, error } = useQuery({
    queryKey: ["/api/warehouses"],
  });

  const warehouses = warehousesData?.data || [];

  return (
    <SharedLayout currentPage="/warehouse-master">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Warehouse className="h-8 w-8" />
            Warehouse Master
          </h1>
          <p className="text-muted-foreground">Manage warehouses and inventory locations</p>
        </div>

        <div className="flex gap-6 h-[calc(100vh-200px)]">
          {/* Left: List */}
          <Card className="w-1/3">
            <CardHeader>
              <CardTitle>Warehouses</CardTitle>
              <CardDescription>
                {warehouses.length} warehouses available
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 text-center">
                  <LoadingSpinner className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Loading warehouses...</p>
                </div>
              ) : error ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-destructive">Failed to load warehouses</p>
                </div>
              ) : (
                <div className="max-h-[500px] overflow-y-auto">
                  {warehouses.map((warehouse: WarehouseData) => (
                    <div
                      key={warehouse.WhsCode}
                      onClick={() => setSelectedWarehouse(warehouse)}
                      className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedWarehouse?.WhsCode === warehouse.WhsCode ? "bg-muted" : ""
                      }`}
                      data-testid={`warehouse-item-${warehouse.WhsCode}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{warehouse.WhsCode}</h3>
                          <p className="text-sm text-muted-foreground">{warehouse.WhsName}</p>
                          {warehouse.City && (
                            <p className="text-xs text-muted-foreground">{warehouse.City}</p>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          {warehouse.Inactive === "Y" && (
                            <Badge variant="destructive">Inactive</Badge>
                          )}
                          {warehouse.Locked === "Y" && (
                            <Badge variant="secondary">Locked</Badge>
                          )}
                          {warehouse.BinActivat === "Y" && (
                            <Badge variant="outline">Bin Active</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right: Details */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Warehouse Details</CardTitle>
              <CardDescription>
                {selectedWarehouse ? `Details for ${selectedWarehouse.WhsCode}` : "Select a warehouse to view details"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedWarehouse ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Warehouse Code</label>
                      <p className="text-lg font-semibold" data-testid="warehouse-code">{selectedWarehouse.WhsCode}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Warehouse Name</label>
                      <p className="text-lg" data-testid="warehouse-name">{selectedWarehouse.WhsName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Location</label>
                      <p className="text-lg" data-testid="warehouse-location">{selectedWarehouse.Location || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">City</label>
                      <p className="text-lg" data-testid="warehouse-city">{selectedWarehouse.City || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Country</label>
                      <p className="text-lg" data-testid="warehouse-country">{selectedWarehouse.Country || "N/A"}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">Address</label>
                      <p className="text-lg" data-testid="warehouse-address">{selectedWarehouse.Address || "N/A"}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Badge variant={selectedWarehouse.Inactive === "Y" ? "destructive" : "default"}>
                      {selectedWarehouse.Inactive === "Y" ? "Inactive" : "Active"}
                    </Badge>
                    <Badge variant={selectedWarehouse.Locked === "Y" ? "secondary" : "outline"}>
                      {selectedWarehouse.Locked === "Y" ? "Locked" : "Unlocked"}
                    </Badge>
                    <Badge variant={selectedWarehouse.BinActivat === "Y" ? "default" : "outline"}>
                      Bin Management: {selectedWarehouse.BinActivat === "Y" ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Warehouse className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Select a warehouse from the list to view its details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </SharedLayout>
  );
}