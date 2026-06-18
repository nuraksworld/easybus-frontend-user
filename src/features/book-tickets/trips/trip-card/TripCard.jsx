import React from "react";
import { Card, Button } from "antd";

const TripCard = ({
  tripName,
  operatorName,
  availableSeats,
  totalSeats,
  departurePoint,
  departureDate,
  departureTime,
  destination,
  ticketPrice,
  onSelect,
  ...rest
}) => {
  return (
    <Card style={{ marginBottom: 12 }}>
      <div className="row" style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontWeight: 600 }}>{tripName}</div>
          <div>{operatorName}</div>
          <div>
            {departurePoint} · {departureDate} · {departureTime}
          </div>
          <div>To: {destination}</div>
          <div>Seats: {availableSeats}/{totalSeats}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Rs {Number(ticketPrice).toFixed(2)}</div>
          <Button type="primary" onClick={onSelect} style={{ marginTop: 8 }}>
            Book Seats
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default TripCard;
