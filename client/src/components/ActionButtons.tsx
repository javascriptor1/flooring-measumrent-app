import React from 'react';
import { Button } from "@/components/ui/button";
import { Printer, RotateCw, Save } from "lucide-react";

interface ActionButtonsProps {
  resetForm: () => void;
  printQuote: () => void;
  saveQuote: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  resetForm,
  saveQuote,
  printQuote
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-end gap-3 mb-8">
      <Button 
        variant="outline" 
        className="border-[#5b4c43] text-[#5b4c43] hover:bg-[#f5f2f0]"
        onClick={resetForm}
      >
        <RotateCw className="mr-2 h-4 w-4" /> Reset Form
      </Button>
      
      <Button
        variant="secondary"
        className="bg-gray-200 hover:bg-gray-300 text-gray-800" // Adjust classes as needed for your theme
        onClick={saveQuote}
      >
        <Save className="mr-2 h-4 w-4" /> Save
      </Button>
      <Button
        className="bg-[#5b4c43] hover:bg-[#4a3e38] text-white"
        onClick={printQuote}
      >
        <Printer className="mr-2 h-4 w-4" /> Print Quote
      </Button>
    </div>
  );
};

export default ActionButtons;
