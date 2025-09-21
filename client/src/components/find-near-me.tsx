import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { College, NearbySearch, GeocodeResult } from "@/types/college";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { GoogleMap } from "./google-map";
import { MapPin, Navigation, Loader2, AlertCircle } from "lucide-react";
import { getCurrentPosition } from "@/lib/google-maps";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FindNearMeProps {
  onCollegeSelect: (college: College) => void;
  onGetDirections: (college: College) => void;
}

export function FindNearMe({ onCollegeSelect, onGetDirections }: FindNearMeProps) {
  const [locationInput, setLocationInput] = useState("");
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchRadius, setSearchRadius] = useState(25);
  const [nearbyColleges, setNearbyColleges] = useState<College[]>([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  const { toast } = useToast();

  // Geocode mutation
  const geocodeMutation = useMutation({
    mutationFn: async (address: string) => {
      const response = await apiRequest("POST", "/api/geocode", { address });
      return response.json() as Promise<GeocodeResult>;
    },
    onSuccess: (data) => {
      setCurrentLocation(data.coordinates);
      findNearbyColleges(data.coordinates, searchRadius);
    },
    onError: () => {
      toast({
        title: "Geocoding Failed",
        description: "Unable to find the location. Please try a different address.",
        variant: "destructive",
      });
    },
  });

  // Nearby search mutation
  const nearbyMutation = useMutation({
    mutationFn: async (params: NearbySearch) => {
      const response = await apiRequest("POST", "/api/colleges/nearby", params);
      return response.json();
    },
    onSuccess: (data) => {
      setNearbyColleges(data.colleges);
      toast({
        title: "Search Complete",
        description: `Found ${data.colleges.length} colleges within ${searchRadius} km.`,
      });
    },
    onError: () => {
      toast({
        title: "Search Failed",
        description: "Unable to find nearby colleges. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGetCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const position = await getCurrentPosition();
      const coordinates = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setCurrentLocation(coordinates);
      findNearbyColleges(coordinates, searchRadius);
      toast({
        title: "Location Found",
        description: "Using your current location to find nearby colleges.",
      });
    } catch (error) {
      console.error('Geolocation error:', error);
      toast({
        title: "Location Access Denied",
        description: "Please enable location access or enter your location manually.",
        variant: "destructive",
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleFindColleges = () => {
    if (locationInput.trim()) {
      geocodeMutation.mutate(locationInput.trim());
    } else if (currentLocation) {
      findNearbyColleges(currentLocation, searchRadius);
    } else {
      toast({
        title: "Location Required",
        description: "Please enter a location or use GPS to find nearby colleges.",
        variant: "destructive",
      });
    }
  };

  const findNearbyColleges = (coordinates: { lat: number; lng: number }, radius: number) => {
    nearbyMutation.mutate({ ...coordinates, radius });
  };

  const handleRadiusChange = (value: number[]) => {
    setSearchRadius(value[0]);
    if (currentLocation) {
      findNearbyColleges(currentLocation, value[0]);
    }
  };

  const handleCollegeClick = (college: College) => {
    onCollegeSelect(college);
  };

  const handleGetDirections = (college: College) => {
    if (college.location.coordinates) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${college.location.coordinates.lat},${college.location.coordinates.lng}`;
      window.open(url, '_blank');
    }
    onGetDirections(college);
  };

  const isLoading = geocodeMutation.isPending || nearbyMutation.isPending || isGettingLocation;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-4">Find Colleges Near You</h2>
          <p className="text-muted-foreground mb-6">
            Allow location access or enter your location to discover government colleges in your vicinity
          </p>
          
          {/* Location Input */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Enter your location or use GPS"
                    className="pl-10"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleFindColleges()}
                    data-testid="input-location-search"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={handleGetCurrentLocation}
                  disabled={isLoading}
                  data-testid="button-use-gps"
                >
                  {isGettingLocation ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Navigation className="w-4 h-4 mr-2" />
                  )}
                  Use GPS
                </Button>
                <Button
                  onClick={handleFindColleges}
                  disabled={isLoading}
                  data-testid="button-find-colleges"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4 mr-2" />
                  )}
                  Find Colleges
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Results */}
      {(currentLocation || nearbyColleges.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Interactive Map */}
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">Colleges Near You</h3>
            <GoogleMap
              colleges={nearbyColleges}
              center={currentLocation || undefined}
              zoom={13}
              onCollegeClick={handleCollegeClick}
              showCurrentLocation={!!currentLocation}
              currentLocation={currentLocation || undefined}
            />
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="font-medium text-foreground">Search Radius</Label>
                  <span className="text-sm text-muted-foreground" data-testid="radius-value">
                    {searchRadius} km
                  </span>
                </div>
                <Slider
                  value={[searchRadius]}
                  onValueChange={handleRadiusChange}
                  min={5}
                  max={100}
                  step={5}
                  className="w-full"
                  data-testid="slider-radius"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>5 km</span>
                  <span>100 km</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Nearby Colleges List */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-foreground">Nearby Colleges</h3>
              <span className="text-sm text-muted-foreground" data-testid="nearby-count">
                {nearbyColleges.length} colleges found
              </span>
            </div>
            
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : nearbyColleges.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h4 className="font-medium mb-2">No colleges found</h4>
                  <p className="text-sm text-muted-foreground">
                    Try increasing the search radius or searching in a different area.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {nearbyColleges.map((college) => (
                  <Card key={college.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1" data-testid={`nearby-college-${college.id}`}>
                            {college.name}
                          </h4>
                          <div className="flex items-center text-sm text-muted-foreground mb-2">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span>{college.distance?.toFixed(1)} km away</span>
                          </div>
                        </div>
                        <div className="text-right">
                          {college.streams && college.streams.length > 0 && (
                            <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
                              {college.streams[0]}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleCollegeClick(college)}
                          data-testid={`button-view-details-${college.id}`}
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                          onClick={() => handleGetDirections(college)}
                          data-testid={`button-nearby-directions-${college.id}`}
                        >
                          <Navigation className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
