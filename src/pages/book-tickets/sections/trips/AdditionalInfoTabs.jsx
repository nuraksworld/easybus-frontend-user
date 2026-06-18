// src/pages/book-tickets/sections/trips/AdditionalInfoTabs.jsx
import React, { useMemo, useState } from "react";

// Components
import { DropdownButton } from "../../../../components";

// Segments
import Amenities from "./Amenities";
import BoardingDropoffPoints from "./BoardingDropoffPoints";
import SeatAvailability from "./SeatAvailability";
import VehicleInformation from "./VehicleInformation";

/**
 * Props you can pass in from the trip card:
 * - busType, busModel, busRegNo, busDriverName (strings)
 * - seats (number), available (number), lockedSeats (array)
 * - origin, destination (strings)
 * - stops (array of boarding/dropoff points)  <-- optional
 */
const AdditionalInfoTabs = ({
  busType,
  busModel,
  busRegNo,
  busDriverName,
  seats,
  available,
  lockedSeats,
  origin,
  destination,
  stops,
}) => {
  const tabs = useMemo(
    () => [
      { id: "vehicle", label: "Vehicle Information" },
      { id: "amenities", label: "Amenities" },
      { id: "boarding", label: "Boarding - Dropoff Points" },
      { id: "seats", label: "Seat Availability" },
    ],
    []
  );

  // Open the first tab by default so users always see content
  const [activeTab, setActiveTab] = useState("vehicle");

  const handleTabClick = (tabId) => {
    // toggle open/close when clicking the same tab
    setActiveTab((prev) => (prev === tabId ? null : tabId));
  };

  const handleKeyDown = (e, tabId) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleTabClick(tabId);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "vehicle":
        return (
          <VehicleInformation
            busType={busType}
            busModel={busModel}
            busRegNo={busRegNo}
            busDriverName={busDriverName}
          />
        );
      case "amenities":
        return <Amenities />;
      case "boarding":
        return (
          <BoardingDropoffPoints
            origin={origin}
            destination={destination}
            stops={stops || []}
          />
        );
      case "seats":
        return (
          <SeatAvailability
            seats={Number(seats) || 0}
            available={Number(available) || 0}
            lockedSeats={lockedSeats || []}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="additional-info-tabs-wrapper">
      <div className="additional-info-tabs" role="tablist" aria-label="Additional trip information">
        {tabs.map((tab) => {
          const selected = activeTab === tab.id;
          return (
            <DropdownButton
              key={tab.id}
              label={tab.label}
              selected={selected}
              onClick={() => handleTabClick(tab.id)}
              // accessibility + defensive defaults
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              type="button"                 // IMPORTANT: avoid form submit side-effects
              onKeyDown={(e) => handleKeyDown(e, tab.id)}
              tabIndex={0}
            />
          );
        })}
      </div>

      <div
        id={activeTab ? `panel-${activeTab}` : undefined}
        role="tabpanel"
        aria-labelledby={activeTab ? `tab-${activeTab}` : undefined}
        className="additional-info-tab-contents-wrapper"
      >
        {activeTab ? renderContent() : null}
      </div>
    </div>
  );
};

export default AdditionalInfoTabs;
