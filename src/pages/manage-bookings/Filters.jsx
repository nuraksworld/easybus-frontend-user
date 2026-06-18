// src/pages/manage-bookings/Filters.jsx
import React, { useEffect, useMemo, useState } from "react";
import { DatePicker, Select, Space, Button } from "antd";
import dayjs from "dayjs";
import { api } from "../../api";

export default function BookingFilters({ onApply }) {
  const [date, setDate] = useState(dayjs());
  const [tripId, setTripId] = useState();
  const [trips, setTrips] = useState([]);

  const dateStr = useMemo(
    () => (date ? dayjs(date).format("YYYY-MM-DD") : undefined),
    [date]
  );

  // load trips when date changes
  useEffect(() => {
    if (!dateStr) { setTrips([]); setTripId(undefined); return; }
    api.get("/trips/for-date", { params: { date: dateStr } })
      .then(({ data }) => setTrips(data || []))
      .catch(() => setTrips([]));
    setTripId(undefined);
  }, [dateStr]);

  const tripOptions = trips.map(t => ({
    value: t.trip_id,
    label: `${t.origin} → ${t.destination} • ${t.departure_time ?? "—"}`
  }));

  return (
    <Space wrap size="middle" style={{ marginBottom: 12 }}>
      <div>
        <div style={{ fontSize: 12, color: "#888" }}>Date</div>
        <DatePicker value={date} onChange={setDate} />
      </div>

      <div>
        <div style={{ fontSize: 12, color: "#888" }}>Trip</div>
        <Select
          style={{ minWidth: 340 }}
          allowClear
          placeholder="All trips for selected date"
          options={tripOptions}
          value={tripId}
          onChange={setTripId}
        />
      </div>

      <Button
        type="primary"
        onClick={() => onApply({ date: dateStr, trip_id: tripId })}
      >
        Apply
      </Button>
    </Space>
  );
}
