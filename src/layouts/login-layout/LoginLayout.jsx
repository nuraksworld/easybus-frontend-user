import React from "react";
import { Card, Form, Input, Button, Typography } from "antd";

const { Title } = Typography;

const LoginLayout = () => {
  const [form] = Form.useForm();

  const handleLogin = (values) => {
    console.log("Login values:", values);
    // 🔑 TODO: call your backend API for authentication
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f0f2f5",
      }}
    >
      <Card
        style={{ width: 400, borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
      >
        <Title level={3} style={{ textAlign: "center", marginBottom: "20px" }}>
          Login
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleLogin}
        >
          {/* Username / Email */}
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please enter your username" }]}
          >
            <Input placeholder="Enter your username" />
          </Form.Item>

          {/* Password */}
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password placeholder="Enter your password" />
          </Form.Item>

          {/* Submit */}
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginLayout;
