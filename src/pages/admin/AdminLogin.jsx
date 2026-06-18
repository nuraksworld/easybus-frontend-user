import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api, setAuthToken } from "../../api";
import { Card, Input, Button, Space, message } from "antd";

export default function AdminLogin() {
  const [username, setU] = useState("super");
  const [password, setP] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();

  async function login() {
    setLoading(true);
    try {
      const { data } = await api.post("/admin/login", { username, password });
      setAuthToken(data.token);                // persist token
      message.success(`Welcome ${data.full_name}`);
      // go back to intended page or admin home
      const to = loc.state?.from?.pathname || "/admin/bookings";
      nav(to, { replace: true });
    } catch (e) {
      message.error(e?.response?.data?.error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display:"grid", placeItems:"center", minHeight:"60vh" }}>
      <Card title="Admin Login" style={{ width: 360 }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setU(e.target.value)}
          />
          <Input.Password
            placeholder="Password"
            value={password}
            onChange={(e) => setP(e.target.value)}
          />
          <Button type="primary" block loading={loading} onClick={login}>
            Login
          </Button>
        </Space>
      </Card>
    </div>
  );
}
