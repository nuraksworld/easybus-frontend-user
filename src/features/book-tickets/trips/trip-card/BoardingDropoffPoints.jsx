import React from "react";

// Components
import { Table } from "antd";

// Columns
const columns = [
  {
    title: "Boarding Points",
    dataIndex: "boarding_points",
    key: "boarding_points",
  },
  {
    title: "Dropoff Points",
    dataIndex: "dropoff_points",
    key: "dropoff_points",
  },
];

const BoardingDropoffPoints = () => {
  // Sample Data
  const dataSource = [
    {
      key: "1",
      boarding_points: "Vavuniya Bus Stand",
      dropoff_points: "Colombo Fort",
    },
    {
      key: "2",
      boarding_points: "Anuradhapura Central",
      dropoff_points: "Pettah Market",
    },
    {
      key: "3",
      boarding_points: "Dambulla Junction",
      dropoff_points: "Bambalapitiya",
    },
    {
      key: "4",
      boarding_points: "Kurunegala Bus Station",
      dropoff_points: "Colombo Station",
    },
    {
      key: "5",
      boarding_points: "Kegalle Bus Stand",
      dropoff_points: "Narahenpita",
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      pagination={false}
      scroll={{ x: "max-content" }}
      size="small"
      bordered
    />
  );
};

export default BoardingDropoffPoints;
