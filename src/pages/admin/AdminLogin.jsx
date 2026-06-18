// ✅ src/pages/LoginPage.jsx  (replace everything in this file)

import { useState } from "react";
import { Card, Input, Button, Space, message } from "antd";
import { api, setAuthToken } from "../api";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [step, setStep] = useState(1);   // 1 = phone, 2 = otp, 3 = name
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 👉 Step 1: Send OTP
  async function sendOtp() {
    if (!/^[0-9]{10}$/.test(phone)) {
      message.warning("Enter a valid 10-digit phone number");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/user/send-otp", { phone });
      // backend should respond { exists: true/false }
      message.success("OTP sent to your phone");
      setStep(2);
    } catch (e) {
      message.error(e?.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  // 👉 Step 2: Verify OTP
  async function verifyOtp() {
    if (!otp) return message.warning("Enter OTP");
    setLoading(true);
    try {
      const { data } = await api.post("/user/verify-otp", { phone, otp });
      if (data?.needName) setStep(3);
      else finishLogin(data);
    } catch (e) {
      message.error(e?.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  }

  // 👉 Step 3: Save Name (for new user)
  async function saveName() {
    if (!name.trim()) return message.warning("Enter your name");
    setLoading(true);
    try {
      const { data } = await api.post("/user/complete-profile", { phone, name });
      finishLogin(data);
    } catch (e) {
      message.error(e?.response?.data?.error || "Failed to save name");
    } finally {
      setLoading(false);
    }
  }

  // 👉 Common finish
  function finishLogin(data) {
    setAuthToken(data.token);
    localStorage.setItem("user_phone", phone);
    localStorage.setItem("user_name", data.user?.name || name || "");
    message.success("Login successful");
    navigate("/book-tickets");
  }

  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "70vh" }}>
      <Card title="EasyBus Login" style={{ width: 360 }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          {step === 1 && (
            <>
              <Input
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Button type="primary" block onClick={sendOtp} loading={loading}>
                Send OTP
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <Input
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <Button type="primary" block onClick={verifyOtp} loading={loading}>
                Verify OTP
              </Button>
              <Button type="link" onClick={() => setStep(1)}>
                Change phone number
              </Button>
            </>
          )}

          {step === 3 && (
            <>
              <Input
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Button type="primary" block onClick={saveName} loading={loading}>
                Save & Continue
              </Button>
            </>
          )}
        </Space>
      </Card>
    </div>
  );
}
