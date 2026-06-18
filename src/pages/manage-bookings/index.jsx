// src/pages/manage-bookings/index.jsx
import React, { useEffect, useState } from "react";
import { DashboardLayout } from "../../layouts";
import { DashboardHeader } from "../../components";
import BookingFilters from "./Filters";
import { api } from "../../api";
import BookingsTable from "../../features/manage-bookings/BookingsTable"; // your table

export default function ManageBookings() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState({}); // { date, trip_id }

  const fetchData = async (q) => {
    setLoading(true);
    try {
      const { data } = await api.get("/bookings", { params: q });
      setRows(data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(query); }, [query]);

  return (
    <DashboardLayout>
      <DashboardHeader label="Manage Bookings" />
      <BookingFilters onApply={setQuery} />
      <BookingsTable loading={loading} data={rows} />
    </DashboardLayout>
  );
}
