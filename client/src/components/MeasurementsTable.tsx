import React from 'react';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash, Plus } from "lucide-react";
import { Room } from "@shared/schema";

interface MeasurementsTableProps {
  rooms: Room[];
  updateRoom: (roomId: string, field: keyof Room, value: string | number) => void;
  addRoom: () => void;
  removeRoom: (roomId: string) => void;
}

const ROOM_TYPES = [
  { value: "select", label: "Select room" },
  { value: "living", label: "Living Room" },
  { value: "bedroom", label: "Bedroom" },
  { value: "kitchen", label: "Kitchen" },
  { value: "bathroom", label: "Bathroom" },
  { value: "hallway", label: "Hallway" },
  { value: "other", label: "Other" }
];

const MeasurementsTable: React.FC<MeasurementsTableProps> = ({
  rooms,
  updateRoom,
  addRoom,
  removeRoom
}) => {
  const handleNumberInput = (
    roomId: string, 
    field: keyof Room, 
    value: string
  ) => {
    // Handle empty input or convert to number
    const numValue = value === '' ? 0 : parseFloat(value);
    
    // Validate that it's a positive number
    if (!isNaN(numValue) && numValue >= 0) {
      updateRoom(roomId, field, numValue);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6 overflow-x-auto">
      <h2 className="text-lg font-semibold text-secondary mb-4">Room Measurements</h2>
      
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="font-medium text-sm text-secondary">
              <div className="flex flex-col">
                <span className="font-bold" style={{ color: '#2e2621' }}>Room Type</span>
                <span className="text-xs text-gray-500">Select room category</span>
              </div>
            </TableHead>
            <TableHead className="font-medium text-sm text-secondary text-center">
              <div className="flex flex-col items-center">
                <span className="font-bold" style={{ color: '#2e2621' }}>Length (m)</span>
                <span className="text-xs text-gray-500">Room length</span>
              </div>
            </TableHead>
            <TableHead className="font-medium text-sm text-secondary text-center">
              <div className="flex flex-col items-center">
                <span className="font-bold" style={{ color: '#2e2621' }}>Width (m)</span>
                <span className="text-xs text-gray-500">Room width</span>
              </div>
            </TableHead>
            <TableHead className="font-medium text-sm text-secondary text-center">
              <div className="flex flex-col items-center">
                <span className="font-bold" style={{ color: '#2e2621' }}>Door Area (m²)</span>
                <span className="text-xs text-gray-500">Area to subtract</span>
              </div>
            </TableHead>
            <TableHead className="font-medium text-sm text-secondary text-center">
              <div className="flex flex-col items-center">
                <span className="font-bold" style={{ color: '#2e2621' }}>Room Area (m²)</span>
                <span className="text-xs text-gray-500">Calculated total</span>
              </div>
            </TableHead>
            <TableHead className="font-medium text-sm text-secondary text-center">
              <div className="flex flex-col items-center">
                <span className="font-bold" style={{ color: '#2e2621' }}>Skirting (m)</span>
                <span className="text-xs text-gray-500">Perimeter length</span>
              </div>
            </TableHead>
            <TableHead className="font-medium text-sm text-secondary text-center">
              <div className="flex flex-col items-center">
                <span className="font-bold" style={{ color: '#2e2621' }}>Actions</span>
                <span className="text-xs text-gray-500">Remove row</span>
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        
        <TableBody>
          {rooms.map((room) => (
            <TableRow key={room.id} className="border-b">
              <TableCell className="p-2">
                <Select
                  value={room.type}
                  onValueChange={(value) => updateRoom(room.id, 'type', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROOM_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              
              <TableCell className="p-2">
                <Input
                  className="text-center measurement-input"
                  type="number"
                  step="0.01"
                  min="0"
                  value={room.length || ''}
                  onChange={(e) => handleNumberInput(room.id, 'length', e.target.value)}
                  placeholder="0.00"
                />
              </TableCell>
              
              <TableCell className="p-2">
                <Input
                  className="text-center measurement-input"
                  type="number"
                  step="0.01"
                  min="0"
                  value={room.width || ''}
                  onChange={(e) => handleNumberInput(room.id, 'width', e.target.value)}
                  placeholder="0.00"
                />
              </TableCell>
              
              <TableCell className="p-2">
                <Input
                  className="text-center measurement-input"
                  type="number"
                  step="0.01"
                  min="0"
                  value={room.doorArea || ''}
                  onChange={(e) => handleNumberInput(room.id, 'doorArea', e.target.value)}
                  placeholder="0.00"
                />
              </TableCell>
              
              <TableCell className="p-2">
                <div className="w-full p-2 bg-slate-50 rounded-md text-sm font-medium text-center">
                  {room.area.toFixed(2)}
                </div>
              </TableCell>
              
              <TableCell className="p-2">
                <div className="w-full p-2 bg-slate-50 rounded-md text-sm font-medium text-center">
                  {room.skirting.toFixed(2)}
                </div>
              </TableCell>
              
              <TableCell className="p-2 text-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => removeRoom(room.id)}
                  disabled={rooms.length <= 1}
                >
                  <Trash size={18} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          
          <TableRow>
            <TableCell colSpan={7} className="p-2">
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center"
                onClick={addRoom}
              >
                <Plus size={16} className="mr-2" /> Add Room
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default MeasurementsTable;
