import { useState } from "react";
import { College } from "@/types/college";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoogleMap } from "./google-map";
import { 
  Phone, 
  Mail, 
  Globe, 
  ExternalLink, 
  ArrowDownRight,
  MapPin,
  Calendar,
  GraduationCap,
  Building
} from "lucide-react";

interface CollegeModalProps {
  college: College | null;
  isOpen: boolean;
  onClose: () => void;
  onGetDirections: (college: College) => void;
}

export function CollegeModal({ college, isOpen, onClose, onGetDirections }: CollegeModalProps) {
  const [activeTab, setActiveTab] = useState("programs");

  if (!college) return null;

  const openGoogleMaps = () => {
    if (college.location.coordinates) {
      const url = `https://www.google.com/maps/search/?api=1&query=${college.location.coordinates.lat},${college.location.coordinates.lng}`;
      window.open(url, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="college-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold" data-testid="modal-college-name">
            {college.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* College Map & Basic Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              {college.location.coordinates && (
                <GoogleMap
                  colleges={[college]}
                  center={college.location.coordinates}
                  zoom={15}
                  height="h-64"
                />
              )}
              <div className="flex space-x-2 mt-4">
                <Button 
                  className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  onClick={() => onGetDirections(college)}
                  data-testid="button-modal-directions"
                >
                  <ArrowDownRight className="w-4 h-4 mr-2" />
                  Get ArrowDownRight
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={openGoogleMaps}
                  data-testid="button-view-google-maps"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Google Maps
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-3">Basic Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center">
                      <Building className="w-4 h-4 mr-2" />
                      Type:
                    </span>
                    <Badge variant="secondary">{college.type}</Badge>
                  </div>
                  {college.yearEstablished && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Established:
                      </span>
                      <span className="text-foreground">{college.yearEstablished}</span>
                    </div>
                  )}
                  {college.affiliatedUniversity && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center">
                        <GraduationCap className="w-4 h-4 mr-2" />
                        Affiliated to:
                      </span>
                      <span className="text-foreground">{college.affiliatedUniversity}</span>
                    </div>
                  )}
                  {college.mediumOfInstruction && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Medium:</span>
                      <span className="text-foreground">{college.mediumOfInstruction.join(', ')}</span>
                    </div>
                  )}
                  <div className="flex items-start justify-between">
                    <span className="text-muted-foreground flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Address:
                    </span>
                    <span className="text-foreground text-right max-w-xs">{college.location.address}</span>
                  </div>
                </div>
              </div>
              
              {college.contact && (
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Contact Information</h3>
                  <div className="space-y-2 text-sm">
                    {college.contact.phone && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className="text-foreground">{college.contact.phone}</span>
                      </div>
                    )}
                    {college.contact.email && (
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className="text-foreground">{college.contact.email}</span>
                      </div>
                    )}
                    {college.contact.website && (
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
                        <a 
                          href={college.contact.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {college.contact.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Information Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="programs" data-testid="tab-programs">Academic Programs</TabsTrigger>
              <TabsTrigger value="admission" data-testid="tab-admission">Admission</TabsTrigger>
              <TabsTrigger value="facilities" data-testid="tab-facilities">Facilities</TabsTrigger>
              <TabsTrigger value="other" data-testid="tab-other">Other Info</TabsTrigger>
            </TabsList>

            <TabsContent value="programs" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {college.programs?.undergraduate && college.programs.undergraduate.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Undergraduate Programs</h3>
                    <div className="space-y-2">
                      {college.programs.undergraduate.map((program, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-accent rounded">
                          <span className="font-medium">{program}</span>
                          <span className="text-sm text-muted-foreground">4 years</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {college.programs?.postgraduate && college.programs.postgraduate.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Postgraduate Programs</h3>
                    <div className="space-y-2">
                      {college.programs.postgraduate.map((program, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-accent rounded">
                          <span className="font-medium">{program}</span>
                          <span className="text-sm text-muted-foreground">2 years</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {college.programs?.phd && college.programs.phd.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">PhD Programs</h3>
                    <div className="space-y-2">
                      {college.programs.phd.map((program, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-accent rounded">
                          <span className="font-medium">{program}</span>
                          <span className="text-sm text-muted-foreground">3-5 years</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="admission" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Entrance Exams</h3>
                  <div className="flex flex-wrap gap-2">
                    {college.entranceExams?.map((exam, index) => (
                      <Badge key={index} variant="outline" className="bg-primary/10 text-primary">
                        {exam}
                      </Badge>
                    ))}
                  </div>
                </div>

                {college.eligibilityCriteria && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Eligibility Criteria</h3>
                    <p className="text-sm text-muted-foreground">{college.eligibilityCriteria}</p>
                  </div>
                )}

                {college.admissionProcess && (
                  <div className="md:col-span-2">
                    <h3 className="font-semibold text-foreground mb-3">Admission Process</h3>
                    <p className="text-sm text-muted-foreground">{college.admissionProcess}</p>
                  </div>
                )}

                {college.cutoffInfo && college.cutoffInfo.length > 0 && (
                  <div className="md:col-span-2">
                    <h3 className="font-semibold text-foreground mb-3">Cut-off Information ({college.cutoffInfo[0]?.year})</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {college.cutoffInfo.map((cutoff, index) => (
                        <div key={index} className="p-3 bg-accent rounded">
                          <div className="font-medium">{cutoff.category}</div>
                          <div className="text-sm text-muted-foreground">
                            {cutoff.marks ? `${cutoff.marks}% marks` : ''}
                            {cutoff.rank ? `Rank: ${cutoff.rank}` : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="facilities" className="space-y-4">
              {college.facilities && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Accommodation</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Boys Hostel:</span>
                        <span className={college.facilities.hostel.boys ? "text-green-600" : "text-red-600"}>
                          {college.facilities.hostel.boys ? "Available" : "Not Available"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Girls Hostel:</span>
                        <span className={college.facilities.hostel.girls ? "text-green-600" : "text-red-600"}>
                          {college.facilities.hostel.girls ? "Available" : "Not Available"}
                        </span>
                      </div>
                      {college.facilities.hostel.capacity && (
                        <div className="flex justify-between">
                          <span>Total Capacity:</span>
                          <span>{college.facilities.hostel.capacity}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Infrastructure</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Laboratory:</span>
                        <span className={college.facilities.labs ? "text-green-600" : "text-red-600"}>
                          {college.facilities.labs ? "Available" : "Not Available"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Research Facilities:</span>
                        <span className={college.facilities.research ? "text-green-600" : "text-red-600"}>
                          {college.facilities.research ? "Available" : "Not Available"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>WiFi:</span>
                        <span className={college.facilities.wifi ? "text-green-600" : "text-red-600"}>
                          {college.facilities.wifi ? "Available" : "Not Available"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sports Complex:</span>
                        <span className={college.facilities.sports ? "text-green-600" : "text-red-600"}>
                          {college.facilities.sports ? "Available" : "Not Available"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {college.facilities.library && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Library</h3>
                      <div className="space-y-2">
                        {college.facilities.library.capacity && (
                          <div className="flex justify-between">
                            <span>Capacity:</span>
                            <span>{college.facilities.library.capacity.toLocaleString()} books</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Digital Access:</span>
                          <span className={college.facilities.library.digitalAccess ? "text-green-600" : "text-red-600"}>
                            {college.facilities.library.digitalAccess ? "Available" : "Not Available"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>E-Resources:</span>
                          <span className={college.facilities.library.eResources ? "text-green-600" : "text-red-600"}>
                            {college.facilities.library.eResources ? "Available" : "Not Available"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {college.facilities.specialFeatures && college.facilities.specialFeatures.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Special Features</h3>
                      <div className="flex flex-wrap gap-2">
                        {college.facilities.specialFeatures.map((feature, index) => (
                          <Badge key={index} variant="outline">{feature}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="other" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {college.streams && college.streams.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Academic Streams</h3>
                    <div className="flex flex-wrap gap-2">
                      {college.streams.map((stream, index) => (
                        <Badge key={index} variant="outline" className="bg-accent">
                          {stream}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {college.governingBody && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Governing Body</h3>
                    <p className="text-sm text-muted-foreground">{college.governingBody}</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
