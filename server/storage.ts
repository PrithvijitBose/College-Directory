import { type College, type InsertCollege, type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // College methods
  getAllColleges(): Promise<College[]>;
  getCollegeById(id: string): Promise<College | undefined>;
  searchColleges(filters: {
    location?: string;
    stream?: string;
    degreeLevel?: string;
    entranceExam?: string;
    hostel?: string;
    yearRange?: string;
  }): Promise<College[]>;
  getCollegesNearLocation(coordinates: { lat: number; lng: number }, radiusKm: number): Promise<College[]>;
  createCollege(college: InsertCollege): Promise<College>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private colleges: Map<string, College>;

  constructor() {
    this.users = new Map();
    this.colleges = new Map();
    this.initializeColleges();
  }

  private initializeColleges() {
    const sampleColleges: College[] = [
      {
        id: "iit-delhi",
        name: "Indian Institute of Technology Delhi",
        shortName: "IIT Delhi",
        location: {
          city: "New Delhi",
          district: "South West Delhi",
          state: "Delhi",
          address: "Hauz Khas, New Delhi, Delhi 110016",
          coordinates: { lat: 28.5458, lng: 77.1919 }
        },
        type: "Government",
        yearEstablished: 1961,
        programs: {
          undergraduate: ["B.Tech Computer Science", "B.Tech Electrical Engineering", "B.Tech Mechanical Engineering"],
          postgraduate: ["M.Tech Computer Science", "M.Tech Data Science", "M.Tech Electrical Engineering"],
          diploma: [],
          phd: ["PhD in Engineering", "PhD in Science"]
        },
        streams: ["Engineering", "Science"],
        affiliatedUniversity: "Autonomous",
        governingBody: "Ministry of Education, Government of India",
        entranceExams: ["JEE Advanced", "GATE"],
        cutoffInfo: [
          { category: "General", rank: 100, year: 2024 },
          { category: "OBC", rank: 200, year: 2024 }
        ],
        eligibilityCriteria: "JEE Advanced qualified with minimum 75% in Class XII",
        admissionProcess: "Online counseling through JoSAA",
        mediumOfInstruction: ["English"],
        facilities: {
          hostel: { boys: true, girls: true, capacity: 8000 },
          library: { capacity: 500000, digitalAccess: true, eResources: true },
          labs: true,
          research: true,
          internet: true,
          wifi: true,
          sports: true,
          specialFeatures: ["Placement Cell", "Industry Tie-ups", "Scholarships", "International Exchange"]
        },
        contact: {
          phone: "011-2659-1234",
          email: "info@iitd.ac.in",
          website: "https://www.iitd.ac.in"
        },
        isActive: true,
        createdAt: "2024-01-01T00:00:00Z"
      },
      {
        id: "du",
        name: "University of Delhi",
        shortName: "Delhi University",
        location: {
          city: "New Delhi",
          district: "North Delhi",
          state: "Delhi",
          address: "University of Delhi, Delhi 110007",
          coordinates: { lat: 28.6863, lng: 77.2217 }
        },
        type: "Central University",
        yearEstablished: 1922,
        programs: {
          undergraduate: ["BA", "BSc", "BCom", "BBA"],
          postgraduate: ["MA", "MSc", "MCom", "MBA"],
          diploma: ["Diploma in Computer Applications"],
          phd: ["PhD in Arts", "PhD in Science", "PhD in Commerce"]
        },
        streams: ["Arts", "Science", "Commerce"],
        affiliatedUniversity: "University of Delhi",
        governingBody: "University Grants Commission",
        entranceExams: ["CUET", "DU Entrance Test"],
        cutoffInfo: [
          { category: "General", marks: 95, year: 2024 },
          { category: "OBC", marks: 90, year: 2024 }
        ],
        eligibilityCriteria: "Class XII passed with required percentage",
        admissionProcess: "Online application through CUET",
        mediumOfInstruction: ["English", "Hindi"],
        facilities: {
          hostel: { boys: true, girls: true, capacity: 12000 },
          library: { capacity: 1000000, digitalAccess: true, eResources: true },
          labs: true,
          research: true,
          internet: true,
          wifi: true,
          sports: true,
          specialFeatures: ["Central Library", "Multiple Colleges", "Research Centers"]
        },
        contact: {
          phone: "011-2766-7049",
          email: "info@du.ac.in",
          website: "https://www.du.ac.in"
        },
        isActive: true,
        createdAt: "2024-01-01T00:00:00Z"
      },
      {
        id: "jamia",
        name: "Jamia Millia Islamia",
        shortName: "Jamia",
        location: {
          city: "New Delhi",
          district: "South East Delhi",
          state: "Delhi",
          address: "Jamia Nagar, New Delhi, Delhi 110025",
          coordinates: { lat: 28.5649, lng: 77.2808 }
        },
        type: "Central University",
        yearEstablished: 1920,
        programs: {
          undergraduate: ["B.Tech", "BA", "BSc", "BBA"],
          postgraduate: ["M.Tech", "MA", "MSc", "MBA"],
          diploma: ["Diploma in Engineering"],
          phd: ["PhD in Engineering", "PhD in Arts", "PhD in Science"]
        },
        streams: ["Engineering", "Arts", "Science", "Commerce"],
        affiliatedUniversity: "Jamia Millia Islamia",
        governingBody: "University Grants Commission",
        entranceExams: ["JEE Main", "CUET", "Jamia Entrance Test"],
        cutoffInfo: [
          { category: "General", marks: 85, year: 2024 },
          { category: "OBC", marks: 80, year: 2024 }
        ],
        eligibilityCriteria: "Class XII passed with minimum 50% marks",
        admissionProcess: "Entrance test followed by counseling",
        mediumOfInstruction: ["English", "Urdu"],
        facilities: {
          hostel: { boys: true, girls: true, capacity: 5000 },
          library: { capacity: 300000, digitalAccess: true, eResources: true },
          labs: true,
          research: true,
          internet: true,
          wifi: true,
          sports: true,
          specialFeatures: ["Sports Complex", "Cultural Centers", "Medical Facilities"]
        },
        contact: {
          phone: "011-2698-1717",
          email: "info@jmi.ac.in",
          website: "https://www.jmi.ac.in"
        },
        isActive: true,
        createdAt: "2024-01-01T00:00:00Z"
      }
    ];

    sampleColleges.forEach(college => {
      this.colleges.set(college.id, college);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllColleges(): Promise<College[]> {
    return Array.from(this.colleges.values()).filter(college => college.isActive);
  }

  async getCollegeById(id: string): Promise<College | undefined> {
    return this.colleges.get(id);
  }

  async searchColleges(filters: {
    location?: string;
    stream?: string;
    degreeLevel?: string;
    entranceExam?: string;
    hostel?: string;
    yearRange?: string;
  }): Promise<College[]> {
    let results = Array.from(this.colleges.values()).filter(college => college.isActive);

    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      results = results.filter(college => 
        college.location.city.toLowerCase().includes(locationLower) ||
        college.location.district.toLowerCase().includes(locationLower) ||
        college.location.state.toLowerCase().includes(locationLower)
      );
    }

    if (filters.stream) {
      results = results.filter(college => 
        college.streams?.includes(filters.stream!)
      );
    }

    if (filters.degreeLevel) {
      results = results.filter(college => {
        const programs = college.programs;
        if (!programs) return false;
        
        switch (filters.degreeLevel) {
          case "Undergraduate":
            return programs.undergraduate.length > 0;
          case "Postgraduate":
            return programs.postgraduate.length > 0;
          case "Diploma":
            return programs.diploma.length > 0;
          case "PhD":
            return programs.phd.length > 0;
          default:
            return true;
        }
      });
    }

    if (filters.entranceExam) {
      results = results.filter(college =>
        college.entranceExams?.includes(filters.entranceExam!)
      );
    }

    return results;
  }

  async getCollegesNearLocation(coordinates: { lat: number; lng: number }, radiusKm: number): Promise<College[]> {
    const colleges = Array.from(this.colleges.values()).filter(college => college.isActive);
    
    return colleges.filter(college => {
      if (!college.location.coordinates) return false;
      
      const distance = this.calculateDistance(
        coordinates.lat,
        coordinates.lng,
        college.location.coordinates.lat,
        college.location.coordinates.lng
      );
      
      return distance <= radiusKm;
    }).sort((a, b) => {
      const distanceA = this.calculateDistance(
        coordinates.lat,
        coordinates.lng,
        a.location.coordinates!.lat,
        a.location.coordinates!.lng
      );
      const distanceB = this.calculateDistance(
        coordinates.lat,
        coordinates.lng,
        b.location.coordinates!.lat,
        b.location.coordinates!.lng
      );
      return distanceA - distanceB;
    });
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  async createCollege(insertCollege: InsertCollege): Promise<College> {
    const id = randomUUID();
    const college: College = { 
      ...insertCollege, 
      id,
      isActive: true,
      createdAt: new Date().toISOString()
    } as College;
    this.colleges.set(id, college);
    return college;
  }
}

export const storage = new MemStorage();
