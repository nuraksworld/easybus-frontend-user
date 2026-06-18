import React, { useState } from "react";

const steeringIconSvg = (
  <svg
    className="steering-icon"
    width="18"
    height="19"
    viewBox="0 0 18 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12.75 2.98316C13.8902 3.64143 14.8369 4.58822 15.4952 5.72837C16.1535 6.86852 16.5 8.16187 16.5 9.4784C16.5 10.7949 16.1534 12.0883 15.4952 13.2284C14.8369 14.3686 13.8901 15.3153 12.7499 15.9736C11.6098 16.6318 10.3164 16.9784 8.99988 16.9784C7.68335 16.9783 6.39001 16.6318 5.24988 15.9735C4.10974 15.3152 3.16297 14.3684 2.50473 13.2282C1.84648 12.088 1.49997 10.7947 1.5 9.47816L1.50375 9.23516C1.54575 7.9399 1.92266 6.67763 2.59773 5.5714C3.2728 4.46518 4.22299 3.55275 5.35567 2.92307C6.48835 2.29339 7.76486 1.96796 9.06075 1.97849C10.3566 1.98902 11.6277 2.33516 12.75 2.98316ZM3 9.47816C3.00005 10.9395 3.53344 12.3507 4.50006 13.4467C5.46669 14.5427 6.80009 15.2482 8.25 15.4309V11.6007C7.9058 11.4791 7.59636 11.2756 7.34836 11.0077C7.10036 10.7399 6.92125 10.4157 6.8265 10.0632L3.024 8.93516C3.0085 9.11516 3.0005 9.29641 3 9.47891M14.9752 8.93516L11.1735 10.0624C11.0789 10.415 10.9 10.7393 10.6521 11.0073C10.4042 11.2753 10.0949 11.4789 9.75075 11.6007V15.4317C11.2629 15.2411 12.6459 14.4822 13.6188 13.3091C14.5918 12.1359 15.0819 10.6365 14.9895 9.11516L14.9752 8.93516ZM6 4.28216C4.76611 4.99462 3.82603 6.12293 3.348 7.46516L6.957 8.53466C7.13709 8.14437 7.42521 7.81383 7.78726 7.58215C8.14932 7.35047 8.57016 7.22734 9 7.22734C9.42984 7.22734 9.85068 7.35047 10.2127 7.58215C10.5748 7.81383 10.8629 8.14437 11.043 8.53466L14.652 7.46516C14.3569 6.63654 13.8831 5.88295 13.2644 5.25776C12.6456 4.63258 11.897 4.15108 11.0715 3.84738C10.2459 3.54368 9.36373 3.4252 8.48734 3.50033C7.61094 3.57547 6.76178 3.84238 6 4.28216Z"
      fill="currentColor"
    />
  </svg>
);

const BusSeat = ({
  state = "available",
  seatNo = "",
  selectable = true,
  view = "horizontal",
}) => {
  const [selected, setSelected] = useState(false);
  const isSelectable = state === "available" && selectable;

  const classNames = ["bus-seat", state, view];
  if (isSelectable && selected) classNames.push("selected");
  if (!selectable) classNames.push("not-selectable");

  const handleClick = () => {
    if (!isSelectable) return;
    setSelected((prev) => !prev);
  };

  return (
    <div
      className={classNames.join(" ")}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleClick();
      }}
    >
      <div className="headrest" />
      {state === "driver" ? (
        steeringIconSvg
      ) : (
        <p className="seat-no">{seatNo}</p>
      )}
    </div>
  );
};

export default BusSeat;
