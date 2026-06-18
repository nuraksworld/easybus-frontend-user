import React from "react";
import { Button, Form, Input, Space, Typography } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const { Text } = Typography;

const AddOperatorPopover = ({
  initialValues = {},
  submitText = "Submit",
  onSubmit,
  onClose,
}) => {
  const [form] = Form.useForm();

  const normInitial = {
    owner_name: initialValues.owner_name || "",
    phone: initialValues.phone || "",
    company_name: initialValues.company_name || "",
    buses: Array.isArray(initialValues.buses) && initialValues.buses.length
      ? initialValues.buses
      : [{ bus_number: "", driver_name: "", driver_phone: "" }],
  };

  const handleFinish = async (values) => {
    // normalize / trim
    const buses = (values.buses || [])
      .map((b) => ({
        bus_number: String(b?.bus_number || "").trim(),
        driver_name: String(b?.driver_name || "").trim(),
        driver_phone: String(b?.driver_phone || "").trim(),
      }))
      .filter((b) => b.bus_number); // keep only rows with bus number

    const payload = {
      owner_name: String(values.owner_name || "").trim(),
      phone: String(values.phone || "").trim(),
      company_name: String(values.company_name || "").trim(),
      buses,
    };

    await onSubmit(payload);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={normInitial}
      onFinish={handleFinish}
    >
      <Form.Item
        label="Owner Name"
        name="owner_name"
        rules={[{ required: true, message: "Owner name is required" }]}
      >
        <Input placeholder="Owner name" />
      </Form.Item>

      <Form.Item
        label="Phone"
        name="phone"
        rules={[
          { required: true, message: "Phone is required" },
          { pattern: /^[0-9+ ]{9,15}$/, message: "Enter a valid phone number" },
        ]}
      >
        <Input placeholder="Phone" />
      </Form.Item>

      <Form.Item label="Company Name (optional)" name="company_name">
        <Input placeholder="Company name (optional)" />
      </Form.Item>

      <Text strong>Buses</Text>
      <div style={{ marginTop: 8 }} />

      <Form.List name="buses">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }, idx) => (
              <div
                key={key}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 10,
                }}
              >
                <Space
                  direction="vertical"
                  style={{ width: "100%" }}
                  size={10}
                >
                  <Form.Item
                    {...restField}
                    label={`Bus #${idx + 1} - Bus Number`}
                    name={[name, "bus_number"]}
                    rules={[{ required: true, message: "Bus number is required" }]}
                  >
                    <Input placeholder="e.g., WP-1111" />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    label="Driver Name"
                    name={[name, "driver_name"]}
                    rules={[{ required: true, message: "Driver name is required" }]}
                  >
                    <Input placeholder="Driver name" />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    label="Driver Phone"
                    name={[name, "driver_phone"]}
                    rules={[
                      { required: true, message: "Driver phone is required" },
                      { pattern: /^[0-9]{9,12}$/, message: "Enter a valid phone number" },
                    ]}
                  >
                    <Input placeholder="077xxxxxxx" />
                  </Form.Item>

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => remove(name)}
                      disabled={fields.length === 1}
                    >
                      Remove Bus
                    </Button>
                  </div>
                </Space>
              </div>
            ))}

            <Button
              type="dashed"
              block
              icon={<PlusOutlined />}
              onClick={() => add({ bus_number: "", driver_name: "", driver_phone: "" })}
            >
              Add Another Bus
            </Button>
          </>
        )}
      </Form.List>

      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <Button type="primary" htmlType="submit" style={{ flex: 1 }}>
          {submitText}
        </Button>
        <Button onClick={onClose} style={{ flex: 1 }}>
          Cancel
        </Button>
      </div>
    </Form>
  );
};

export default AddOperatorPopover;
