// Layout
import { DashboardLayout } from "../../layouts";

// Components
import { DashboardHeader } from "../../components";

// Page Overlays
import Trips from "./page-overlays/Trips";
import SeatSelection from "./page-overlays/SeatSelection";
import PassengerDetails from "./page-overlays/PassengerDetails";

// Features

const BookTickets = () => {
  return (
    <DashboardLayout>
      <DashboardHeader label="Book Tickets" />
      <Trips />
    </DashboardLayout>
  );
};

export default BookTickets;
