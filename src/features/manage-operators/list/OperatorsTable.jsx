import React from "react";
import { Table } from "antd";
import { operatorColumns } from "./OperatorsColumns";

const OperatorsTable = ({ data }) => {
  return (
    <Table
      columns={operatorColumns}
      dataSource={data}
      pagination={false}
      scroll={{ x: "max-content" }}
    />
  );
};

export default OperatorsTable;
