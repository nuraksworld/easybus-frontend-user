import React from "react";

// Components
import { Table } from "antd";

// Columns
import { tripColumns } from "./TripsColumns";

// Data
import trips from "../../../placeholder-data/trips.json";

const TripsTable = () => {
  const duplicateCount = 5;

  const dataSource = Array(duplicateCount)
    .fill(trips)
    .flat()
    .map((op, index) => ({
      key: index,
      ...op,
    }));

  return (
    <Table
      columns={tripColumns}
      dataSource={dataSource}
      pagination={false}
      scroll={{ x: "max-content" }}
    />
  );
};

export default TripsTable;
