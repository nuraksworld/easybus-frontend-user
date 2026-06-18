import React, { useMemo } from "react";
import { Table, Button, Tag, Space, Modal, message } from "antd";
import dayjs from "dayjs";
import { api } from "../api";

const STATUS_COLOR = {
  CONFIRMED: "green",
  CANCELLED: "red",
  RESERVED: "gold",
  EXPIRED: "volcano",
};

const sameDay = (rowDate, pickerVal) => {
  if (!pickerVal) return true;
  if (!rowDate) return false;
  return dayjs(rowDate).isSame(dayjs(pickerVal), "day");
};

export function BookingsTable({ allRows = [], loading, date, from, to, onRefresh }) {
  const rows = useMemo(() => {
    return (Array.isArray(allRows) ? allRows : []).filter((r) => {
      let ok = true;
      if (date) ok = ok && sameDay(r.trip_date, date);
      if (from) ok = ok && r.origin === from;
      if (to) ok = ok && r.destination === to;
      return ok;
    });
  }, [allRows, date, from, to]);

  const confirmBooking = (row) => {
    Modal.confirm({
      title: "Confirm this booking?",
      okText: "Confirm",
      onOk: async () => {
        try {
          await api.post(`/bookings/${row.booking_id}/pay`, { amount: row.total_amount });
          message.success("Booking confirmed");
          onRefresh?.();
        } catch (e) {
          console.error(e);
          message.error("Failed to confirm");
        }
      },
    });
  };

  const cancelBooking = (row) => {
    Modal.confirm({
      title: "Cancel this booking?",
      okText: "Cancel Booking",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await api.post(`/bookings/${row.booking_id}/cancel`);
          message.success("Booking cancelled");
          onRefresh?.();
        } catch (e) {
          console.error(e);
          message.error("Failed to cancel");
        }
      },
    });
  };

  const columns = [
    { title: "BOOKING ID", dataIndex: "booking_id", width: 100 },
    { title: "DATE", dataIndex: "trip_date", width: 160 },
    { title: "TIME", dataIndex: "departure_time", width: 120 },
    {
      title: "ROUTE",
      width: 220,
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.origin}</div>
          <div style={{ opacity: 0.7 }}>→ {r.destination}</div>
        </div>
      ),
    },
    { title: "CUSTOMER", dataIndex: "customer_name", width: 200, ellipsis: true },
    { title: "PHONE", dataIndex: "customer_phone", width: 140 },
    { title: "SEATS", dataIndex: "seat_count", width: 90, render: (v, r) => r.seats || r.seat_count || "—" },
    {
      title: "STATUS",
      dataIndex: "status",
      width: 120,
      render: (s) => <Tag color={STATUS_COLOR[s] || "blue"}>{s || "—"}</Tag>,
    },
    {
      title: "AMOUNT",
      dataIndex: "total_amount",
      width: 130,
      render: (v) => `Rs ${Number(v || 0).toFixed(2)}`,
    },
    {
      title: "ACTIONS",
      width: 180,
      fixed: "right",
      render: (_, row) => (
        <Space>
          <Button
            type="primary"
            disabled={row.status !== "RESERVED"}
            onClick={() => confirmBooking(row)}
          >
            Confirm
          </Button>
          <Button danger onClick={() => cancelBooking(row)}>
            Cancel
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowKey="booking_id"
      dataSource={rows}
      columns={columns}
      loading={loading}
      scroll={{ x: 1100 }}
      pagination={{ pageSize: 20 }}
    />
  );
}
