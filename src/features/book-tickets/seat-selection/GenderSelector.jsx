import { Radio } from "antd";
import React from "react";

const genderOptions = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
];

const GenderSelector = ({ seatNo }) => {
  return (
    <div className="gender-selector">
      <p>
        SEAT NO. <span>{seatNo}</span>
      </p>
      <Radio.Group
        block
        options={genderOptions}
        defaultValue="Apple"
        optionType="button"
        buttonStyle="solid"
      />
    </div>
  );
};

export default GenderSelector;
