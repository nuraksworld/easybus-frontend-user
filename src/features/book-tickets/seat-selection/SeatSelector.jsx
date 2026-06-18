// src/features/book-tickets/seat-selection/SeatSelector.jsx
import React from "react";
import SeatLayout from "../../../components/data-display/info-display/SeatLayout";
import { SeatLegends } from "../../../components";

const SeatSelector = ({
  tripType,
  departurePoint,
  departureDate,
  departureTime,
  approxDuration,
  destination,
  arrivalDate,
  arrivalTime,

  // NEW: pass-through from the page
  seatsCount = 45,
  lockedSeats = [],         // [{seat_number:'12', status:'RESERVED'|'CONFIRMED', gender:'M'|'F'}]
  onChange,                 // (selectedArray) => void
  maxSelectable = 1,
  value = [],
}) => {
  return (
    <section className="seat-selector-widget">
      <header>
        <h6 className="trip-type">{tripType}</h6>
      </header>

      <div className="trip-details-body">
        <div className="trip-body">
          <div className="departure-info">
            <h6>Departure</h6>
            <p className="city-name">{departurePoint}</p>
            <p className="date-time">{departureDate} | {departureTime}</p>
          </div>

          <div className="approx-duration">
            <p>APPROX</p>
            {approxDuration}
          </div>

          <div className="arrival-info">
            <h6>Arrival</h6>
            <p className="city-name">{destination}</p>
            <p className="date-time">{arrivalDate} | {arrivalTime}</p>
          </div>
        </div>

        {/* CENTERED */}
        <div className="bus-layout-container">
          <SeatLayout
            totalSeats={seatsCount}
            lockedSeats={lockedSeats}
            value={value}
            maxSelectable={maxSelectable}
            onChange={onChange}
          />
        </div>

        <SeatLegends />
      </div>
    </section>
  );
};

export default SeatSelector;
