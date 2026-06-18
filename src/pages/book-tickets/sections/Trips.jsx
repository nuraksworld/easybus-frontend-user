// src/pages/book-tickets/sections/Trips.jsx
import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { TripComposer, SelectedTrip, TripCard } from "../../../features";
import { Empty, Spin, message } from "antd";
import { api } from "../../../api";

const Trips = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState([]);
  const [criteria, setCriteria] = useState(null); // { route_id, date, from_stop_id, to_stop_id, seats }

  const formattedDate = useMemo(() => {
    if (!criteria?.date) return null;
    return typeof criteria.date === "string"
      ? criteria.date
      : dayjs(criteria.date).format("YYYY-MM-DD");
  }, [criteria]);

  const fetchTrips = useCallback(async (crit) => {
    if (!crit?.route_id || !crit?.from_stop_id || !crit?.to_stop_id || !crit?.date) {
      message.destroy();
      message.warning("Please select Direction, Boarding, Destination and Date");
      return;
    }
    const dateStr =
      typeof crit.date === "string" ? crit.date : dayjs(crit.date).format("YYYY-MM-DD");

    const params = {
      route_id: crit.route_id,
      from_stop_id: crit.from_stop_id,
      to_stop_id: crit.to_stop_id,
      seats: Number(crit.seats || 1),
      date: dateStr,
    };

    // helpful console debug
    // eslint-disable-next-line no-console
    console.log("[Trips] GET /trips/search", params);

    setLoading(true);
    try {
      const { data } = await api.get("/trips/search", { params });
      setTrips(Array.isArray(data) ? data : []);
      message.destroy();
      if (!data?.length) message.info("No trips found for your search.");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("GET /trips/search failed:", e);
      message.destroy();
      message.error(e?.response?.data?.error || "Failed to load trips");
    } finally {
      setLoading(false);
    }
  }, []);

  const onSearch = (crit) => {
  console.log("[Trips] onSearch:", crit);
  setCriteria(crit);
  fetchTrips(crit);                   // makes GET /api/trips/search
  };


  

  const handleSelectTrip = (t) => {
    if (!criteria) return;
    navigate("/book-tickets/seat-selection", {
      state: {
        tripId: t.trip_id,
        criteria: {
          ...criteria,
          date: formattedDate, // normalized
        },
      },
    });
  };

  return (
    <>
      <TripComposer onSearch={onSearch} />

      {/* Optional summary block */}
      {criteria && (
        <div className="trip-selections" style={{ marginTop: 12 }}>
          <SelectedTrip
            tripType="Onward Trip"
            origin={/* You can show stop names on this line if you keep them in state */ undefined}
            destination={undefined}
            departureDate={formattedDate ? dayjs(formattedDate).format("D MMM, ddd") : ""}
            departureTime="—"
          />
        </div>
      )}

      <div className="trip-cards-wrapper" style={{ marginTop: 12 }}>
        {loading ? (
          <div style={{ padding: 24, display: "grid", placeItems: "center" }}>
            <Spin />
          </div>
        ) : !criteria ? (
          <Empty description="Pick Direction, Boarding, Destination and Date to search" />
        ) : trips.length === 0 ? (
          <Empty description="No trips" />
        ) : (
          trips.map((t) => (
            <TripCard
              key={t.trip_id}
              tripName={`${t.origin} → ${t.destination}`}
              operatorName={t.bus_name || "—"}
              availableSeats={t.available}
              totalSeats={t.seats}
              departurePoint={t.origin}
              departureDate={dayjs(t.trip_date).format("D MMM, ddd")}
              departureTime={t.departure_time || "—"}
              destination={t.destination}
              ticketPrice={Number(t.price_per_seat)}
              busType={t.ac_type === "AC" ? "AC" : "Normal"}
              busModel={t.bus_number}
              busRegNo={t.bus_number}
              busDriverName={`${t.driver_name || ""}${
                t.driver_phone ? ` (${t.driver_phone})` : ""
              }`}
              onSelect={() => handleSelectTrip(t)}
            />
          ))
        )}
      </div>
    </>
  );
};

export default Trips;
