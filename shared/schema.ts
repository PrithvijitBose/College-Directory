import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const colleges = pgTable("colleges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  shortName: text("short_name"),
  location: jsonb("location").$type<{
    city: string;
    district: string;
    state: string;
    address: string;
    coordinates?: { lat: number; lng: number };
  }>().notNull(),
  type: text("type").notNull(), // Government, Semi-Government, Autonomous, Central University
  yearEstablished: integer("year_established"),
  
  // Academic Information
  programs: jsonb("programs").$type<{
    undergraduate: string[];
    postgraduate: string[];
    diploma: string[];
    phd: string[];
  }>(),
  streams: text("streams").array(), // Engineering, Arts, Science, Commerce, Medicine, Law
  affiliatedUniversity: text("affiliated_university"),
  governingBody: text("governing_body"),
  
  // Admission Details
  entranceExams: text("entrance_exams").array(), // JEE, NEET, CUET, State Exams
  cutoffInfo: jsonb("cutoff_info").$type<{
    category: string;
    marks?: number;
    rank?: number;
    year: number;
  }[]>(),
  eligibilityCriteria: text("eligibility_criteria"),
  admissionProcess: text("admission_process"),
  
  // Medium and Languages
  mediumOfInstruction: text("medium_of_instruction").array(),
  
  // Facilities
  facilities: jsonb("facilities").$type<{
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
  }>(),
  
  // Contact Information
  contact: jsonb("contact").$type<{
    phone?: string;
    email?: string;
    website?: string;
  }>(),
  
  // Additional metadata
  isActive: boolean("is_active").default(true),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertCollegeSchema = createInsertSchema(colleges).omit({
  id: true,
  createdAt: true,
});

export type College = typeof colleges.$inferSelect;
export type InsertCollege = z.infer<typeof insertCollegeSchema>;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
