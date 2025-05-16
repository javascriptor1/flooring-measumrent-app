import { quotes, type Quote, type InsertQuote, users, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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
    const [user] = await db
      .insert(users)
      .values(insertUser)
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
    // Make sure rooms is stored as a string (JSON)
    const quoteToInsert = {
      ...insertQuote,
      rooms: typeof insertQuote.rooms === 'string' ? 
        insertQuote.rooms : 
        JSON.stringify(insertQuote.rooms)
    };

    const [quote] = await db
      .insert(quotes)
      .values(quoteToInsert)
      .returning();
    return quote;
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
