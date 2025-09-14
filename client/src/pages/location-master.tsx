import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SharedLayout from "@/components/shared-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

interface Location {
  Code: string;
  Name: string;
  Disabled?: string;
  Locked?: string;
  U_LocationType?: string;
}

export default function LocationMaster() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const { data: locationsData, isLoading, error } = useQuery({
    queryKey: ["/api/locations"],
  });

  const locations = (locationsData as any)?.data || [];

  return (
    <SharedLayout currentPage="/location-master">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <MapPin className="h-8 w-8" />
            Location Master
          </h1>
          <p className="text-muted-foreground">Manage locations and warehouse assignments</p>
        </div>

        <div className="flex gap-6 h-[calc(100vh-200px)]">
          {/* Left: List */}
          <Card className="w-1/3">
            <CardHeader>
              <CardTitle>Locations</CardTitle>
              <CardDescription>
                {locations.length} locations available
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 text-center">
                  <LoadingSpinner className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Loading locations...</p>
                </div>
              ) : error ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-destructive">Failed to load locations</p>
                </div>
              ) : (
                <div className="max-h-[500px] overflow-y-auto">
                  {locations.map((location: Location) => (
                    <div
                      key={location.Code}
                      onClick={() => setSelectedLocation(location)}
                      className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedLocation?.Code === location.Code ? "bg-muted" : ""
                      }`}
                      data-testid={`location-item-${location.Code}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{location.Code}</h3>
                          <p className="text-sm text-muted-foreground">{location.Name}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          {location.Disabled === "Y" && (
                            <Badge variant="destructive">Disabled</Badge>
                          )}
                          {location.Locked === "Y" && (
                            <Badge variant="secondary">Locked</Badge>
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
              <CardTitle>Location Details</CardTitle>
              <CardDescription>
                {selectedLocation ? `Details for ${selectedLocation.Code}` : "Select a location to view details"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedLocation ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Code</label>
                      <p className="text-lg font-semibold" data-testid="location-code">{selectedLocation.Code}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Name</label>
                      <p className="text-lg" data-testid="location-name">{selectedLocation.Name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Location Type</label>
                      <p className="text-lg" data-testid="location-type">{selectedLocation.U_LocationType || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <p className="text-lg" data-testid="location-status">
                        {selectedLocation.Disabled === "Y" ? "Disabled" : "Active"}
                        {selectedLocation.Locked === "Y" && " (Locked)"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Badge variant={selectedLocation.Disabled === "Y" ? "destructive" : "default"}>
                      {selectedLocation.Disabled === "Y" ? "Disabled" : "Active"}
                    </Badge>
                    <Badge variant={selectedLocation.Locked === "Y" ? "secondary" : "outline"}>
                      {selectedLocation.Locked === "Y" ? "Locked" : "Unlocked"}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Select a location from the list to view its details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </SharedLayout>
  );
}