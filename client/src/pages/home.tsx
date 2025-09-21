import { useState } from "react";
import { College } from "@/types/college";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CollegeSearch } from "@/components/college-search";
import { FindNearMe } from "@/components/find-near-me";
import { CollegeModal } from "@/components/college-modal";
import { GraduationCap, Search, MapPin } from "lucide-react";

export default function Home() {
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCollegeSelect = (college: College) => {
    setSelectedCollege(college);
    setIsModalOpen(true);
  };

  const handleGetDirections = (college: College) => {
    // This is handled in the components themselves
    console.log("Getting directions to:", college.name);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCollege(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <GraduationCap className="text-primary text-2xl w-8 h-8" />
              <h1 className="text-xl font-bold text-foreground">Gov College Directory</h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Find Government Colleges in India
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover comprehensive information about government colleges across India with detailed academic programs, 
            admission criteria, and interactive maps for easy navigation.
          </p>
        </div>

        {/* Tab Navigation */}
        <Tabs defaultValue="search" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-auto grid-cols-2">
              <TabsTrigger value="search" className="px-6 py-2" data-testid="tab-search">
                <Search className="w-4 h-4 mr-2" />
                Search Colleges
              </TabsTrigger>
              <TabsTrigger value="nearme" className="px-6 py-2" data-testid="tab-nearme">
                <MapPin className="w-4 h-4 mr-2" />
                Find Near Me
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="search">
            <CollegeSearch
              onCollegeSelect={handleCollegeSelect}
              onGetDirections={handleGetDirections}
            />
          </TabsContent>

          <TabsContent value="nearme">
            <FindNearMe
              onCollegeSelect={handleCollegeSelect}
              onGetDirections={handleGetDirections}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* College Details Modal */}
      <CollegeModal
        college={selectedCollege}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onGetDirections={handleGetDirections}
      />
    </div>
  );
}
