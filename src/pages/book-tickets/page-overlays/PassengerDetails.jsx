import React from "react";
import { Button } from "antd";
import { LeftOutlined } from "@ant-design/icons";

const PassengerDetails = () => {
  return (
    <>
      <Button variant="link" color="primary" icon={<LeftOutlined />}>
        Return Back
      </Button>
    </>
  );
};

export default PassengerDetails;
