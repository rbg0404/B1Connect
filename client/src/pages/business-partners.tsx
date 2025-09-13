import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Search, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import SharedLayout from "@/components/shared-layout";
import type { BusinessPartner } from "@shared/schema";

export default function BusinessPartners() {
  const [selectedPartner, setSelectedPartner] = useState<BusinessPartner | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch business partners
  const { data: partnersData, isLoading: partnersLoading } = useQuery({
    queryKey: ["/api/business-partners"]
  });

  const partners = (partnersData as any)?.data || [];
  
  // Filter partners based on search term
  const filteredPartners = partners.filter((partner: BusinessPartner) =>
    partner.CardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.CardCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPartnerTypeColor = (type: string) => {
    switch (type) {
      case "cCustomer":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "cSupplier":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getPartnerTypeName = (type: string) => {
    switch (type) {
      case "cCustomer":
        return "Customer";
      case "cSupplier":
        return "Vendor";
      default:
        return type;
    }
  };

  const getStatusColor = (valid: string) => {
    return valid === "tYES" ? "text-green-600" : "text-yellow-600";
  };

  const getStatusName = (valid: string) => {
    return valid === "tYES" ? "Active" : "Pending";
  };

  const handleViewPartner = (partner: BusinessPartner) => {
    setSelectedPartner(partner);
  };

  return (
    <SharedLayout currentPage="/business-partners">
      <div className="flex h-screen">
        {/* Left Panel - Partners List */}
        <div className="w-1/2 border-r border-border overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                Business Partners
              </h2>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by partner name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-partners"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {partnersLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner className="h-8 w-8" />
              </div>
            ) : filteredPartners.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                {searchTerm ? "No partners found matching your search" : "No business partners found"}
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {filteredPartners.map((partner: BusinessPartner) => (
                  <Card 
                    key={partner.CardCode} 
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedPartner?.CardCode === partner.CardCode ? 'bg-muted border-primary' : ''
                    }`}
                    onClick={() => setSelectedPartner(partner)}
                    data-testid={`card-partner-${partner.CardCode}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-mono text-sm font-medium">{partner.CardCode}</div>
                        <Badge className={getPartnerTypeColor(partner.CardType)}>
                          {getPartnerTypeName(partner.CardType)}
                        </Badge>
                      </div>
                      <div className="font-medium text-foreground mb-1">{partner.CardName}</div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${partner.Valid === 'tYES' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                          <span className={getStatusColor(partner.Valid)}>
                            {getStatusName(partner.Valid)}
                          </span>
                        </div>
                        <div className="font-mono text-xs text-muted-foreground">
                          {partner.CurrentAccountBalance != null 
                            ? `${partner.Currency || '$'} ${partner.CurrentAccountBalance.toLocaleString()}`
                            : 'N/A'
                          }
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-border text-sm text-muted-foreground">
            Showing {filteredPartners.length} of {partners.length} business partners
          </div>
        </div>

        {/* Right Panel - Partner Details */}
        <div className="w-1/2 overflow-hidden flex flex-col">
          {selectedPartner ? (
            <>
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedPartner.CardName}</h3>
                    <p className="text-sm text-muted-foreground font-mono">{selectedPartner.CardCode}</p>
                  </div>
                  <Button 
                    size="sm" 
                    data-testid={`button-view-detail-${selectedPartner.CardCode}`}
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
                          <label className="text-sm font-medium text-muted-foreground">Card Code</label>
                          <p className="font-mono text-sm">{selectedPartner.CardCode}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Partner Name</label>
                          <p className="text-sm">{selectedPartner.CardName}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Type</label>
                          <div>
                            <Badge className={getPartnerTypeColor(selectedPartner.CardType)}>
                              {getPartnerTypeName(selectedPartner.CardType)}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Status</label>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${selectedPartner.Valid === 'tYES' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                            <span className={`text-sm ${getStatusColor(selectedPartner.Valid)}`}>
                              {getStatusName(selectedPartner.Valid)}
                            </span>
                          </div>
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
                          <label className="text-sm font-medium text-muted-foreground">Currency</label>
                          <p className="font-mono text-sm">{selectedPartner.Currency || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Current Balance</label>
                          <p className="font-mono text-sm">
                            {selectedPartner.CurrentAccountBalance != null 
                              ? `${selectedPartner.Currency || '$'} ${selectedPartner.CurrentAccountBalance.toLocaleString()}`
                              : 'N/A'
                            }
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
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Select a business partner to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </SharedLayout>
  );
}