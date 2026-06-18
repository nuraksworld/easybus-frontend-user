// src/features/TripComposer.jsx
import React, { useEffect, useMemo, useState } from "react";
import { DatePicker, Select, InputNumber, Button, Space, message } from "antd";
import dayjs from "dayjs";
import { api } from "../api";

const TripComposer = ({ onSearch }) => {
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [routeId, setRouteId] = useState();
  const [boardingId, setBoardingId] = useState();
  const [destinationId, setDestinationId] = useState();
  const [date, setDate] = useState(dayjs());
  const [seats, setSeats] = useState(1);

  // Load routes
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

  // Load stops for selected route
  useEffect(() => {
    if (!routeId) { setStops([]); setBoardingId(undefined); setDestinationId(undefined); return; }
    (async () => {
      try {
        const { data } = await api.get(`/routes/${routeId}/stops`);
        setStops(data || []);
        if (!data?.length) message.info("No stops for this route.");
      } catch (e) {
        console.error(`GET /routes/${routeId}/stops failed:`, e);
        message.error("Failed to load stops");
      }
    })();
  }, [routeId]);

  const boardingOptions = useMemo(
    () => stops.map(s => ({ value: s.stop_id, label: s.name, seq: s.seq_no })),
    [stops]
  );

  const destinationOptions = useMemo(() => {
    if (!boardingId) return [];
    const fromSeq = stops.find(s => s.stop_id === boardingId)?.seq_no ?? 0;
    return stops.filter(s => s.seq_no > fromSeq).map(s => ({ value: s.stop_id, label: s.name }));
  }, [stops, boardingId]);

  const submit = () => {
    if (!routeId || !boardingId || !destinationId || !date) {
      return message.warning("Select Direction, Boarding, Destination and Date");
    }
    onSearch?.({
      route_id: routeId,
      from_stop_id: boardingId,
      to_stop_id: destinationId,
      date,
      seats,
    });
  };

  return (
    <Space wrap style={{ width: "100%" }}>
      <DatePicker value={date} onChange={setDate} />
      <Select
        placeholder="Direction (Route)"
        style={{ width: 240 }}
        value={routeId}
        onChange={setRouteId}
        options={routes.map(r => ({ value: r.route_id, label: `${r.origin} → ${r.destination}` }))}
        notFoundContent="No routes"
      />
      <Select
        placeholder="Boarding Place"
        style={{ width: 280 }}
        value={boardingId}
        onChange={setBoardingId}
        options={boardingOptions}
        disabled={!routeId}
        showSearch
        optionFilterProp="label"
        notFoundContent="No data"
      />
      <Select
        placeholder="Destination Place"
        style={{ width: 280 }}
        value={destinationId}
        onChange={setDestinationId}
        options={destinationOptions}
        disabled={!boardingId}
        showSearch
        optionFilterProp="label"
        notFoundContent="No data"
      />
      <InputNumber min={1} value={seats} onChange={setSeats} />
      <Button type="primary" onClick={() => { 
  console.log('[TripComposer] Search clicked'); // debug
  submit();
}}>
  Search
</Button>

    </Space>
  );
};

export default TripComposer;
