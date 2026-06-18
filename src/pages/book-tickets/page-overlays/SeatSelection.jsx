// src/pages/book-tickets/page-overlays/SeatSelection.jsx
import {
  Button, Card, Empty, Form, Input, Modal,
  message, Radio, Space, Spin, Typography
} from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { LeftOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import SeatSelector from "../../../components/data-display/info-display/SeatLayout"; // visual layout
import { api } from "../../../api";

const { Title, Text } = Typography;

const SeatSelection = () => {
  const navigate = useNavigate();
  const { state } = useLocation() || {};
  const tripId = state?.tripId;
  const criteria = state?.criteria; // { date:'YYYY-MM-DD', seats: 1..N, ... }

  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState(null);

  const [selectedSeats, setSelectedSeats] = useState([]); // ["12","13"]
  const [genderBySeat, setGenderBySeat] = useState({});   // { "12": "M"|"F" }
  const [locksLocal, setLocksLocal] = useState([]);       // local overlay locks after hold

  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const maxSelectable = Number(criteria?.seats || 1);

  const back = () => navigate(-1);

  // Load trip (includes total seats & locked seats)
  useEffect(() => {
    if (!tripId) {
      message.error("No trip selected.");
      navigate("/book-tickets", { replace: true });
      return;
    }
    (async () => {
      try {
        const { data } = await api.get(`/trips/${tripId}`);
        // Expect backend getTrip to include:
        // seats (total seats),
        // lockedSeats: [{ seat_number, status, gender }]
        setTrip(data || null);
        setLocksLocal([]); // clear local overlay locks on load
      } catch (e) {
        console.error("GET /trips/:id failed:", e);
        message.error(e?.response?.data?.error || "Failed to load trip");
      } finally {
        setLoading(false);
      }
    })();
  }, [tripId, navigate]);

  // keep gender entries in sync with selected seats
  useEffect(() => {
    setGenderBySeat(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(s => {
        if (!selectedSeats.includes(s)) delete next[s];
      });
      return next;
    });
  }, [selectedSeats]);

  const depDate = useMemo(
    () => (trip?.trip_date ? dayjs(trip.trip_date).format("D MMM, ddd") : "—"),
    [trip?.trip_date]
  );
  const depTime = trip?.departure_time || "—";

  // Palette for SeatLayout
  const palette = useMemo(() => ({
    available: "#52c41a", // green
    male: "#1677ff",      // blue
    female: "#ff4d4f",    // red
  }), []);

  // Combine backend locks + local locks (after hold)
  const lockedSeats = useMemo(() => {
    const server = Array.isArray(trip?.lockedSeats) ? trip.lockedSeats : [];
    const normalize = (arr) =>
      arr.filter(Boolean).map(x => ({
        seat_number: Number(x.seat_number),
        gender: x.gender === "F" ? "F" : "M",
        status: x.status || "RESERVED",
      }));
    return [...normalize(server), ...normalize(locksLocal)];
  }, [trip?.lockedSeats, locksLocal]);

  // Total seats must come from trip
  const totalSeats = useMemo(() => Number(trip?.seats || trip?.total_seats || 0), [trip]);

  // SeatLayout -> we receive the latest selection
  const handleSeatChange = (arr) => {
    const onlyFirstN = arr.slice(0, maxSelectable).map(String);
    setSelectedSeats(onlyFirstN);
  };

  const handleGenderChange = (seat, g) =>
    setGenderBySeat(prev => ({ ...prev, [seat]: g }));

  // open modal for name/phone
  const askCustomer = () => {
    if (selectedSeats.length === 0) {
      message.warning("Pick at least one seat.");
      return;
    }
    if (!selectedSeats.every(s => genderBySeat[s])) {
      message.warning("Please choose Male/Female for each selected seat.");
      return;
    }
    form.resetFields();
    setOpen(true);
  };

  const onFinishHold = async () => {
    try {
      const { customer_name, customer_phone } = await form.validateFields();
      setSubmitting(true);

      const body = {
        trip_id: tripId,
        seats: selectedSeats,
        genders: selectedSeats.map((s) => genderBySeat[s]),
        customer_name,
        customer_phone,
        expected_amount: Number(trip?.price_per_seat || 0) * selectedSeats.length,
        from_stop_id: criteria?.from_stop_id,
        to_stop_id:   criteria?.to_stop_id,
      };
      const { data } = await api.post("/bookings/hold", body);

      // Update local lock overlay so colors change immediately
      const newLocks = selectedSeats.map((s) => ({
        seat_number: Number(s),
        gender: genderBySeat[s],
        status: "RESERVED",
      }));
      setLocksLocal((prev) => [...prev, ...newLocks]);

      message.success(`Seat(s) reserved. Booking #${data.booking_id}`);
      setOpen(false);
      setSelectedSeats([]); // reset selection
      setGenderBySeat({});

      // ➜ Go to Manage Bookings after successful hold (like previous behavior)
      navigate("/manage-bookings", {
        replace: true,
        state: {
          from: "seat-selection",
          booking_id: data.booking_id,
          trip_id: tripId,
        },
      });
    } catch (e) {
      if (e?.errorFields) return; // validation
      console.error("POST /bookings/hold failed:", e);
      message.error(e?.response?.data?.error || "Failed to reserve seat(s).");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Button type="link" icon={<LeftOutlined />} onClick={back}>
          Return Back
        </Button>
        <div style={{ padding: 24, display: "grid", placeItems: "center" }}>
          <Spin />
        </div>
      </>
    );
  }

  if (!trip) {
    return (
      <>
        <Button type="link" icon={<LeftOutlined />} onClick={back}>
          Return Back
        </Button>
        <Empty description="Trip not found" />
      </>
    );
  }

  if (!totalSeats) {
    return (
      <>
        <Button type="link" icon={<LeftOutlined />} onClick={back}>
          Return Back
        </Button>
        <Empty description="No seat layout configured for this bus" />
      </>
    );
  }

  return (
    <>
      <Button type="link" icon={<LeftOutlined />} onClick={back}>
        Return Back
      </Button>

      {/* Direction displayed correctly */}
      <div style={{ marginBottom: 8 }}>
        <Title level={4} style={{ margin: 0 }}>
          {trip.origin} <span style={{ opacity: 0.6 }}>→</span> {trip.destination}
        </Title>
        <Text type="secondary">
          {depDate} | {depTime} &nbsp;·&nbsp; Price per seat: Rs {Number(trip.price_per_seat)}.00
        </Text>
      </div>

      <div style={{ display: "flex", width: "100%", gap: "1.5rem" }}>
        {/* LEFT: seat layout */}
        <div>
          <SeatSelector
            totalSeats={totalSeats}
            view="vertical"
            value={selectedSeats.map(Number)}
            onChange={(arr) => handleSeatChange(arr.map(String))}
            lockedSeats={lockedSeats}
            maxSelectable={maxSelectable}
            palette={palette}
          />

          {/* Legend */}
          <div style={{ marginTop: 12, display: "flex", gap: 16, alignItems: "center" }}>
            <Legend swatch={palette.available} label="Available" />
            <Legend swatch={palette.male} label="Booked (Male)" />
            <Legend swatch={palette.female} label="Booked (Female)" />
          </div>
        </div>

        {/* RIGHT: gender selection + final confirm */}
        <div style={{ width: 360 }}>
          <Card
            title={`Selected Seat${maxSelectable > 1 ? "s" : ""} (${selectedSeats.length}/${maxSelectable})`}
            size="small"
          >
            {selectedSeats.length === 0 ? (
              <Empty description="Pick seat(s) on the left" />
            ) : (
              <Space direction="vertical" style={{ width: "100%" }}>
                {selectedSeats.map((s) => (
                  <div
                    key={s}
                    style={{
                      display: "flex",
                      gap: 8,
                      justifyContent: "space-between",
                      alignItems: "center",
                      border: "1px solid #f0f0f0",
                      padding: "8px 12px",
                      borderRadius: 8,
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>Seat No. {s}</div>
                    <Radio.Group
                      value={genderBySeat[s]}
                      onChange={(e) => handleGenderChange(s, e.target.value)}
                      optionType="button"
                      buttonStyle="solid"
                    >
                      <Radio value="M">Male</Radio>
                      <Radio value="F">Female</Radio>
                    </Radio.Group>
                  </div>
                ))}
                <Button type="primary" block onClick={askCustomer}>
                  Confirm
                </Button>
              </Space>
            )}
          </Card>
        </div>
      </div>

      {/* Checkout modal (name + phone) */}
      <Modal
        title="Passenger Details"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={onFinishHold}
        confirmLoading={submitting}
        okText="Finish"
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            name="customer_name"
            label="Name"
            rules={[{ required: true, message: "Please enter the passenger name" }]}
          >
            <Input placeholder="John Doe" />
          </Form.Item>
          <Form.Item
            name="customer_phone"
            label="Phone Number"
            rules={[
              { required: true, message: "Please enter a phone number" },
              { pattern: /^\+?\d{9,14}$/, message: "Please enter a valid phone number" },
            ]}
          >
            <Input placeholder="+94XXXXXXXXX" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

function Legend({ swatch, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span
        style={{
          width: 14,
          height: 14,
          borderRadius: 3,
          background: swatch,
          display: "inline-block",
          border: "1px solid rgba(0,0,0,0.1)",
        }}
      />
      <span style={{ fontSize: 12, color: "#555" }}>{label}</span>
    </div>
  );
}

export default SeatSelection;
