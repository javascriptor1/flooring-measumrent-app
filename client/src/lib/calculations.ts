import { Room } from "@shared/schema";
import { QuoteSummary } from "@/types";

// Calculate area for a single room
export const calculateRoomArea = (room: Room): Room => {
  const length = room.length || 0;
  const width = room.width || 0;
  const doorArea = room.doorArea || 0;

  // Calculate room area (length × width - door area)
  const area = Math.max(0, (length * width) - doorArea);
  
  // Calculate skirting length (perimeter = 2 × (length + width))
  const skirting = length > 0 && width > 0 ? 2 * (length + width) : 0;

  return {
    ...room,
    area: Number(area.toFixed(2)),
    skirting: Number(skirting.toFixed(2))
  };
};

// Calculate summary for all rooms
export const calculateSummary = (rooms: Room[], wastagePercentage: number): QuoteSummary => {
  const totalRoomArea = Number(rooms.reduce((sum, room) => sum + room.area, 0).toFixed(2));
  const totalSkirtingLength = Number(rooms.reduce((sum, room) => sum + room.skirting, 0).toFixed(2));
  
  // Calculate wastage amounts
  const wastageAmount = Number((totalRoomArea * (wastagePercentage / 100)).toFixed(2));
  const skirtingWastageAmount = Number((totalSkirtingLength * (wastagePercentage / 100)).toFixed(2));
  
  // Calculate totals with wastage
  const totalFlooringRequired = Number((totalRoomArea + wastageAmount).toFixed(2));
  const totalSkirtingRequired = Number((totalSkirtingLength + skirtingWastageAmount).toFixed(2));
  
  return {
    totalRoomArea,
    wastageAmount,
    totalFlooringRequired,
    totalSkirtingLength,
    skirtingWastageAmount,
    totalSkirtingRequired
  };
};
