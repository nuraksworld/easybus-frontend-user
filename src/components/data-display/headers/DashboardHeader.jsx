import React from "react";

const AppHeader = ({ label }) => {
  return (
    <div className="dashboard-header">
      <h1>{label}</h1>
      {/* <div className="account-widget">
        <h6>Name</h6>
        <p>Role</p>
      </div> */}
    </div>
  );
};

export default AppHeader;
