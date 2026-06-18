import React from "react";
import { SeatLegends } from "../../../../components";
import SeatLayout from "../../../../components/data-display/info-display/SeatLayout";

const SeatAvailability = () => {
  return (
    <div className="seat-availability-container">
      <SeatLayout totalSeats={47} />
      <SeatLegends />
    </div>
  );
};

export default SeatAvailability;
