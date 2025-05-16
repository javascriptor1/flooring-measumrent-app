import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface WastageConfigurationProps {
  wastagePercentage: number;
}

const WastageConfiguration: React.FC<WastageConfigurationProps> = ({
  wastagePercentage
}) => {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold text-secondary mb-4">Wastage Configuration</h2>
        
        <div className="flex items-center">
          <div className="px-4 py-3 bg-slate-50 rounded-md text-center">
            <span className="text-secondary">Standard Wastage Percentage:</span>
            <span className="ml-2 font-semibold text-primary text-lg">{wastagePercentage}%</span>
          </div>
          <div className="ml-4 text-sm text-gray-600">
            A fixed 5% wastage is applied to all calculations for material estimation.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WastageConfiguration;
