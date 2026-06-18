import React from "react";

const InfoBlock = ({ label, value }) => {
  return (
    <div className="info-block">
      <label>{label}</label>
      <span>{value || "N/A"}</span>
    </div>
  );
};

export default InfoBlock;
