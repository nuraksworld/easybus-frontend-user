// src/features/TripComposer.jsx
import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { DatePicker, InputNumber, Button, Space, message } from "antd";
import { MultiLabelledSelect } from "../../../components";
import { api } from "../../../api";

const TripComposer = ({ onSearch }) => {
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);

  const [routeId, setRouteId] = useState();
  const [boardingId, setBoardingId] = useState();
  const [destinationId, setDestinationId] = useState();
  const [date, setDate] = useState(dayjs());
  const [seats, setSeats] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/routes");
        setRoutes(data || []);
        if (!data?.length) message.warning("No routes found. Seed DB for routes.");
      } catch (e) {
        console.error("GET /routes failed:", e);
        message.error("Failed to load routes");
      }
    })();
  }, []);

  useEffect(() => {
    if (!routeId) {
      setStops([]);
      setBoardingId(undefined);
      setDestinationId(undefined);
      return;
    }
    (async () => {
      try {
        const { data } = await api.get(`/routes/${routeId}/stops`);
        setStops(data || []);
        setBoardingId(undefined);
        setDestinationId(undefined);
        if (!data?.length) message.info("No stops for this route.");
      } catch (e) {
        console.error(`GET /routes/${routeId}/stops failed:`, e);
        message.error("Failed to load stops");
      }
    })();
  }, [routeId]);

  const routeOptions = useMemo(
    () => routes.map(r => ({ value: r.route_id, label: `${r.origin} → ${r.destination}` })),
    [routes]
  );

  const boardingOptions = useMemo(
    () => stops.map(s => ({ value: s.stop_id, label: s.name, seq: s.seq_no })),
    [stops]
  );

  const destinationOptions = useMemo(() => {
    if (!boardingId) return [];
    const fromSeq = stops.find(s => s.stop_id === boardingId)?.seq_no ?? 0;
    return stops.filter(s => s.seq_no > fromSeq).map(s => ({ value: s.stop_id, label: s.name }));
  }, [stops, boardingId]);

  const isValid = Boolean(routeId && boardingId && destinationId && date && Number(seats) > 0);

  const submit = () => {
    if (!isValid) {
      message.destroy();
      message.warning("Select Direction, Boarding, Destination, Date and Seats");
      return;
    }
    const payload = {
      route_id: routeId,
      from_stop_id: boardingId,
      to_stop_id: destinationId,
      date: typeof date === "string" ? date : dayjs(date).format("YYYY-MM-DD"),
      seats: Number(seats),
    };
    console.log("[TripComposer] Search payload:", payload);
    onSearch?.(payload);
  };

  // optional: allow Enter key to submit when valid
  const onKeyDown = (e) => {
    if (e.key === "Enter" && isValid) submit();
  };

  return (
    <div className="trip-composer" onKeyDown={onKeyDown}>
      <div className="trip-chooser">
        <div className="trip-locations" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <MultiLabelledSelect
            topLabels={["Direction"]}
            bottomLabels={["ගමන", "திசை"]}
            placeholder="Select"
            options={routeOptions}
            value={routeId}
            onChange={setRouteId}
          />
          <MultiLabelledSelect
            topLabels={["From (Boarding)"]}
            bottomLabels={["ඉදිරියෙන්", "புறப்படும் இடம்"]}
            placeholder="Select"
            options={boardingOptions}
            value={boardingId}
            onChange={setBoardingId}
          />
          <MultiLabelledSelect
            topLabels={["To (Destination)"]}
            bottomLabels={["ගමනාන්තය", "சேரும் இடம்"]}
            placeholder="Select"
            options={destinationOptions}
            value={destinationId}
            onChange={setDestinationId}
          />
        </div>

        <div className="trip-dates" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Departure Date</div>
            <DatePicker value={date} onChange={setDate} />
          </div>

          <div>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Seats</div>
            <InputNumber min={1} value={seats} onChange={setSeats} />
          </div>

          <div style={{ alignSelf: "end" }}>
            <Button type="primary" disabled={!isValid} onClick={submit}>
              Search
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripComposer;
