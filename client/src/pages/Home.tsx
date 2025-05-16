import React from "react";
import CustomerInformation from "@/components/CustomerInformation";
import MeasurementsTable from "@/components/MeasurementsTable";
import WastageConfiguration from "@/components/WastageConfiguration";
import SummarySection from "@/components/SummarySection";
import ActionButtons from "@/components/ActionButtons";
import { useQuote } from "@/hooks/useQuote";

const Home: React.FC = () => {
  const {
    quoteState,
    getSummary,
    updateCustomer,
    updateRoom,
    addRoom,
    removeRoom,
    resetForm,
    saveQuote,
    printQuote,
  } = useQuote();

  const summary = getSummary();

  return (
    <div className="min-h-screen p-4 md:p-6 bg-slate-100">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "#5b4c43" }}>
                Magic Flooring Area Calculator
              </h1>
              <p className="text-secondary">
                Create precise flooring quotes for your customers
              </p>
            </div>
            <div>
              {/* Company logo */}
              <div className="w-20 h-20 p-1 rounded-full overflow-hidden">
                <img
                  src="https://magic-flooring.me/img/mflogo.svg"
                  alt="Magic Flooring Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Customer Information Form */}
        <CustomerInformation
          customer={quoteState.customer}
          updateCustomer={updateCustomer}
        />

        {/* Room Measurements Table */}
        <MeasurementsTable
          rooms={quoteState.rooms}
          updateRoom={updateRoom}
          addRoom={addRoom}
          removeRoom={removeRoom}
        />

        {/* Wastage configuration removed as requested */}

        {/* Summary Section */}
        <SummarySection
          summary={summary}
          wastagePercentage={quoteState.wastagePercentage}
        />

        {/* Action Buttons */}
        <ActionButtons resetForm={resetForm} printQuote={printQuote} />
      </div>
    </div>
  );
};

export default Home;
