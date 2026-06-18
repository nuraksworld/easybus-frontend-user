import React, { useState } from "react";
import { Card, Input, Button, Space, message } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://192.168.1.24:3000/api";

const LoginPage = () => {
  const [step, setStep] = useState("phone"); // phone | otp | name
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  // Step 1 — Send OTP
  const sendOtp = async () => {
    if (!phone) return messageApi.error("Please enter your phone number");
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/user/send-otp`, { phone });
      if (res.data.success) {
        messageApi.success("OTP sent successfully");
        setStep("otp");
      }
    } catch (err) {
      console.error(err);
      messageApi.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — Verify OTP
  const verifyOtp = async () => {
    if (!otp) return messageApi.error("Please enter the OTP");
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/user/verify-otp`, { phone, otp });

      if (res.data.needName) {
        setStep("name"); // new user
      } else if (res.data.token) {
        localStorage.setItem("easybus_token", res.data.token);
        localStorage.setItem("easybus_user", JSON.stringify(res.data.user));
        messageApi.success("Welcome back!");
        navigate("/book-tickets");
      }
    } catch (err) {
      console.error(err);
      messageApi.error(err.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 3 — Complete Profile (New user)
  const completeProfile = async () => {
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
    } catch (err) {
      console.error(err);
      messageApi.error("Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      {contextHolder}
      <Card title="Book My Seat Login" style={{ width: 360 }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          {step === "phone" && (
            <>
              <Input
                placeholder="Enter your phone number"
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
              <Button type="primary" block onClick={completeProfile} loading={loading}>
                Save & Continue
              </Button>
            </>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default LoginPage;
