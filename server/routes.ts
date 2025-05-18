import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertQuoteSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { User, InsertUser } from '@shared/schema';
import { NotFoundError, AuthenticationError, AuthorizationError } from './errors';
import bcrypt, { genSalt } from 'bcrypt';
import ExcelJS from 'exceljs';
import jwt from 'jsonwebtoken';
import PdfPrinter from 'pdfmake';

const updateQuoteSchema = insertQuoteSchema.partial();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Replace with a strong secret in production
export async function registerRoutes(app: Express): Promise<Server> {

  // Extend the Request type to include the user property
  interface AuthenticatedRequest extends Request {
    user?: User;
  }

  // JWT authentication middleware
  const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: () => void) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer TOKEN"

    if (token == null) {
      return next(new AuthenticationError('No token provided')); // Use next to pass error to middleware
    }

    jwt.verify(token, JWT_SECRET, async (err: any, payload: any) => {
      if (err) {
        throw new AuthenticationError('Invalid token');
      }

      // Token is valid, fetch the user
      const user = await storage.getUser(payload.userId);
      if (!user) {
        return next(new NotFoundError('User not found')); // Use next to pass error to middleware
      }
      req.user = user; // Attach user to the request object
      next(); // Proceed to the next middleware or route handler
    });
  };
  // API routes for quotes
  app.get("/api/quotes", authenticateToken, async (req: Request, res: Response) => {
    try {
      // Retrieve only quotes belonging to the authenticated user
      const quotes = await storage.getAllQuotes((req as AuthenticatedRequest).user!.id);
      res.json(quotes);
    } catch (error) {
      next(error); // Pass error to centralized error handler
    }
  });

  app.get("/api/quotes/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const quoteId = parseInt(req.params.id);
      const quote = await storage.getQuote(quoteId);
      if (!quote) {
        throw new NotFoundError("Quote not found");
      }
      
      if (quote.userId !== (req as AuthenticatedRequest).user!.id) {
        throw new AuthorizationError('You are not authorized to access this quote.');
      }
      res.json(quote);
    } catch (error) {
      next(error); // Pass error to centralized error handler
    }
  });

  app.post("/api/quotes", authenticateToken, async (req: Request, res: Response) => {
    try {
      const quoteData = insertQuoteSchema.parse(req.body);
      // Set the userId to the authenticated user's ID
      quoteData.userId = (req as AuthenticatedRequest).user!.id;
      const newQuote = await storage.createQuote(quoteData);
      // Assuming the storage function returns the created quote with ID
      res.status(201).json(newQuote);
    } catch (error) {
      next(error); // Pass error to centralized error handler
    }
  });

  app.put("/api/quotes/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const quoteId = parseInt(req.params.id);
      const existingQuote = await storage.getQuote(quoteId);
      if (!existingQuote) {
        throw new NotFoundError("Quote not found");
      }
      if (existingQuote.userId !== (req as AuthenticatedRequest).user!.id) {
        throw new AuthorizationError('You are not authorized to update this quote.');
      }
      const quoteData = updateQuoteSchema.parse(req.body);
      
      const updatedQuote = await storage.updateQuote(quoteId, quoteData);
      res.json(updatedQuote);
    } catch (error) {
      next(error); // Pass error to centralized error handler
    }
  });

  app.delete("/api/quotes/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const quoteId = parseInt(req.params.id);
      // Optional: Add authorization check before deleting
      const existingQuote = await storage.getQuote(quoteId);
      if (!existingQuote) {
        throw new NotFoundError("Quote not found");
      }
      if (existingQuote.userId !== (req as AuthenticatedRequest).user!.id) {
        throw new AuthorizationError('You are not authorized to delete this quote.');
      }
      const deletedQuote = await storage.deleteQuote(quoteId);
      // Respond with a success message or the deleted quote if needed
      res.json({ message: 'Quote deleted successfully', deletedQuote });
    } catch (error) {
 throw error; // Pass error to centralized error handler
    }
  });

  app.get("/api/quotes/:id/export/excel", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const quoteId = parseInt(req.params.id);
      const quote = await storage.getQuote(quoteId);

      if (!quote) {
        throw new NotFoundError("Quote not found");
      }

      if (quote.userId !== req.user!.id) {
        throw new AuthorizationError('You are not authorized to access this quote.');
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(`Quote ${quote.id}`);

      // Add Customer Information
      worksheet.addRow(['Customer Information']);
      worksheet.addRow(['Name', quote.customerName]);
      worksheet.addRow(['Phone', quote.customerPhone]);
      worksheet.addRow(['Email', quote.customerEmail]);
      worksheet.addRow(['Address', quote.customerAddress]);
      worksheet.addRow([]); // Empty row for spacing

      // Add Measurements
      worksheet.addRow(['Measurements']);
      worksheet.addRow(['Room', 'Length', 'Width', 'Area', 'Comment']);
      if (quote.rooms && Array.isArray(quote.rooms)) {
        quote.rooms.forEach(room => {
          worksheet.addRow([room.name, room.length, room.width, room.area, room.comment]);
        });
      }
      worksheet.addRow([]); // Empty row for spacing

      // Add Summary
      worksheet.addRow(['Summary']);
      worksheet.addRow(['Total Area', quote.totalArea]);
      worksheet.addRow(['Wastage Percentage', quote.wastagePercentage]);
      worksheet.addRow(['Wastage Area', quote.wastageArea]);
      worksheet.addRow(['Total Required Area', quote.totalRequiredArea]);
      worksheet.addRow(['Price per Unit', quote.pricePerUnit]);
      worksheet.addRow(['Total Price', quote.totalPrice]);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=quote_${quote.id}.xlsx`);

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/quotes/:id/export/pdf", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const quoteId = parseInt(req.params.id);
      const quote = await storage.getQuote(quoteId);

      if (!quote) {
        throw new NotFoundError("Quote not found");
      }

      if (quote.userId !== req.user!.id) {
        throw new AuthorizationError('You are not authorized to access this quote.');
      }

      // Define the PDF document definition
      const documentDefinition: any = {
        content: [
          { text: 'Quote Details', style: 'header' },
          { text: `Quote ID: ${quote.id}`, style: 'subheader' },
          { text: '\nCustomer Information', style: 'subheader' },
          `Name: ${quote.customerName}`,
          `Phone: ${quote.customerPhone}`,
          `Email: ${quote.customerEmail}`,
          `Address: ${quote.customerAddress}`,
          { text: '\nMeasurements', style: 'subheader' },
          {
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto', 'auto', '*'],
              body: [
                ['Room', 'Length', 'Width', 'Area', 'Comment'],
                ...(quote.rooms && Array.isArray(quote.rooms) ? quote.rooms.map(room => [
                  room.name,
                  room.length,
                  room.width,
                  room.area,
                  room.comment
                ]) : [])
              ]
            }
          },
          { text: '\nSummary', style: 'subheader' },
          `Total Area: ${quote.totalArea}`,
          `Wastage Percentage: ${quote.wastagePercentage}%`,
          `Wastage Area: ${quote.wastageArea}`,
          `Total Required Area: ${quote.totalRequiredArea}`,
          `Price per Unit: ${quote.pricePerUnit}`,
          `Total Price: ${quote.totalPrice}`,
        ],
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            margin: [0, 0, 0, 10]
          },
          subheader: {
            fontSize: 14,
            bold: true,
            margin: [0, 10, 0, 5]
          }
        }
      };
      const printer = new PdfPrinter({
        // Add a default font or configure fonts properly in a real application
        Roboto: {
          normal: Buffer.from(require('pdfmake/build/vfs_fonts.js').pdfMake.vfs['Roboto-Regular.ttf'], 'base64'),
          bold: Buffer.from(require('pdfmake/build/vfs_fonts.js').pdfMake.vfs['Roboto-Medium.ttf'], 'base64')
        }
      });
      const pdfDoc = printer.createPdfKitDocument(documentDefinition);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=quote_${quote.id}.pdf`);
      pdfDoc.pipe(res);
      pdfDoc.end();
    } catch (error) {
      next(error);
    }
  });

  // API route for user login
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username) as User; // Cast to User type
      if (!user) {
        throw new AuthenticationError('Invalid credentials');
      }
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        throw new AuthenticationError('Invalid credentials');
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
      res.json({ token });
    } catch (error) {
      console.error("Error during login:", error);
      next(error); // Pass error to centralized error handler
    }
  });

  // Centralized error handling middleware
  app.use((err: any, req: Request, res: Response, next: () => void) => {
    console.error("Centralized Error Handler:", err); // Log the error

    if (err instanceof ZodError) {
      const validationError = fromZodError(err);
      return res.status(400).json({
        message: "Validation error",
        errors: validationError.details,
      });
    }

    // Handle custom errors with status codes
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    res.status(500).json({ message: "An unexpected error occurred." }); // Generic message for unhandled errors
  });

  const httpServer = createServer(app);
  return httpServer;
}
