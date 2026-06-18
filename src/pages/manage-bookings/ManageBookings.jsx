import React, { useEffect, useMemo, useState } from "react";
import { Table, Button, Tag, DatePicker, Input, Space, Popconfirm, Select, message } from "antd";
import dayjs from "dayjs";
import { api } from "../../api";
import { DashboardLayout } from "../../layouts";
import { DashboardHeader } from "../../components";

const STATUS_COLOR = {
  CONFIRMED: "green",
  CANCELLED: "red",
  RESERVED: "gold",
  EXPIRED: "volcano",
};
const STATUS_OPTIONS = ["RESERVED", "CONFIRMED", "CANCELLED", "EXPIRED"];

export default function ManageBookings() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rowLoading, setRowLoading] = useState(null); // BOOKING_ID currently processing

  // Filters
  const [date, setDate] = useState(null);
  const [busNo, setBusNo] = useState("");
  const [status, setStatus] = useState("");

  const params = useMemo(
    () => ({
      date: date ? dayjs(date).format("YYYY-MM-DD") : undefined,
      bus_number: busNo || undefined,
      status: status || undefined,
    }),
    [date, busNo, status]
  );

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/bookings", { params });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg = e?.response?.data?.error || e.message || "Failed to load bookings";
      console.error("GET /bookings failed:", e);
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const clearFilters = () => {
    setDate(null);
    setBusNo("");
    setStatus("");
    setRows([]);
  };

  const exportExcel = async () => {
    try {
      setLoading(true);
      const res = await api.get("/bookings/export/excel", {
        params,
        responseType: "blob",
      });
      const blob = new Blob(
        [res.data],
        { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      const name = `bookings_${params.date || "all"}_${params.bus_number || "all"}_${params.status || "all"}.xlsx`;
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      const msg = e?.response?.data?.error || e.message || "Failed to export Excel";
      console.error("Export Excel failed:", e);
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const doConfirm = async (row) => {
    if (rowLoading === row.booking_id) return;
    setRowLoading(row.booking_id);
    const hide = message.loading("Confirming...", 0);
    try {
      await api.post(`/bookings/${row.booking_id}/pay`, {
        amount: row.total_amount,
        payment_ref: row.payment_ref || undefined,
        notify_to: row.customer_phone || undefined,
      });
      message.success(`Booking #${row.booking_id} confirmed`);
      await load();
    } catch (e) {
      const seats = e?.response?.data?.seats;
      const base = e?.response?.data?.error || e.message || "Failed to confirm";
      const msg = seats?.length ? `${base}: ${seats.join(", ")}` : base;
      console.error("POST /bookings/:id/pay failed:", e);
      message.error(msg);
    } finally {
      hide();
      setRowLoading(null);
    }
  };

  const doCancel = async (row) => {
    if (rowLoading === row.booking_id) return;
    setRowLoading(row.booking_id);
    const hide = message.loading("Cancelling...", 0);
    try {
      await api.post(
        `/bookings/${row.booking_id}/cancel`,
        { notify_to: row.customer_phone || undefined },
        { headers: { "Content-Type": "application/json" } }
      );
      message.success(`Booking #${row.booking_id} cancelled`);
      await load();
    } catch (e) {
      const base = e?.response?.data?.error || e.message || "Failed to cancel";
      const seats = e?.response?.data?.seats;
      message.error(seats?.length ? `${base}: ${seats.join(", ")}` : base);
      console.error("POST /bookings/:id/cancel failed:", e);
    } finally {
      hide();
      setRowLoading(null);
    }
  };

  const columns = [
    { title: "BOOKING ID", dataIndex: "booking_id", width: 110 },
    { title: "DATE", dataIndex: "trip_date", width: 110, render: (d) => d || "—" },
    { title: "TIME", dataIndex: "departure_time", width: 90, render: (t) => t || "—" },
    // { title: "FROM", dataIndex: "origin", width: 120, render: (v) => v || "—" },
    // { title: "TO", dataIndex: "destination", width: 120, render: (v) => v || "—" },
    { title: "FROM", dataIndex: "from_name", width: 140, render: (v, r) => v || r.origin || "—" },
    { title: "TO",   dataIndex: "to_name",   width: 140, render: (v, r) => v || r.destination || "—" },

    {
      title: "BUS",
      width: 160,
      render: (_, r) => `${r.bus_number}${r.bus_name ? ` (${r.bus_name})` : ""}`,
    },
    { title: "CUSTOMER", dataIndex: "customer_name", width: 180, ellipsis: true, render: (v) => v || "—" },
    { title: "PHONE", dataIndex: "customer_phone", width: 130, render: (v) => v || "—" },
    {
      title: "STATUS",
      dataIndex: "status",
      width: 110,
      render: (s) => <Tag color={STATUS_COLOR[s] || "blue"}>{s || "—"}</Tag>,
    },
    {
      title: "SEAT NUMBERS",
      dataIndex: "seats_csv",
      width: 220,
      render: (csv) => {
        if (!csv) return "—";
        const arr = csv.split(",").filter(Boolean);
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {arr.map((n) => (
              <span
                key={n}
                style={{
                  padding: "2px 6px",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  fontSize: 12,
                }}
              >
                {n}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      title: "AMOUNT",
      dataIndex: "total_amount",
      width: 110,
      render: (v) => (v != null ? `Rs ${Number(v).toFixed(2)}` : "-"),
    },
    {
      title: "ACTIONS",
      width: 240,
      fixed: "right",
      render: (_, row) => {
        const busy = rowLoading === row.booking_id;
        return (
          <Space>
            <Popconfirm
              title={`Confirm booking #${row.booking_id}?`}
              okText="Confirm"
              cancelText="No"
              onConfirm={() => doConfirm(row)}
              getPopupContainer={() => document.body}
              overlayStyle={{ zIndex: 10000 }}
            >
              <Button
                type="primary"
                disabled={row.status !== "RESERVED" || busy}
                loading={busy && row.status === "RESERVED"}
                onClick={(e) => e.stopPropagation()}
              >
                Confirm
              </Button>
            </Popconfirm>

            <Popconfirm
              title={`Cancel booking #${row.booking_id}?`}
              okText="Cancel Booking"
              okButtonProps={{ danger: true }}
              cancelText="No"
              onConfirm={() => doCancel(row)}
              getPopupContainer={() => document.body}
              overlayStyle={{ zIndex: 10000 }}
            >
              <Button
                danger
                disabled={busy}
                loading={busy && row.status !== "RESERVED"}
                onClick={(e) => e.stopPropagation()}
              >
                Cancel
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <DashboardLayout>
      <DashboardHeader label="Manage Bookings" />

      {/* Filter Bar — Date + Bus Number + Status */}
      <div style={{ display: "flex", gap: 10, padding: 10, alignItems: "end", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Date</div>
          <DatePicker value={date} onChange={setDate} style={{ width: 160 }} />
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Bus Number</div>
          <Input
            placeholder="e.g., NW-1234"
            value={busNo}
            onChange={(e) => setBusNo(e.target.value)}
            allowClear
            style={{ width: 160 }}
          />
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Status</div>
          <Select
            allowClear
            placeholder="Any"
            value={status || undefined}
            onChange={(v) => setStatus(v || "")}
            style={{ width: 160 }}
            options={STATUS_OPTIONS.map(s => ({ value: s, label: s }))}
          />
        </div>
        <Space>
          <Button type="primary" onClick={load} loading={loading}>Search</Button>
          <Button onClick={clearFilters} disabled={loading}>Clear</Button>
          <Button onClick={exportExcel} disabled={loading || rows.length === 0}>
            Export Excel
          </Button>
        </Space>
      </div>

      <Table
        rowKey="booking_id"
        dataSource={rows}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 20 }}
        scroll={{ x: 1300 }}
        size="middle"
      />
    </DashboardLayout>
  );
}
