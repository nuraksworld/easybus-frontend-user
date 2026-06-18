import React, { useEffect, useMemo, useState } from "react";
import { Card, Table, Button, Space, Input, message } from "antd";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import { api } from "../../../api"; // src/pages/add-driver/page-overlays/AddDriverForm.jsx -> src/api.js

function toCsv(rows) {
  const headers = ["Name", "Phone"];
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [
    headers.join(","),
    ...rows.map((r) => [esc(r.name), esc(r.phone)].join(",")),
  ];
  return "\uFEFF" + lines.join("\n");
}

function downloadCsv(filename, csvText) {
  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const AddDriverForm = () => {
  console.log(">>> AddDriverForm MOUNTED <<<");

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");

  // ✅ backend endpoint: GET /api/admin/users
  // axios baseURL already includes /api, so we call /admin/users
  const USERS_ENDPOINT = "/admin/users";

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await api.get(USERS_ENDPOINT);

      console.log("API STATUS:", res.status);
      console.log("API DATA:", res.data);

      // ✅ normalize response to array
      const raw = res.data;
      const list =
        Array.isArray(raw) ? raw :
        Array.isArray(raw?.data) ? raw.data :
        Array.isArray(raw?.rows) ? raw.rows :
        [];

      setUsers(
        list.map((u) => ({
          key: u.user_id ?? u.id ?? `${u.phone}-${u.name}`,
          name: u.name ?? "",
          phone: u.phone ?? "",
        }))
      );
    } catch (e) {
      console.log("API ERROR:", e?.response?.status, e?.response?.data || e?.message);
      message.error(e?.response?.data?.message || "API failed");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log(">>> useEffect fired <<<");
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const safeUsers = Array.isArray(users) ? users : [];
    const s = q.trim().toLowerCase();
    if (!s) return safeUsers;
    return safeUsers.filter(
      (u) =>
        String(u.name).toLowerCase().includes(s) ||
        String(u.phone).toLowerCase().includes(s)
    );
  }, [users, q]);

  const columns = [
    { title: "Name", dataIndex: "name", key: "name", ellipsis: true },
    { title: "Phone", dataIndex: "phone", key: "phone", width: 180 },
  ];

  return (
    <Card
      title="Users"
      extra={
        <Space>
          <Input
            placeholder="Search name or phone"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            allowClear
            style={{ width: 220 }}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchUsers} loading={loading}>
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => downloadCsv("users.csv", toCsv(filtered))}
            disabled={!filtered.length}
          >
            Download CSV
          </Button>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={filtered}
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
      />
    </Card>
  );
};

export default AddDriverForm;
