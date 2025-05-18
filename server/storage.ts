import { quotes, type Quote, type InsertQuote, users, type User, type InsertUser, type Room } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

import bcrypt from 'bcrypt';
// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Quote methods
  getQuote(id: number): Promise<Quote | undefined>;
  getAllQuotes(): Promise<Quote[]>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  updateQuote(id: number, updatedQuote: Partial<InsertQuote>): Promise<Quote | undefined>;
  deleteQuote(id: number): Promise<Quote | undefined>;
  getQuotesByUserId(userId: number): Promise<Quote[]>;
}

function calculateSummary(rooms: Room[], wastagePercentage: number) {
  const totalRoomArea = rooms.reduce((sum, room) => sum + room.area, 0);
  const totalSkirtingLength = rooms.reduce((sum, room) => sum + room.skirting, 0);
  const totalFlooringRequired = totalRoomArea * (1 + wastagePercentage / 100);
  const totalSkirtingRequired = totalSkirtingLength * (1 + wastagePercentage / 100);

  return {
    totalRoomArea, totalSkirtingLength, totalFlooringRequired, totalSkirtingRequired
  };
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const userToInsert = { ...insertUser, password: hashedPassword };

    const [user] = await db
      .insert(users)
      .values(userToInsert)
      .returning();
    return user;
  }
  
  async getQuote(id: number): Promise<Quote | undefined> {
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    return quote || undefined;
  }
  
  async getAllQuotes(): Promise<Quote[]> {
    return await db.select().from(quotes);
  }
  
  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const rooms: Room[] = typeof insertQuote.rooms === 'string' ? 
      JSON.parse(insertQuote.rooms) : 
      insertQuote.rooms as Room[];

    const summary = calculateSummary(rooms, insertQuote.wastagePercentage);

    // Make sure rooms is stored as a string (JSON)
    const quoteToInsert = {
      ...insertQuote,
      rooms: typeof insertQuote.rooms === 'string' ? 
        insertQuote.rooms : 
        JSON.stringify(insertQuote.rooms),
      totalRoomArea: summary.totalRoomArea,
      totalSkirtingLength: summary.totalSkirtingLength,
      totalFlooringRequired: summary.totalFlooringRequired,
      totalSkirtingRequired: summary.totalSkirtingRequired,
    };

    const [quote] = await db
      .insert(quotes)
      .values(quoteToInsert)
      .returning();
    return quote;
  }

  async updateQuote(id: number, updatedQuote: Partial<InsertQuote>): Promise<Quote | undefined> {
    // First, get the existing quote to merge with updates
    const existingQuote = await this.getQuote(id);

    if (!existingQuote) {
      return undefined;
    }

    // Merge existing data with updated data
    const mergedQuote = {
      ...existingQuote,
      ...updatedQuote,
    };

    // Parse rooms from JSONB if it's a string (should be object in existing, but good to be safe)
    const currentRooms: Room[] = typeof mergedQuote.rooms === 'string'
      ? JSON.parse(mergedQuote.rooms)
      : mergedQuote.rooms as Room[];

    // Recalculate summary based on merged data
    const summary = calculateSummary(currentRooms, mergedQuote.wastagePercentage);

    // Prepare the final update object, ensuring rooms is stringified
    const finalUpdate = {
      ...updatedQuote, // Include all provided updates
      rooms: JSON.stringify(currentRooms), // Ensure rooms is stringified JSONB
      ...summary, // Include recalculated summary fields

    const [updated] = await db
      .update(quotes) // Update the quotes table
      .set(finalUpdate) // Set the merged and calculated values
      .where(eq(quotes.id, id))
      .returning();
    return quote || undefined;
  }

  async deleteQuote(id: number): Promise<Quote | undefined> {
    const [quote] = await db
      .delete(quotes)
      .where(eq(quotes.id, id))
      .returning();
    return quote || undefined;
  }

  async getQuotesByUserId(userId: number): Promise<Quote[]> {
    return await db.select().from(quotes).where(eq(quotes.userId, userId));
  }

}

// Fallback to MemStorage if needed for development without a database
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private quotesMap: Map<number, Quote>;
  currentUserId: number;
  currentQuoteId: number;

  constructor() {
    this.users = new Map();
    this.quotesMap = new Map();
    this.currentUserId = 1;
    this.currentQuoteId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getQuote(id: number): Promise<Quote | undefined> {
    return this.quotesMap.get(id);
  }
  
  async getAllQuotes(): Promise<Quote[]> {
    return Array.from(this.quotesMap.values());
  }
  
  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const id = this.currentQuoteId++;
    const quote: Quote = { ...insertQuote, id };
    this.quotesMap.set(id, quote);
    return quote;
  }
}

// Use the DatabaseStorage as we have a database set up
export const storage = new DatabaseStorage();
