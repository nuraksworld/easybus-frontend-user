// src/pages/book-tickets/BookTickets.jsx
import { useEffect, useState } from "react";
import { Tabs } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { DashboardLayout } from "../../layouts";
import { DashboardHeader } from "../../components";
import Trips from "./page-overlays/Trips";
import ManageBookings from "../manage-bookings/ManageBookings";

const BookTickets = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState(location.state?.tab || "book");

  useEffect(() => {
    const token = localStorage.getItem("easybus_token");
    const storedUser = localStorage.getItem("easybus_user");

    if (!token || !storedUser) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const handleBookingComplete = () => {
    setActiveTab("myBookings");
  };

  return (
    // ✅ hide sidebar for user booking flow
    <DashboardLayout showSidebar={false}>
      <DashboardHeader
        label={
          user
            ? `Book Tickets (${user.name || "Guest"} - ${user.phone})`
            : "Book Tickets"
        }
      />

      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        items={[
          {
            key: "book",
            label: "Book Tickets",
            children: (
              <Trips user={user} onBookingComplete={handleBookingComplete} />
            ),
          },
          {
            key: "myBookings",
            label: "My Bookings",
            children: <ManageBookings user={user} />,
          },
        ]}
        style={{ padding: "0 16px" }}
      />
    </DashboardLayout>
  );
};

export default BookTickets;
