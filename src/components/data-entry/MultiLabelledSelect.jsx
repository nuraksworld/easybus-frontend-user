import React from "react";
import { Select } from "antd";

const MultiLabelledSelect = ({
  topLabels = [],
  bottomLabels = [],
  options = [],
  ...selectProps
}) => {
  return (
    <div className="multi-labelled-select">
      {topLabels.length > 0 && (
        <div className="top-labels-wrapper">
          {topLabels.map((label, index) => (
            <p key={`top-${index}`}>{label}</p>
          ))}
        </div>
      )}

      <Select
        {...selectProps}
        options={options}
        bordered={false}
        className="borderless-select"
      />

      {bottomLabels.length > 0 && (
        <div className="bottom-labels-wrapper">
          {bottomLabels.map((label, index) => (
            <p key={`bottom-${index}`}>{label}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiLabelledSelect;
