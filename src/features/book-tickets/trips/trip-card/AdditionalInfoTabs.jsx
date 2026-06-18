import React, { useState } from "react";

// Components
import { DropdownButton } from "../../../../components";

// Segments
import Amenities from "./Amenities";
import BoardingDropoffPoints from "./BoardingDropoffPoints";
import SeatAvailability from "./SeatAvailability";
import VehicleInformation from "./VehicleInformation";

const AdditionalInfoTabs = ({ busType, busModel, busRegNo, busDriverName }) => {
  const tabs = [
    { id: "vehicle", label: "Vehicle Information" },
    { id: "amenities", label: "Amenities" },
    { id: "boarding", label: "Boarding - Dropoff Points" },
    { id: "seats", label: "Seat Availability" },
  ];

  const [activeTab, setActiveTab] = useState(null);

  const handleTabClick = (tabId) => {
    setActiveTab((prevTab) => (prevTab === tabId ? null : tabId));
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
        return <BoardingDropoffPoints />;
      case "seats":
        return <SeatAvailability />;
      default:
        return null;
    }
  };

  return (
    <div className="additional-info-tabs-wrapper">
      <div className="additional-info-tabs">
        {tabs.map((tab) => (
          <DropdownButton
            key={tab.id}
            label={tab.label}
            selected={activeTab === tab.id}
            onClick={() => handleTabClick(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
          />
        ))}
      </div>
      {activeTab && (
        <div className="additional-info-tab-contents-wrapper">
          {renderContent()}
        </div>
      )}
    </div>
  );
};

export default AdditionalInfoTabs;
