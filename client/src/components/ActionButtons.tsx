import React from 'react';
import { Button } from "@/components/ui/button";
import { Printer, RotateCw } from "lucide-react";

interface ActionButtonsProps {
  resetForm: () => void;
  printQuote: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  resetForm,
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
        className="bg-[#5b4c43] hover:bg-[#4a3e38] text-white"
        onClick={printQuote}
      >
        <Printer className="mr-2 h-4 w-4" /> Print Quote
      </Button>
    </div>
  );
};

export default ActionButtons;
