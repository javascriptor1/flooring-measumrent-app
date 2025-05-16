import { useState, useCallback } from "react";
import { calculateRoomArea, calculateSummary } from "@/lib/calculations";
import { Customer, Room } from "@shared/schema";
import { v4 as uuidv4 } from "uuid";
import { QuoteState, QuoteSummary } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_CUSTOMER: Customer = {
  name: "",
  mobile: "",
  address: "",
  notes: ""
};

const DEFAULT_ROOM: Room = {
  id: "",
  type: "select",
  length: 0,
  width: 0,
  doorArea: 0,
  area: 0,
  skirting: 0
};

// Create empty rooms
const createInitialRooms = (): Room[] => {
  return Array.from({ length: 5 }, () => ({
    ...DEFAULT_ROOM,
    id: uuidv4()
  }));
};

export const useQuote = () => {
  const { toast } = useToast();
  const [quoteState, setQuoteState] = useState<QuoteState>({
    customer: DEFAULT_CUSTOMER,
    rooms: createInitialRooms(),
    wastagePercentage: 5, // Fixed at 5%
    totalRoomArea: 0,
    totalSkirtingLength: 0,
    totalFlooringRequired: 0,
    totalSkirtingRequired: 0
  });

  // Calculate summary values
  const getSummary = useCallback((): QuoteSummary => {
    return calculateSummary(quoteState.rooms, quoteState.wastagePercentage);
  }, [quoteState.rooms, quoteState.wastagePercentage]);

  // Update customer information
  const updateCustomer = useCallback((field: keyof Customer, value: string) => {
    setQuoteState(prev => ({
      ...prev,
      customer: {
        ...prev.customer,
        [field]: value
      }
    }));
  }, []);

  // Update a room's measurements
  const updateRoom = useCallback((roomId: string, field: keyof Room, value: string | number) => {
    setQuoteState(prev => {
      const updatedRooms = prev.rooms.map(room => {
        if (room.id === roomId) {
          // Create updated room data
          const updatedRoom = {
            ...room,
            [field]: typeof value === 'string' ? value : Number(value)
          };
          
          // Recalculate area and skirting if measurements changed
          if (field === 'length' || field === 'width' || field === 'doorArea') {
            return calculateRoomArea(updatedRoom);
          }
          
          return updatedRoom;
        }
        return room;
      });
      
      // Recalculate summary values
      const summary = calculateSummary(updatedRooms, prev.wastagePercentage);
      
      return {
        ...prev,
        rooms: updatedRooms,
        totalRoomArea: summary.totalRoomArea,
        totalSkirtingLength: summary.totalSkirtingLength,
        totalFlooringRequired: summary.totalFlooringRequired,
        totalSkirtingRequired: summary.totalSkirtingRequired
      };
    });
  }, []);

  // Add a new empty room
  const addRoom = useCallback(() => {
    setQuoteState(prev => {
      const newRoom = {
        ...DEFAULT_ROOM,
        id: uuidv4()
      };
      
      return {
        ...prev,
        rooms: [...prev.rooms, newRoom]
      };
    });
  }, []);

  // Remove a room
  const removeRoom = useCallback((roomId: string) => {
    setQuoteState(prev => {
      // Don't remove if it's the last room
      if (prev.rooms.length <= 1) return prev;
      
      const updatedRooms = prev.rooms.filter(room => room.id !== roomId);
      
      // Recalculate summary values
      const summary = calculateSummary(updatedRooms, prev.wastagePercentage);
      
      return {
        ...prev,
        rooms: updatedRooms,
        totalRoomArea: summary.totalRoomArea,
        totalSkirtingLength: summary.totalSkirtingLength,
        totalFlooringRequired: summary.totalFlooringRequired,
        totalSkirtingRequired: summary.totalSkirtingRequired
      };
    });
  }, []);

  // Wastage percentage is now fixed at 5%

  // Reset the entire form
  const resetForm = useCallback(() => {
    if (window.confirm('Are you sure you want to reset the form? All data will be lost.')) {
      setQuoteState({
        customer: DEFAULT_CUSTOMER,
        rooms: createInitialRooms(),
        wastagePercentage: 5,
        totalRoomArea: 0,
        totalSkirtingLength: 0,
        totalFlooringRequired: 0,
        totalSkirtingRequired: 0
      });
    }
  }, []);

  // Save the quote
  const saveQuote = useCallback(async () => {
    try {
      // Validate customer info
      if (!quoteState.customer.name || !quoteState.customer.mobile) {
        toast({
          title: "Missing Information",
          description: "Please provide customer name and mobile number.",
          variant: "destructive"
        });
        return;
      }

      // Prepare quote data
      const summary = getSummary();
      const quoteData = {
        customerName: quoteState.customer.name,
        customerMobile: quoteState.customer.mobile,
        customerAddress: quoteState.customer.address || "",
        customerNotes: quoteState.customer.notes || "",
        rooms: JSON.stringify(quoteState.rooms),
        wastagePercentage: quoteState.wastagePercentage,
        totalRoomArea: summary.totalRoomArea,
        totalSkirtingLength: summary.totalSkirtingLength,
        totalFlooringRequired: summary.totalFlooringRequired,
        totalSkirtingRequired: summary.totalSkirtingRequired,
        createdAt: new Date().toISOString()
      };

      // Send to API
      await apiRequest("POST", "/api/quotes", quoteData);
      
      toast({
        title: "Success",
        description: "Quote saved successfully!",
      });
    } catch (error) {
      console.error("Error saving quote:", error);
      
      toast({
        title: "Error",
        description: "Failed to save quote. Please try again.",
        variant: "destructive"
      });
    }
  }, [quoteState, getSummary, toast]);

  // Print the quote
  const printQuote = useCallback(() => {
    window.print();
  }, []);

  return {
    quoteState,
    getSummary,
    updateCustomer,
    updateRoom,
    addRoom,
    removeRoom,
    resetForm,
    saveQuote,
    printQuote
  };
};
