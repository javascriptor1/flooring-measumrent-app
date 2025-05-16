import { Room, Customer } from "@shared/schema";

export type QuoteState = {
  customer: Customer;
  rooms: Room[];
  wastagePercentage: number;
  totalRoomArea: number;
  totalSkirtingLength: number;
  totalFlooringRequired: number;
  totalSkirtingRequired: number;
};

export type QuoteSummary = {
  totalRoomArea: number;
  wastageAmount: number;
  totalFlooringRequired: number;
  totalSkirtingLength: number;
  skirtingWastageAmount: number;
  totalSkirtingRequired: number;
};
