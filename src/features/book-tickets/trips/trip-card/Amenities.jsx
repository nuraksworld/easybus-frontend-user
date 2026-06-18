import React from "react";
import { AvailabilityBlock } from "../../../../components";

const Amenities = () => {
  return (
    <div className="amenities-container">
      <AvailabilityBlock value="Air Condition" availability="available" />
      <AvailabilityBlock value="Large Windows" availability="available" />
      <AvailabilityBlock value="Adjustable Seats" availability="available" />
      <AvailabilityBlock value="Footrest Seats" availability="unavailable" />
      <AvailabilityBlock value="Free WiFi" availability="available" />
      <AvailabilityBlock value="TV" availability="available" />
      <AvailabilityBlock value="Power Outlets" availability="available" />
      <AvailabilityBlock
        value="Entertainment System"
        availability="available"
      />
      <AvailabilityBlock value="Luggage Storage" availability="available" />
      <AvailabilityBlock
        value="Wheelchair Accesibility"
        availability="unavailable"
      />
    </div>
  );
};

export default Amenities;
