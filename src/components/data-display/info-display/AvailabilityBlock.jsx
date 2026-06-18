import React from "react";
import { Check, Close } from "@mui/icons-material";

const AvailabilityBlock = ({ value, availability }) => {
  const isAvailable = availability?.toLowerCase() === "available";

  return (
    <div className="availability-block">
      <div
        className={`availability-icon ${
          isAvailable ? "available" : "unavailable"
        }`}
      >
        {isAvailable ? <Check fontSize="small" /> : <Close fontSize="small" />}
      </div>
      <span
        className={`availability-value ${
          isAvailable ? "available" : "unavailable"
        }`}
      >
        {value}
      </span>
    </div>
  );
};

export default AvailabilityBlock;
