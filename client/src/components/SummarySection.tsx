import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { QuoteSummary } from "@/types";

interface SummarySectionProps {
  summary: QuoteSummary;
  wastagePercentage: number;
}

const SummarySection: React.FC<SummarySectionProps> = ({ 
  summary, 
  wastagePercentage 
}) => {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold text-secondary mb-4">Summary</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-slate-50 p-4 rounded-md">
            <h3 className="text-md font-medium text-secondary mb-2">Flooring Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Room Area:</span>
                <span className="text-sm font-medium">
                  {summary.totalRoomArea.toFixed(2)} m²
                </span>
              </div>
              <div className="flex justify-between bg-blue-50 p-1 rounded">
                <span className="text-sm text-blue-700">
                  Wastage Amount (Standard 5%):
                </span>
                <span className="text-sm font-medium text-blue-700">
                  {summary.wastageAmount.toFixed(2)} m²
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-sm font-medium text-gray-700">
                  Total Flooring Required:
                </span>
                <span className="text-sm font-semibold text-primary">
                  {summary.totalFlooringRequired.toFixed(2)} m²
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-md">
            <h3 className="text-md font-medium text-secondary mb-2">Skirting Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Skirting Length:</span>
                <span className="text-sm font-medium">
                  {summary.totalSkirtingLength.toFixed(2)} m
                </span>
              </div>
              <div className="flex justify-between bg-blue-50 p-1 rounded">
                <span className="text-sm text-blue-700">
                  Wastage Amount (Standard 5%):
                </span>
                <span className="text-sm font-medium text-blue-700">
                  {summary.skirtingWastageAmount.toFixed(2)} m
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-sm font-medium text-gray-700">
                  Total Skirting Required:
                </span>
                <span className="text-sm font-semibold text-primary">
                  {summary.totalSkirtingRequired.toFixed(2)} m
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SummarySection;
