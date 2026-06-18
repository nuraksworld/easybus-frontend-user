import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, Input, Button, Space, message } from "antd";
import { api, setAuthToken } from "../../api";

const LoginPage = () => {
  const [username, setUsername] = useState("super");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogin() {
    setLoading(true);
    try {
      const { data } = await api.post("/admin/login", { username, password });
      setAuthToken(data.token); // saves JWT into localStorage
      message.success(`Welcome ${data.full_name}`);
      // If user came from a protected page, go back there
      const to = location.state?.from?.pathname || "/book-tickets";
      navigate(to, { replace: true });
    } catch (err) {
      message.error(err?.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", placeItems: "center", height: "100vh" }}>
      <Card title="EasyBus Admin Login" style={{ width: 360 }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input.Password
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="primary"
            block
            onClick={handleLogin}
            loading={loading}
          >
            Login
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default LoginPage;
