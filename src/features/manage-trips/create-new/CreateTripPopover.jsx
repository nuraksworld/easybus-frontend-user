import React from "react";
import { Form, Input, Button, Select, DatePicker } from "antd";

const { Option } = Select;

const CreateTripPopover = ({ onClose }) => {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    console.log("Trip Created:", values);
    onClose(); // Close modal after submit
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      {/* Route */}
      <Form.Item
        label="Route"
        name="route"
        rules={[{ required: true, message: "Please select a route" }]}
      >
        <Select placeholder="Select Route">
          <Option value="Colombo - Kandy">Colombo - Kandy</Option>
          <Option value="Colombo - Jaffna">Colombo - Jaffna</Option>
          <Option value="Kandy - Nuwara Eliya">Kandy - Nuwara Eliya</Option>
        </Select>
      </Form.Item>

      {/* Bus No */}
      <Form.Item
        label="Bus No"
        name="bus_no"
        rules={[{ required: true, message: "Please select a bus" }]}
      >
        <Select placeholder="Select Bus">
          <Option value="NB-1234">NB-1234</Option>
          <Option value="KB-5678">KB-5678</Option>
        </Select>
      </Form.Item>

      {/* Operator */}
      <Form.Item
        label="Operator"
        name="operator"
        rules={[{ required: true, message: "Please select operator" }]}
      >
        <Select placeholder="Select Operator">
          <Option value="Operator A">Operator A</Option>
          <Option value="Operator B">Operator B</Option>
        </Select>
      </Form.Item>

      {/* Date */}
      <Form.Item
        label="Date"
        name="date"
        rules={[{ required: true, message: "Please pick a date" }]}
      >
        <DatePicker style={{ width: "100%" }} />
      </Form.Item>

      {/* No. of Seats */}
      <Form.Item
        label="No. of Seats"
        name="seats"
        rules={[{ required: true, message: "Please enter number of seats" }]}
      >
        <Input type="number" placeholder="Enter number of seats" />
      </Form.Item>

      {/* Price */}
      <Form.Item
        label="Price"
        name="price"
        rules={[{ required: true, message: "Please enter price" }]}
      >
        <Input type="number" placeholder="Enter price" />
      </Form.Item>

      {/* Contact No */}
      <Form.Item
        label="Contact No"
        name="contact_no"
        rules={[{ required: true, message: "Please enter contact number" }]}
      >
        <Input placeholder="Enter contact number" />
      </Form.Item>

      {/* Submit */}
      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Create Trip
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CreateTripPopover;
