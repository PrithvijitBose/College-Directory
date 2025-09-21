import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { College, SearchFilters } from "@/types/college";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { CollegeCard } from "./college-card";
import { GoogleMap } from "./google-map";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, Filter, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface CollegeSearchProps {
  onCollegeSelect: (college: College) => void;
  onGetDirections: (college: College) => void;
}

export function CollegeSearch({ onCollegeSelect, onGetDirections }: CollegeSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchResults, setSearchResults] = useState<{ colleges: College[]; count: number } | null>(null);
  
  const queryClient = useQueryClient();
  const itemsPerPage = 10;

  // Default colleges query
  const { data: defaultColleges, isLoading: isLoadingDefault } = useQuery({
    queryKey: ["/api/colleges"],
    enabled: !searchResults,
  });

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: async (searchFilters: SearchFilters) => {
      const response = await apiRequest("POST", "/api/colleges/search", searchFilters);
      return response.json();
    },
    onSuccess: (data) => {
      setSearchResults(data);
      setCurrentPage(1);
    },
  });

  const colleges = searchResults?.colleges || defaultColleges || [];
  const totalCount = searchResults?.count || colleges.length;
  const isLoading = isLoadingDefault || searchMutation.isPending;

  // Pagination
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedColleges = colleges.slice(startIndex, endIndex);

  const handleSearch = () => {
    if (Object.values(filters).every(value => !value)) {
      // Clear search results if no filters
      setSearchResults(null);
      setCurrentPage(1);
      return;
    }
    searchMutation.mutate(filters);
  };

  const handleClearSearch = () => {
    setFilters({});
    setSearchResults(null);
    setCurrentPage(1);
  };

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    const normalizedValue = value === "all" || value === "any" ? undefined : value;
    setFilters(prev => ({ ...prev, [key]: normalizedValue }));
  };

  const getDirectionsUrl = (college: College) => {
    if (college.location.coordinates) {
      return `https://www.google.com/maps/dir/?api=1&destination=${college.location.coordinates.lat},${college.location.coordinates.lng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(college.location.address)}`;
  };

  const handleGetDirections = (college: College) => {
    window.open(getDirectionsUrl(college), '_blank');
    onGetDirections(college);
  };

  return (
    <div className="space-y-8">
      {/* Search & Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
                Location
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="location"
                  type="text"
                  placeholder="City, District, or State"
                  className="pl-10"
                  value={filters.location || ""}
                  onChange={(e) => updateFilter("location", e.target.value)}
                  data-testid="input-location"
                />
              </div>
            </div>

            <div>
              <Label className="block text-sm font-medium text-foreground mb-2">Stream</Label>
              <Select value={filters.stream || ""} onValueChange={(value) => updateFilter("stream", value)}>
                <SelectTrigger data-testid="select-stream">
                  <SelectValue placeholder="All Streams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Streams</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Medicine">Medicine</SelectItem>
                  <SelectItem value="Arts">Arts</SelectItem>
                  <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="Commerce">Commerce</SelectItem>
                  <SelectItem value="Law">Law</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="block text-sm font-medium text-foreground mb-2">Degree Level</Label>
              <Select value={filters.degreeLevel || ""} onValueChange={(value) => updateFilter("degreeLevel", value)}>
                <SelectTrigger data-testid="select-degree-level">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                  <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                  <SelectItem value="Diploma">Diploma</SelectItem>
                  <SelectItem value="PhD">PhD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleSearch}
                disabled={isLoading}
                className="w-full"
                data-testid="button-search"
              >
                <Search className="w-4 h-4 mr-2" />
                {isLoading ? "Searching..." : "Search"}
              </Button>
            </div>
          </div>

          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <div className="border-t border-border pt-4">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="text-primary hover:text-primary/80" data-testid="button-advanced-filters">
                  <Filter className="w-4 h-4 mr-2" />
                  Advanced Filters
                  <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-4">
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="block text-sm font-medium text-foreground mb-2">Entrance Exam</Label>
                    <Select value={filters.entranceExam || ""} onValueChange={(value) => updateFilter("entranceExam", value)}>
                      <SelectTrigger data-testid="select-entrance-exam">
                        <SelectValue placeholder="Any Exam" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Exam</SelectItem>
                        <SelectItem value="JEE Main">JEE Main</SelectItem>
                        <SelectItem value="JEE Advanced">JEE Advanced</SelectItem>
                        <SelectItem value="NEET">NEET</SelectItem>
                        <SelectItem value="CUET">CUET</SelectItem>
                        <SelectItem value="GATE">GATE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="block text-sm font-medium text-foreground mb-2">Hostel Facility</Label>
                    <Select value={filters.hostel || ""} onValueChange={(value) => updateFilter("hostel", value)}>
                      <SelectTrigger data-testid="select-hostel">
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="Boys">Boys Hostel</SelectItem>
                        <SelectItem value="Girls">Girls Hostel</SelectItem>
                        <SelectItem value="Both">Both Available</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="block text-sm font-medium text-foreground mb-2">Established</Label>
                    <Select value={filters.yearRange || ""} onValueChange={(value) => updateFilter("yearRange", value)}>
                      <SelectTrigger data-testid="select-year-range">
                        <SelectValue placeholder="Any Year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Year</SelectItem>
                        <SelectItem value="before-1960">Before 1960</SelectItem>
                        <SelectItem value="1960-1980">1960-1980</SelectItem>
                        <SelectItem value="1980-2000">1980-2000</SelectItem>
                        <SelectItem value="after-2000">After 2000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button onClick={handleSearch} disabled={isLoading} data-testid="button-search-advanced">
                    <Search className="w-4 h-4 mr-2" />
                    Search with Filters
                  </Button>
                  <Button variant="outline" onClick={handleClearSearch} data-testid="button-clear-search">
                    Clear All
                  </Button>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* College List */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {searchResults ? "Search Results" : "All Colleges"}
            </h2>
            <span className="text-muted-foreground" data-testid="results-count">
              {totalCount} colleges found
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-muted rounded mb-4"></div>
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : paginatedColleges.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-muted-foreground">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No colleges found</h3>
                  <p>Try adjusting your search criteria or clear filters to see all colleges.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {paginatedColleges.map((college) => (
                <CollegeCard
                  key={college.id}
                  college={college}
                  onViewDetails={onCollegeSelect}
                  onGetDirections={handleGetDirections}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  data-testid="button-prev-page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      data-testid={`button-page-${pageNum}`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                {totalPages > 5 && (
                  <>
                    <span className="px-3 py-2 text-muted-foreground">...</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      data-testid={`button-page-${totalPages}`}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  data-testid="button-next-page"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </nav>
            </div>
          )}
        </div>

        {/* Map Section */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <h3 className="text-lg font-semibold text-foreground mb-4">College Locations</h3>
            <GoogleMap
              colleges={paginatedColleges}
              onCollegeClick={onCollegeSelect}
            />
            <Card className="mt-4">
              <CardContent className="p-4">
                <h4 className="font-medium text-foreground mb-2">Map Legend</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
                    <span className="text-muted-foreground">Government Colleges</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-secondary rounded-full mr-2"></div>
                    <span className="text-muted-foreground">Central Universities</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
