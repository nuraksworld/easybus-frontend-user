import React, { useState } from "react";
import { Card, Input, Button, Space, message } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://192.168.1.24:3000/api";

export default function OtpLogin() {
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  async function sendOtp() {
    if (!phone) return messageApi.error("Enter your phone number");
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/user/send-otp`, { phone });
      if (res.data.success) {
        messageApi.success("OTP sent successfully");
        setStep("otp");
      }
    } catch {
      messageApi.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    if (!otp) return messageApi.error("Enter the OTP");
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/user/verify-otp`, { phone, otp });
      if (res.data.needName) setStep("name");
      else if (res.data.token) {
        localStorage.setItem("easybus_token", res.data.token);
        localStorage.setItem("easybus_user", JSON.stringify(res.data.user));
        messageApi.success("Welcome back!");
        navigate("/book-tickets");
      }
    } catch (err) {
      messageApi.error(err.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  }

  async function saveName() {
    if (!name) return messageApi.error("Please enter your name");
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/user/complete-profile`, {
        phone,
        name,
      });
      if (res.data.token) {
        localStorage.setItem("easybus_token", res.data.token);
        localStorage.setItem("easybus_user", JSON.stringify(res.data.user));
        messageApi.success("Account created successfully!");
        navigate("/book-tickets");
      }
    } catch {
      messageApi.error("Failed to create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
    style={{
      minHeight: "100vh",
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#b7dcff",
      backgroundImage:
        "radial-gradient(circle at 20% 10%, #8fc5ff 0%, transparent 35%), radial-gradient(circle at 80% 30%, #a7d4ff 0%, transparent 40%), linear-gradient(135deg, #7fbfff 0%, #cfe6ff 55%, #f2f9ff 100%)",
      // Hard override if any global css forces white
      backgroundRepeat: "no-repeat",
    }}
  >
      {contextHolder}

      <Card
        title="EasyBus Login"
        style={{
          width: 360,
          borderRadius: 14,
          boxShadow: "0 14px 40px rgba(0, 70, 140, 0.25)",
        }}
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          {step === "phone" && (
            <>
              <Input
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Button type="primary" block onClick={sendOtp} loading={loading}>
                Send OTP
              </Button>
            </>
          )}

          {step === "otp" && (
            <>
              <Input
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <Button type="primary" block onClick={verifyOtp} loading={loading}>
                Verify OTP
              </Button>
              <Button type="link" onClick={() => setStep("phone")}>
                Change phone number
              </Button>
            </>
          )}

          {step === "name" && (
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
