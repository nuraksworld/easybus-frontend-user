import React, { useEffect, useMemo, useState, useCallback } from "react";
import { DashboardLayout } from "../../layouts";
import { DashboardHeader } from "../../components";
import { api } from "../../api";
import {
  Card, Button, Table, Space, Input, DatePicker, TimePicker, Select,
  InputNumber, Modal, message, Popconfirm, Tag
} from "antd";
import dayjs from "dayjs";

const ManageTrips = () => {
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [rows, setRows] = useState([]);

  const [filters, setFilters] = useState({ date: null, origin: undefined, destination: undefined });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const loadBase = useCallback(async () => {
    try {
      const [rs, bs] = await Promise.all([ api.get("/routes"), api.get("/buses") ]);
      setRoutes(rs.data || []);
      setBuses(bs.data || []);
    } catch {
      message.error("Failed to load base data");
    }
  }, []);

  const loadTrips = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.date) params.date = filters.date.format("YYYY-MM-DD");
      if (filters.origin) params.from = filters.origin;
      if (filters.destination) params.to = filters.destination;
      const { data } = await api.get("/trips", { params }); // protected list
      setRows(data);
    } catch (e) {
      message.error(e?.response?.data?.error || "Failed to load trips");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadBase(); }, [loadBase]);
  useEffect(() => { loadTrips(); }, [loadTrips]);

  const origins = useMemo(() => [...new Set(routes.map(r => r.origin))], [routes]);
  const dests   = useMemo(() => [...new Set(routes.map(r => r.destination))], [routes]);

  const columns = [
    { title: "Trip ID", dataIndex: "trip_id", width: 90 },
    { title: "Date", dataIndex: "trip_date", width: 110 },
    { title: "Time", dataIndex: "departure_time", width: 90, render: t => t || <Tag>—</Tag> },
    { title: "Route", render: (_, r) => `${r.origin} → ${r.destination}` },
    { title: "Bus No", dataIndex: "bus_number" },
    { title: "Bus Name", dataIndex: "bus_name" },
    { title: "Seats", dataIndex: "seats", width: 80 },           // COALESCE(seats_override, total_seats)
    { title: "Available", dataIndex: "available", width: 100 },
    { title: "Amount", dataIndex: "price_per_seat", width: 100, render: v => `Rs ${Number(v).toFixed(2)}` },
    { title: "Driver", render: r => `${r.driver_name || "-" } (${r.driver_phone || "-"})` },
    {
      title: "Actions",
      width: 170,
      render: (_, r) => (
        <Space>
          <Button size="small" onClick={() => { setEditing(r); setIsModalOpen(true); }}>Edit</Button>
          <Popconfirm
            title="Delete this trip?"
            okText="Delete"
            okType="danger"
            onConfirm={() => handleDelete(r.trip_id)}
          >
            <Button danger size="small">Delete</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  async function handleDelete(id) {
    try {
      await api.delete(`/trips/${id}`);
      message.success("Trip deleted");
      loadTrips();
    } catch (e) {
      message.error(e?.response?.data?.error || "Delete failed");
    }
  }

  function openCreate() {
    setEditing(null);
    setIsModalOpen(true);
  }

  async function onSubmit(form) {
    // form: { route_id, bus_id, trip_date(dayjs), departure_time(dayjs|null), price_per_seat, seats_override?, notes? }
    const payload = {
      route_id: form.route_id,
      bus_id: form.bus_id,
      trip_date: form.trip_date.format("YYYY-MM-DD"),
      departure_time: form.departure_time ? form.departure_time.format("HH:mm:ss") : null,
      price_per_seat: Number(form.price_per_seat),
      seats_override: form.seats_override ? Number(form.seats_override) : null,
      notes: form.notes || null
    };
    try {
      if (editing) {
        await api.put(`/trips/${editing.trip_id}`, payload);
        message.success("Trip updated");
      } else {
        await api.post("/trips", payload);
        message.success("Trip created");
      }
      setIsModalOpen(false);
      loadTrips();
    } catch (e) {
      message.error(e?.response?.data?.error || "Save failed");
    }
  }

  return (
    <DashboardLayout>
      <DashboardHeader label="Manage Trips" />

      <Card size="small" style={{ marginBottom: 12 }}>
        <Space wrap>
          <DatePicker
            placeholder="Date"
            value={filters.date}
            onChange={(v) => setFilters(f => ({ ...f, date: v }))}
          />
          <Select
            placeholder="From"
            allowClear
            style={{ width: 160 }}
            value={filters.origin}
            onChange={(v) => setFilters(f => ({ ...f, origin: v }))}
            options={origins.map(o => ({ label: o, value: o }))}
          />
          <Select
            placeholder="To"
            allowClear
            style={{ width: 160 }}
            value={filters.destination}
            onChange={(v) => setFilters(f => ({ ...f, destination: v }))}
            options={dests.map(d => ({ label: d, value: d }))}
          />
          <Button onClick={loadTrips} loading={loading}>Filter</Button>
          <Button type="primary" onClick={openCreate}>New Trip</Button>
        </Space>
      </Card>

      <Table
        rowKey="trip_id"
        columns={columns}
        dataSource={rows}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <TripModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={onSubmit}
        routes={routes}
        buses={buses}
        initial={editing}
      />
    </DashboardLayout>
  );
};

export default ManageTrips;

/** ---------- Trip create/edit modal ---------- */

const TripModal = ({ open, onClose, onSubmit, routes, buses, initial }) => {
  const [form, setForm] = useState(() => ({
    route_id: initial?.route_id || undefined,
    bus_id: initial?.bus_id || undefined,
    trip_date: initial?.trip_date ? dayjs(initial.trip_date) : null,
    departure_time: initial?.departure_time ? dayjs(initial.departure_time, "HH:mm:ss") : null,
    price_per_seat: initial?.price_per_seat || undefined,
    seats_override: initial?.seats || undefined, // initial uses resolved seats
    notes: initial?.notes || ""
  }));
  useEffect(() => {
    setForm({
      route_id: initial?.route_id || undefined,
      bus_id: initial?.bus_id || undefined,
      trip_date: initial?.trip_date ? dayjs(initial.trip_date) : null,
      departure_time: initial?.departure_time ? dayjs(initial.departure_time, "HH:mm:ss") : null,
      price_per_seat: initial?.price_per_seat || undefined,
      seats_override: initial?.seats || undefined,
      notes: initial?.notes || ""
    });
  }, [initial]);

  return (
    <Modal
      title={initial ? `Edit Trip #${initial.trip_id}` : "Create Trip"}
      open={open}
      onCancel={onClose}
      onOk={() => onSubmit(form)}
      okText={initial ? "Update" : "Create"}
      destroyOnClose
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <Select
          placeholder="Route"
          style={{ width: "100%" }}
          value={form.route_id}
          onChange={(v) => setForm(f => ({ ...f, route_id: v }))}
          options={routes.map(r => ({ value: r.route_id, label: `${r.origin} → ${r.destination}` }))}
        />
        <Select
          placeholder="Bus"
          style={{ width: "100%" }}
          value={form.bus_id}
          onChange={(v) => setForm(f => ({ ...f, bus_id: v }))}
          options={buses.map(b => ({ value: b.bus_id, label: `${b.bus_number} — ${b.bus_name || 'No name'}` }))}
        />
        <DatePicker
          placeholder="Trip Date"
          style={{ width: "100%" }}
          value={form.trip_date}
          onChange={(v) => setForm(f => ({ ...f, trip_date: v }))}
        />
        <TimePicker
          placeholder="Departure (optional)"
          style={{ width: "100%" }}
          format="HH:mm"
          value={form.departure_time}
          onChange={(v) => setForm(f => ({ ...f, departure_time: v }))}
        />
        <InputNumber
          placeholder="Price per seat"
          style={{ width: "100%" }}
          value={form.price_per_seat}
          onChange={(v) => setForm(f => ({ ...f, price_per_seat: v }))}
          min={0}
        />
        <InputNumber
          placeholder="Seats (optional override)"
          style={{ width: "100%" }}
          value={form.seats_override}
          onChange={(v) => setForm(f => ({ ...f, seats_override: v }))}
          min={1}
          max={80}
        />
        <Input.TextArea
          placeholder="Notes"
          value={form.notes}
          onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
          rows={3}
        />
        <div style={{ fontSize: 12, color: "#888" }}>
          * If seats override is empty, UI will use the bus’s total seats.  
          * Seat map is 2 + aisle + 2 per row; last row has 5 seats.
        </div>
      </Space>
    </Modal>
  );
};
