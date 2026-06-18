import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import { BookTickets, ManageBookings, ManageOperators, ManageTrips } from "./pages";
import SeatSelection from "./pages/book-tickets/page-overlays/SeatSelection";
import "./styles/App.scss";

function RequireAuth({ children }) {
  const token = localStorage.getItem("easybus_token");
  const loc = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: loc }} replace />;
  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

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
        <Route path="*" element={<h2>Page Not Found</h2>} />
      </Routes>
    </Router>
  );
}
