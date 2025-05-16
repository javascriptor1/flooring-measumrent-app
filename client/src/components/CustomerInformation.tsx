import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Customer } from '@shared/schema';

interface CustomerInformationProps {
  customer: Customer;
  updateCustomer: (field: keyof Customer, value: string) => void;
}

const CustomerInformation: React.FC<CustomerInformationProps> = ({ 
  customer, 
  updateCustomer 
}) => {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold text-secondary mb-4 pb-2 border-b">Customer Information</h2>
        
        <div className="grid grid-cols-1 gap-4">
          {/* Name and Mobile in same row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerName" className="mb-1">Customer Name*</Label>
              <Input
                id="customerName"
                name="customerName"
                value={customer.name}
                onChange={(e) => updateCustomer('name', e.target.value)}
                placeholder="Enter customer name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="customerMobile" className="mb-1">Mobile Number*</Label>
              <Input
                id="customerMobile"
                name="customerMobile"
                type="tel"
                value={customer.mobile}
                onChange={(e) => updateCustomer('mobile', e.target.value)}
                placeholder="Enter mobile number"
                required
              />
            </div>
          </div>
          
          {/* Address and Notes in same row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerAddress" className="mb-1">Address</Label>
              <Textarea
                id="customerAddress"
                name="customerAddress"
                rows={1}
                value={customer.address || ''}
                onChange={(e) => updateCustomer('address', e.target.value)}
                placeholder="Enter customer address"
                className="min-h-[40px]"
              />
            </div>
            
            <div>
              <Label htmlFor="customerNotes" className="mb-1">Notes</Label>
              <Textarea
                id="customerNotes"
                name="customerNotes"
                rows={1}
                value={customer.notes || ''}
                onChange={(e) => updateCustomer('notes', e.target.value)}
                placeholder="Any special requirements or notes"
                className="min-h-[40px]"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerInformation;
