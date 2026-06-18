import React from "react";

const SelectedTrip = ({
  tripType,
  origin,
  departureDate,
  departureTime,
  destination,
  arrivalTime,
  arrivalDate,
}) => {
  return (
    <section className="selected-trip-widget">
      <header>
        <h6 className="trip-type">{tripType}</h6>
      </header>
      <div className="selected-trip-summary-wrapper">
        <div className="selected-trip-summary">
          <p className="city-name">{origin}</p>
          <p className="date-time">
            {departureDate} | {departureTime}
          </p>
        </div>
        <div className="selected-trip-summary">
          <p className="city-name">{destination}</p>
          <p className="date-time">
            {arrivalDate} | {arrivalTime}
          </p>
        </div>
      </div>
    </section>
  );
};

export default SelectedTrip;
