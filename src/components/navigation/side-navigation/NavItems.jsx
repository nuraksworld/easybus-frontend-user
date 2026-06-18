import React from "react";
import { UserOutlined } from "@ant-design/icons";

import {
  TicketIconOutlined,
  BookingsIconOutlined,
  OperatorsIconOutlined,
  TripsIconOutlined,
} from "../../general/icons";

const navItems = [
  { key: "book-tickets", label: "Book Tickets", icon: <TicketIconOutlined /> },
  { key: "manage-bookings", label: "Manage Bookings", icon: <BookingsIconOutlined /> },
  { key: "manage-operators", label: "Manage Operators", icon: <OperatorsIconOutlined /> },
  { key: "manage-trips", label: "Manage Trips", icon: <TripsIconOutlined /> },
  { key: "add-driver", label: "View Users", icon: <UserOutlined /> }, // ✅
];

export default navItems;
