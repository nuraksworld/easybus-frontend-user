import React from "react";

const SeatLegends = () => {
  return (
    <div className="seat-legends">
      <label className="available">
        <span className="legend-square available" />
        Available
      </label>
      <label className="available">
        <span className="legend-square selection" />
        Your Selection
      </label>
      <label className="unavailable-female">
        <span className="legend-square unavailable-female" />
        Unavailable - F
      </label>
      <label className="unavailable-male">
        <span className="legend-square unavailable-male" />
        Unavailable - M
      </label>
      <label className="disabled">
        <span className="legend-square disabled" />
        Disabled
      </label>
    </div>
  );
};

export default SeatLegends;
