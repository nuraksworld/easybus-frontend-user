import React from "react";
import { InfoBlock } from "../../../../components";

const VehicleInformation = ({ busType, busModel, busRegNo, busDriverName }) => {
  return (
    <div className="vehicle-information-container">
      <InfoBlock label="Bus Type" value={busType} />
      <InfoBlock label="Model" value={busModel} />
      <InfoBlock label="Reg No." value={busRegNo} />
      <InfoBlock label="Driver Name" value={busDriverName} />
    </div>
  );
};

export default VehicleInformation;
