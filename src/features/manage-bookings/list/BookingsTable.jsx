import React from "react";

// Components
import { Table } from "antd";

// Columns
import { bookingColumns } from "./BookingsColumns";

// Data
import bookings from "../../../placeholder-data/bookings.json";

const BookingsTable = () => {
  const duplicateCount = 5;

  const dataSource = Array(duplicateCount)
    .fill(bookings)
    .flat()
    .map((op, index) => ({
      key: index,
      ...op,
    }));

  return (
    <Table
      columns={bookingColumns}
      dataSource={dataSource}
      pagination={false}
      scroll={{ x: "max-content" }}
    />
  );
};

export default BookingsTable;
