import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SharedLayout from "@/components/shared-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Building } from "lucide-react";

interface Branch {
  Code: string;
  Name: string;
  Description?: string;
  Disabled?: string;
  Address?: string;
  City?: string;
  Country?: string;
}

export default function BranchMaster() {
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  const { data: branchesData, isLoading, error } = useQuery({
    queryKey: ["/api/branches"],
  });

  const branches = (branchesData as any)?.data || [];

  return (
    <SharedLayout currentPage="/branch-master">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Building className="h-8 w-8" />
            Branch Master
          </h1>
          <p className="text-muted-foreground">Manage branches and their information</p>
        </div>

        <div className="flex gap-6 h-[calc(100vh-200px)]">
          {/* Left: List */}
          <Card className="w-1/3">
            <CardHeader>
              <CardTitle>Branches</CardTitle>
              <CardDescription>
                {branches.length} branches available
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 text-center">
                  <LoadingSpinner className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Loading branches...</p>
                </div>
              ) : error ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-destructive">Failed to load branches</p>
                </div>
              ) : (
                <div className="max-h-[500px] overflow-y-auto">
                  {branches.map((branch: Branch) => (
                    <div
                      key={branch.Code}
                      onClick={() => setSelectedBranch(branch)}
                      className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedBranch?.Code === branch.Code ? "bg-muted" : ""
                      }`}
                      data-testid={`branch-item-${branch.Code}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{branch.Code}</h3>
                          <p className="text-sm text-muted-foreground">{branch.Name}</p>
                          {branch.City && (
                            <p className="text-xs text-muted-foreground">{branch.City}</p>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          {branch.Disabled === "Y" && (
                            <Badge variant="destructive">Disabled</Badge>
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
              <CardTitle>Branch Details</CardTitle>
              <CardDescription>
                {selectedBranch ? `Details for ${selectedBranch.Code}` : "Select a branch to view details"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedBranch ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Code</label>
                      <p className="text-lg font-semibold" data-testid="branch-code">{selectedBranch.Code}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Name</label>
                      <p className="text-lg" data-testid="branch-name">{selectedBranch.Name}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">Description</label>
                      <p className="text-lg" data-testid="branch-description">{selectedBranch.Description || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">City</label>
                      <p className="text-lg" data-testid="branch-city">{selectedBranch.City || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Country</label>
                      <p className="text-lg" data-testid="branch-country">{selectedBranch.Country || "N/A"}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">Address</label>
                      <p className="text-lg" data-testid="branch-address">{selectedBranch.Address || "N/A"}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Badge variant={selectedBranch.Disabled === "Y" ? "destructive" : "default"}>
                      {selectedBranch.Disabled === "Y" ? "Disabled" : "Active"}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Select a branch from the list to view its details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </SharedLayout>
  );
}