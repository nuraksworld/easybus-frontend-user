// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import LoginPage from "./pages/auth/LoginPage";
import SeatSelection from "./pages/book-tickets/page-overlays/SeatSelection";

import {
  BookTickets,
  ManageBookings,
  ManageOperators,
  ManageTrips,
} from "./pages";

import AddDriver from "./pages/add-driver/AddDriver";

import "./styles/App.scss";

// Guard
function RequireAuth({ children }) {
  const token = localStorage.getItem("easybus_token");
  const loc = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: loc }} replace />;
  return children;
}

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Landing */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route
          path="/book-tickets"
          element={
            <RequireAuth>
              <BookTickets />
            </RequireAuth>
          }
        />

        <Route
          path="/book-tickets/seat-selection"
          element={
            <RequireAuth>
              <SeatSelection />
            </RequireAuth>
          }
        />

        <Route
          path="/manage-bookings"
          element={
            <RequireAuth>
              <ManageBookings />
            </RequireAuth>
          }
        />

        <Route
          path="/manage-operators"
          element={
            <RequireAuth>
              <ManageOperators />
            </RequireAuth>
          }
        />

        <Route
          path="/manage-trips"
          element={
            <RequireAuth>
              <ManageTrips />
            </RequireAuth>
          }
        />

        <Route
          path="/add-driver"
          element={
            <RequireAuth>
              <AddDriver />
            </RequireAuth>
          }
        />

        <Route path="*" element={<h2>Not Found</h2>} />
      </Routes>
    </Router>
  );
};

export default App;
