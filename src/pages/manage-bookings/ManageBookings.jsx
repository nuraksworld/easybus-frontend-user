// src/pages/manage-bookings/ManageBookings.jsx
import React, { useEffect, useState } from "react";
import { Table, Tag, message, Button } from "antd";
import { api } from "../../api";
import { DashboardLayout } from "../../layouts";
import { DashboardHeader } from "../../components";

const STATUS_COLOR = {
  CONFIRMED: "green",
  CANCELLED: "red",
  RESERVED: "gold",
  EXPIRED: "volcano",
};

export default function ManageBookings() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Load current user
  const user = JSON.parse(localStorage.getItem("easybus_user") || "{}");

  async function load() {
    setLoading(true);
    try {
      // Load all bookings (backend already gives all)
      const { data } = await api.get("/bookings");
      const allBookings = Array.isArray(data) ? data : [];

      // ✅ Filter on frontend by user's phone number
      const myBookings = user?.phone
        ? allBookings.filter(
            (b) => String(b.customer_phone) === String(user.phone)
          )
        : [];

      setRows(myBookings);
    } catch (e) {
      console.error("Failed to load bookings:", e);
      message.error(e?.response?.data?.error || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const columns = [
    { title: "Booking ID", dataIndex: "booking_id", width: 100 },
    { title: "Trip Date", dataIndex: "trip_date", width: 120 },
    { title: "From", dataIndex: "from_name", width: 150 },
    { title: "To", dataIndex: "to_name", width: 150 },
    { title: "Bus", dataIndex: "bus_number", width: 130 },
    {
      title: "Seats",
      dataIndex: "seats_csv",
      render: (csv) =>
        csv
          ? csv.split(",").map((s) => (
              <Tag key={s} color="blue" style={{ marginBottom: 4 }}>
                {s}
              </Tag>
            ))
          : "—",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (s) => <Tag color={STATUS_COLOR[s] || "default"}>{s}</Tag>,
    },
    {
      title: "Amount",
      dataIndex: "total_amount",
      render: (v) => (v != null ? `Rs ${Number(v).toFixed(2)}` : "-"),
    },
  ];

  return (
    <DashboardLayout showSidebar={false}>
      <DashboardHeader label={`My Bookings (${user?.phone || ""})`} />

      <div style={{ padding: "10px 16px" }}>
        <Button onClick={load} type="primary" loading={loading}>
          Refresh
        </Button>
      </div>

      <Table
        rowKey="booking_id"
        dataSource={rows}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 10 }}
        size="middle"
      />
    </DashboardLayout>
  );
}
