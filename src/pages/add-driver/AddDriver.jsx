import React from "react";

// Layout
import { DashboardLayout } from "../../layouts";

// Components
import { DashboardHeader } from "../../components";

// Page Overlays
import AddDriverForm from "./page-overlays/AddDriverForm";

const AddDriver = () => {
  return (
    <DashboardLayout>
      <DashboardHeader label="Add Driver" />
      <AddDriverForm />
    </DashboardLayout>
  );
};

export default AddDriver;
