export interface College {
  id: string;
  name: string;
  shortName?: string;
  location: {
    city: string;
    district: string;
    state: string;
    address: string;
    coordinates?: { lat: number; lng: number };
  };
  type: string;
  yearEstablished?: number;
  programs?: {
    undergraduate: string[];
    postgraduate: string[];
    diploma: string[];
    phd: string[];
  };
  streams?: string[];
  affiliatedUniversity?: string;
  governingBody?: string;
  entranceExams?: string[];
  cutoffInfo?: {
    category: string;
    marks?: number;
    rank?: number;
    year: number;
  }[];
  eligibilityCriteria?: string;
  admissionProcess?: string;
  mediumOfInstruction?: string[];
  facilities?: {
    hostel: {
      boys: boolean;
      girls: boolean;
      capacity?: number;
    };
    library: {
      capacity?: number;
      digitalAccess: boolean;
      eResources: boolean;
    };
    labs: boolean;
    research: boolean;
    internet: boolean;
    wifi: boolean;
    sports: boolean;
    specialFeatures: string[];
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  distance?: number; // Added by nearby search
  isActive?: boolean;
  createdAt?: string;
}

export interface SearchFilters {
  location?: string;
  stream?: string;
  degreeLevel?: string;
  entranceExam?: string;
  hostel?: string;
  yearRange?: string;
}

export interface NearbySearch {
  lat: number;
  lng: number;
  radius: number;
}

export interface GeocodeResult {
  address: string;
  coordinates: { lat: number; lng: number };
  formatted_address: string;
}
