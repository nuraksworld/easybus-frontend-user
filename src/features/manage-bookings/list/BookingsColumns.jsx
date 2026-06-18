import { Button } from "antd";

export const bookingColumns = [
  {
    title: "Booking ID",
    dataIndex: "booking_id",
    key: "booking_id",
    Width: "200",
  },
  {
    title: "Trip Type",
    dataIndex: "trip_type",
    key: "trip_type",
    Width: "120",
  },
  {
    title: "Passenger Name",
    dataIndex: "passenger_name",
    key: "passenger_name",
    Width: "200",
  },
  {
    title: "Seats",
    dataIndex: "seats",
    key: "seats",
    Width: "100",
  },
  {
    title: "Date",
    dataIndex: "dates",
    key: "dates",
    Width: "100",
  },
  {
    title: "Payment",
    dataIndex: "payment",
    key: "payment",
    width: 100,
    render: (text) => (
      <span
        className={`payment-status ${
          text === "paid" ? "green-txt" : "red-txt"
        }`}
      >
        {text}
      </span>
    ),
  },
  {
    title: "Operator",
    dataIndex: "operator",
    key: "operator",
    Width: "100",
  },
  {
    title: "",
    key: "action",
    Width: "140",
    render: () => (
      <div className="btn-wrapper">
        <Button variant="outlined" size="small" color="primary">
          Confirm
        </Button>
        <Button variant="solid" size="small" color="danger">
          Cancel
        </Button>
      </div>
    ),
  },
];
