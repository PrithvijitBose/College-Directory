import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

const searchFiltersSchema = z.object({
  location: z.string().optional(),
  stream: z.string().optional(),
  degreeLevel: z.string().optional(),
  entranceExam: z.string().optional(),
  hostel: z.string().optional(),
  yearRange: z.string().optional(),
});

const nearbySearchSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  radius: z.number().min(1).max(100).default(25),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all colleges
  app.get("/api/colleges", async (req, res) => {
    try {
      const colleges = await storage.getAllColleges();
      res.json(colleges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch colleges" });
    }
  });

  // Get college by ID
  app.get("/api/colleges/:id", async (req, res) => {
    try {
      const college = await storage.getCollegeById(req.params.id);
      if (!college) {
        return res.status(404).json({ message: "College not found" });
      }
      res.json(college);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch college" });
    }
  });

  // Search colleges with filters
  app.post("/api/colleges/search", async (req, res) => {
    try {
      const filters = searchFiltersSchema.parse(req.body);
      const colleges = await storage.searchColleges(filters);
      res.json({
        colleges,
        count: colleges.length,
        filters: filters
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid search filters", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to search colleges" });
    }
  });

  // Find colleges near location
  app.post("/api/colleges/nearby", async (req, res) => {
    try {
      const { lat, lng, radius } = nearbySearchSchema.parse(req.body);
      const colleges = await storage.getCollegesNearLocation({ lat, lng }, radius);
      
      // Add distance to each college
      const collegesWithDistance = colleges.map(college => ({
        ...college,
        distance: storage["calculateDistance"](lat, lng, college.location.coordinates!.lat, college.location.coordinates!.lng)
      }));

      res.json({
        colleges: collegesWithDistance,
        count: collegesWithDistance.length,
        searchCenter: { lat, lng },
        radius
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid location parameters", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to find nearby colleges" });
    }
  });

  // Geocode location (convert address to coordinates)
  app.post("/api/geocode", async (req, res) => {
    try {
      const { address } = req.body;
      if (!address) {
        return res.status(400).json({ message: "Address is required" });
      }

      // Simple mock geocoding for common Indian cities
      const mockCoordinates: Record<string, { lat: number; lng: number }> = {
        "delhi": { lat: 28.6139, lng: 77.2090 },
        "mumbai": { lat: 19.0760, lng: 72.8777 },
        "bangalore": { lat: 12.9716, lng: 77.5946 },
        "chennai": { lat: 13.0827, lng: 80.2707 },
        "kolkata": { lat: 22.5726, lng: 88.3639 },
        "pune": { lat: 18.5204, lng: 73.8567 },
        "hyderabad": { lat: 17.3850, lng: 78.4867 },
      };

      const normalizedAddress = address.toLowerCase().trim();
      const coordinates = mockCoordinates[normalizedAddress] || mockCoordinates["delhi"];

      res.json({
        address,
        coordinates,
        formatted_address: address
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to geocode address" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
