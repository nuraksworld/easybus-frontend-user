import { Button } from "antd";

export const operatorColumns = [
  {
    title: "Operator Name",
    dataIndex: "name",
    key: "name",
    Width: "200",
  },
  {
    title: "Mobile",
    dataIndex: "mobile",
    key: "mobile",
    Width: "120",
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
    Width: "200",
  },
  {
    title: "No. of Buses",
    dataIndex: "number_of_buses",
    key: "number_of_buses",
    Width: "100",
  },
  {
    title: "",
    key: "action",
    Width: "70",
    render: () => (
      <Button size="small" color="danger">
        Remove
      </Button>
    ),
  },
];
