import React from "react";
import { Button } from "antd";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

const DropdownButton = ({ label, selected, onClick }) => {
  const icon = selected ? (
    <KeyboardArrowUp fontSize="small" />
  ) : (
    <KeyboardArrowDown fontSize="small" />
  );

  return (
    <Button
      type={selected ? "primary" : "text"}
      shape="round"
      size="small"
      onClick={onClick}
      style={{ fontSize: "0.9rem" }}
      className="dropdown-btn"
    >
      {label}
      {icon}
    </Button>
  );
};

export default DropdownButton;
