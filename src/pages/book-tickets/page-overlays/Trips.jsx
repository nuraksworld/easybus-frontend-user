// src/pages/book-tickets/sections/Trips.jsx
import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

// Features
import { TripComposer, SelectedTrip, TripCard } from "../../../features";

// UI
import { Empty, Spin, message } from "antd";

// API
import { api } from "../../../api";

const Trips = () => {
  const navigate = useNavigate();

  const [criteria, setCriteria] = useState(null);
  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const formattedDate = useMemo(() => {
    if (!criteria?.date) return null;
    return typeof criteria.date === "string"
      ? criteria.date
      : dayjs(criteria.date).format("YYYY-MM-DD");
  }, [criteria?.date]);

  const fetchTrips = useCallback(async (crit) => {
    if (
      !crit?.route_id ||
      !crit?.from_stop_id ||
      !crit?.to_stop_id ||
      !crit?.date
    ) {
      message.warning("Please select Direction, Boarding, Destination and Date");
      return;
    }

    const params = {
      route_id: Number(crit.route_id),
      from_stop_id: Number(crit.from_stop_id),
      to_stop_id: Number(crit.to_stop_id),
      seats: Number(crit.seats || 1),
      date:
        typeof crit.date === "string"
          ? crit.date
          : dayjs(crit.date).format("YYYY-MM-DD"),
    };

    setLoading(true);
    setHasSearched(true);

    try {
      const { data } = await api.get("/trips/search", { params });

      console.log("[Trips] API result:", data);

      setTrips(Array.isArray(data) ? data : []);

      if (!data?.length) {
        message.info("No trips found for your search.");
      }
    } catch (err) {
      message.error(err?.response?.data?.error || "Failed to load trips");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = (values) => {
    setCriteria(values);
    fetchTrips(values);
  };

  const handleSelectTrip = (t) => {
    navigate("/book-tickets/seat-selection", {
      state: {
        tripId: t.trip_id,
        criteria: {
          ...criteria,
          date: formattedDate,
        },
      },
    });
  };

  return (
    <>
      <TripComposer onSearch={handleSearch} />

      {hasSearched && trips?.length > 0 && (
        <div className="trip-selections" style={{ marginTop: 12 }}>
          <SelectedTrip
            tripType="Onward Trip"
            origin={trips[0].origin}
            destination={trips[0].destination}
            departureDate={dayjs(trips[0].trip_date).format("D MMM, ddd")}
            departureTime={trips[0].departure_time || "—"}
          />
        </div>
      )}

      <div className="trip-cards-wrapper" style={{ marginTop: 12 }}>
        {loading ? (
          <div style={{ padding: 24, display: "grid", placeItems: "center" }}>
            <Spin />
          </div>
        ) : !hasSearched ? (
          <Empty description="Pick Direction, Boarding, Destination and Date to search" />
        ) : trips.length === 0 ? (
          <Empty description="No trips" />
        ) : (
          trips.map((t) => (
            <TripCard
              key={t.trip_id}
              tripName={`${t.origin} → ${t.destination}`}
              companyName={t.company_name}
              busName={t.bus_name}
              busNumber={t.bus_number}
              acType={t.ac_type === "AC" ? "AC" : "Non AC"}
              availableSeats={t.available}
              totalSeats={t.seats}
              departurePoint={t.origin}
              departureDate={dayjs(t.trip_date).format("D MMM, ddd")}
              departureTime={t.departure_time || "—"}
              destination={t.destination}
              ticketPrice={Number(t.price_per_seat)}
              onSelect={() => handleSelectTrip(t)}
            />
          ))
        )}
      </div>
    </>
  );
};

export default Trips;