import React, { useState } from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const SelectButton = () => {
  const [selected, setSelected] = useState(false);
  const navigate = useNavigate();

  const handleBookSeats = () => {
    navigate("/book-tickets/seat-selection"); 
  };

  const handleClick = () => {
    setSelected(!selected);
  };

  return (
    <Button
      variant={selected ? "solid" : "outlined"}
      color="primary"
      onClick={handleBookSeats}
    >
      {selected ? "Selected" : "Select"}
    </Button>
  );
};

export default SelectButton;
