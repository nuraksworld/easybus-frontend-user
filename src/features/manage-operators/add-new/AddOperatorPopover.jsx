import React from "react";
import { Button, Form, Input, Space } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";

/**
 * Form for creating/updating an Operator + its buses.
 *
 * Expected props:
 * - initialValues?: { owner_name, phone, company_name?, bus_numbers?: string[] }
 * - submitText?: string ("Create" | "Update")
 * - onSubmit(values): Promise<void> | void
 * - onClose(): void
 */
const AddOperatorPopover = ({ initialValues, submitText = "Create", onSubmit, onClose }) => {
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        owner_name: initialValues?.owner_name || "",
        phone: initialValues?.phone || "",
        company_name: initialValues?.company_name || "",
        bus_numbers: initialValues?.bus_numbers?.length ? initialValues.bus_numbers : [""],
      }}
      onFinish={async (values) => {
        // normalize bus numbers: trim + remove blanks
        const nums = (values.bus_numbers || [])
          .map((n) => String(n || "").trim())
          .filter(Boolean);
        const payload = {
          owner_name: values.owner_name.trim(),
          phone: values.phone.trim(),
          company_name: values.company_name?.trim() || values.owner_name.trim(),
          bus_numbers: nums,
        };
        await onSubmit?.(payload);
      }}
    >
      <Form.Item
        label="Owner Name"
        name="owner_name"
        rules={[{ required: true, message: "Please enter owner name" }]}
      >
        <Input placeholder="e.g., Nuwan Perera" />
      </Form.Item>

      <Form.Item
        label="Phone"
        name="phone"
        rules={[
          { required: true, message: "Please enter phone number" },
          { pattern: /^[0-9+\-\s]{7,20}$/, message: "Invalid phone format" },
        ]}
      >
        <Input placeholder="e.g., 07XXXXXXXX" />
      </Form.Item>

      <Form.Item label="Company (optional)" name="company_name">
        <Input placeholder="e.g., SilverLine Coaches" />
      </Form.Item>

      <Form.List name="bus_numbers">
        {(fields, { add, remove }) => (
          <>
            <label style={{ fontWeight: 600, marginBottom: 6, display: "inline-block" }}>
              Bus Numbers (one owner can have multiple)
            </label>
            {fields.map(({ key, name, ...restField }) => (
              <Space key={key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                <Form.Item
                  {...restField}
                  name={name}
                  rules={[{ required: true, message: "Enter bus number or remove the row" }]}
                >
                  <Input placeholder="e.g., WP-1234 / ND-8890" />
                </Form.Item>
                {fields.length > 1 && (
                  <MinusCircleOutlined onClick={() => remove(name)} style={{ color: "#ff4d4f" }} />
                )}
              </Space>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                Add Another Bus
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>

      <Form.Item style={{ marginTop: 16 }}>
        <Space>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit">{submitText}</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default AddOperatorPopover;
