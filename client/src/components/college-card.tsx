import { College } from "@/types/college";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Heart, Bed, Wifi, Book, Dumbbell, ArrowDownRight } from "lucide-react";

interface CollegeCardProps {
  college: College;
  onViewDetails: (college: College) => void;
  onGetDirections: (college: College) => void;
}

export function CollegeCard({ college, onViewDetails, onGetDirections }: CollegeCardProps) {
  return (
    <Card className="college-card hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-foreground mb-2" data-testid={`college-name-${college.id}`}>
              {college.name}
            </h3>
            <div className="flex items-center text-muted-foreground mb-2">
              <MapPin className="w-4 h-4 mr-2" />
              <span data-testid={`college-location-${college.id}`}>
                {college.location.city}, {college.location.state}
              </span>
              {college.distance && (
                <span className="ml-2 text-sm">({college.distance.toFixed(1)} km away)</span>
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <Badge variant="secondary" data-testid={`college-type-${college.id}`}>
                {college.type}
              </Badge>
              {college.yearEstablished && (
                <span>Est. {college.yearEstablished}</span>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Heart className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="font-medium text-foreground mb-2">Programs Offered</h4>
            <div className="flex flex-wrap gap-2">
              {college.programs?.undergraduate.slice(0, 3).map((program, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {program.split(' ').slice(0, 2).join(' ')}
                </Badge>
              ))}
              {college.programs && (
                college.programs.undergraduate.length + 
                college.programs.postgraduate.length + 
                college.programs.diploma.length + 
                college.programs.phd.length
              ) > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{(
                    college.programs.undergraduate.length + 
                    college.programs.postgraduate.length + 
                    college.programs.diploma.length + 
                    college.programs.phd.length
                  ) - 3} more
                </Badge>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-2">Entrance Exams</h4>
            <div className="flex flex-wrap gap-2">
              {college.entranceExams?.slice(0, 2).map((exam, index) => (
                <Badge key={index} variant="outline" className="bg-secondary/10 text-secondary text-xs">
                  {exam}
                </Badge>
              ))}
              {college.entranceExams && college.entranceExams.length > 2 && (
                <Badge variant="outline" className="bg-secondary/10 text-secondary text-xs">
                  +{college.entranceExams.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            {college.facilities?.hostel && (college.facilities.hostel.boys || college.facilities.hostel.girls) && (
              <div className="flex items-center">
                <Bed className="w-4 h-4 mr-1" />
                <span>Hostel Available</span>
              </div>
            )}
            {college.facilities?.wifi && (
              <div className="flex items-center">
                <Wifi className="w-4 h-4 mr-1" />
                <span>WiFi</span>
              </div>
            )}
            {college.facilities?.library && (
              <div className="flex items-center">
                <Book className="w-4 h-4 mr-1" />
                <span>Library</span>
              </div>
            )}
            {college.facilities?.sports && (
              <div className="flex items-center">
                <Dumbbell className="w-4 h-4 mr-1" />
                <span>Sports</span>
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => onViewDetails(college)}
              data-testid={`button-view-details-${college.id}`}
            >
              View Details & Location
            </Button>
            <Button 
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              onClick={() => onGetDirections(college)}
              data-testid={`button-directions-${college.id}`}
            >
              <ArrowDownRight className="w-4 h-4 mr-2" />
              Get ArrowDownRight
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

