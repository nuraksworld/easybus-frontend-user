import React, { useEffect, useMemo, useState, useCallback } from "react";
import { DashboardLayout } from "../../layouts";
import { DashboardHeader } from "../../components";
import { Button, Input, Modal, message, Popconfirm, Table, Tag, Space } from "antd";
import AddOperatorPopover from "../../features/manage-operators/add-new/AddOperatorPopover";
import { api } from "../../api"; // axios instance with baseURL

const ManageOperators = () => {
  const [searchText, setSearchText] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [operators, setOperators] = useState([]);
  const [buses, setBuses] = useState([]);
  const [editing, setEditing] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [ops, bs] = await Promise.all([api.get("/operators"), api.get("/buses")]);
      setOperators(ops.data || []);
      setBuses(bs.data || []);
    } catch (e) {
      message.error(e?.response?.data?.error || "Failed to load operators/buses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Map operator_id -> array of buses
  const busesByOperator = useMemo(() => {
    const map = new Map();
    for (const b of buses) {
      const arr = map.get(b.operator_id) || [];
      arr.push(b);
      map.set(b.operator_id, arr);
    }
    return map;
  }, [buses]);

  // CREATE
  const createOperator = async (values) => {
    // values: { owner_name, phone, company_name?, buses: [{bus_number, driver_name, driver_phone}] }
    try {
      // 1) create operator
      const { data } = await api.post("/operators", {
        company_name: values.company_name || values.owner_name, // fallback
        owner_name: values.owner_name,
        phone: values.phone,
      });

      const operator_id = data.operator_id;

      // 2) create buses (bus_number + driver details)
      const busList = (values.buses || [])
        .map((b) => ({
          bus_number: String(b.bus_number || "").trim(),
          driver_name: String(b.driver_name || "").trim(),
          driver_phone: String(b.driver_phone || "").trim(),
        }))
        .filter((b) => b.bus_number);

      if (busList.length) {
        await Promise.all(
          busList.map((b) =>
            api.post("/buses", {
              operator_id,
              bus_number: b.bus_number,
              bus_name: null,
              ac_type: "NON_AC",
              total_seats: 45,
              driver_name: b.driver_name || null,
              driver_phone: b.driver_phone || null,
            })
          )
        );
      }

      message.success("Operator created");
      setIsCreateOpen(false);
      await loadAll();
    } catch (e) {
      message.error(e?.response?.data?.error || "Failed to create operator");
    }
  };

  // UPDATE (operator + reconcile buses)
  const updateOperator = async (operator_id, values) => {
    try {
      // 1) update operator fields
      await api.put(`/operators/${operator_id}`, {
        company_name: values.company_name || values.owner_name,
        owner_name: values.owner_name,
        phone: values.phone,
      });

      const existing = busesByOperator.get(operator_id) || [];

      const existingByNum = new Map(
        existing.map((b) => [String(b.bus_number).trim(), b])
      );

      const incoming = (values.buses || [])
        .map((b) => ({
          bus_number: String(b.bus_number || "").trim(),
          driver_name: String(b.driver_name || "").trim(),
          driver_phone: String(b.driver_phone || "").trim(),
        }))
        .filter((b) => b.bus_number);

      const incomingNums = new Set(incoming.map((b) => b.bus_number));

      // to delete (existing not in incoming)
      const toDel = existing.filter(
        (b) => !incomingNums.has(String(b.bus_number).trim())
      );

      // to add (incoming not in existing)
      const toAdd = incoming.filter(
        (b) => !existingByNum.has(b.bus_number)
      );

      // to "update" (same bus_number but driver fields changed)
      // We do DELETE + CREATE to avoid needing PUT /buses/:id
      const toRecreate = incoming
        .map((b) => {
          const old = existingByNum.get(b.bus_number);
          if (!old) return null;

          const oldName = (old.driver_name || "").trim();
          const oldPhone = (old.driver_phone || "").trim();

          const changed =
            oldName !== (b.driver_name || "").trim() ||
            oldPhone !== (b.driver_phone || "").trim();

          if (!changed) return null;

          return { oldBusId: old.bus_id, ...b };
        })
        .filter(Boolean);

      // delete removed buses
      await Promise.all(toDel.map((b) => api.delete(`/buses/${b.bus_id}`)));

      // recreate changed buses (delete old then create new)
      await Promise.all(
        toRecreate.map(async (b) => {
          await api.delete(`/buses/${b.oldBusId}`);
          return api.post("/buses", {
            operator_id,
            bus_number: b.bus_number,
            bus_name: null,
            ac_type: "NON_AC",
            total_seats: 45,
            driver_name: b.driver_name || null,
            driver_phone: b.driver_phone || null,
          });
        })
      );

      // add new buses
      await Promise.all(
        toAdd.map((b) =>
          api.post("/buses", {
            operator_id,
            bus_number: b.bus_number,
            bus_name: null,
            ac_type: "NON_AC",
            total_seats: 45,
            driver_name: b.driver_name || null,
            driver_phone: b.driver_phone || null,
          })
        )
      );

      message.success("Operator updated");
      setIsEditOpen(false);
      setEditing(null);
      await loadAll();
    } catch (e) {
      message.error(e?.response?.data?.error || "Failed to update operator");
    }
  };

  // DELETE operator
  const deleteOperator = async (operator_id) => {
    try {
      await api.delete(`/operators/${operator_id}`);
      message.success("Operator deleted");
      await loadAll();
    } catch (e) {
      message.error(e?.response?.data?.error || "Failed to delete operator");
    }
  };

  // Filter
  const filtered = useMemo(() => {
    if (!searchText) return operators;
    const q = searchText.toLowerCase();
    return operators.filter(
      (op) =>
        op.company_name?.toLowerCase().includes(q) ||
        op.owner_name?.toLowerCase().includes(q) ||
        op.phone?.toLowerCase().includes(q)
    );
  }, [operators, searchText]);

  const columns = [
    { title: "ID", dataIndex: "operator_id", key: "operator_id", width: 80 },
    { title: "Owner Name", dataIndex: "owner_name", key: "owner_name" },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    { title: "Company", dataIndex: "company_name", key: "company_name" },
    {
      title: "Buses (Bus | Driver | Phone)",
      key: "buses",
      render: (_, r) => {
        const list = busesByOperator.get(r.operator_id) || [];
        if (!list.length) return <Tag>None</Tag>;

        return (
          <Space direction="vertical" size={6}>
            {list.map((b) => (
              <Tag key={b.bus_id}>
                {b.bus_number} | {b.driver_name || "No Driver"} | {b.driver_phone || "No Phone"}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 220,
      render: (_, r) => (
        <>
          <Button
            size="small"
            onClick={() => {
              const list = busesByOperator.get(r.operator_id) || [];
              setEditing({
                ...r,
                buses: list.map((b) => ({
                  bus_number: String(b.bus_number || ""),
                  driver_name: b.driver_name || "",
                  driver_phone: b.driver_phone || "",
                })),
              });
              setIsEditOpen(true);
            }}
          >
            Edit
          </Button>

          <Popconfirm
            title="Delete operator?"
            okText="Delete"
            okType="danger"
            onConfirm={() => deleteOperator(r.operator_id)}
          >
            <Button danger size="small" style={{ marginLeft: 8 }}>
              Delete
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <DashboardHeader label="Manage Operators" />

      <div className="action-bar" style={{ display: "flex", gap: 10, padding: 10, flexWrap: "wrap" }}>
        <Input
          placeholder="Search by owner / phone / company"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ maxWidth: 320 }}
          allowClear
        />
        <Button type="primary" onClick={() => setIsCreateOpen(true)}>
          Add New Operator
        </Button>
        <Button onClick={loadAll} loading={loading}>
          Refresh
        </Button>
      </div>

      <Table
        rowKey="operator_id"
        columns={columns}
        dataSource={filtered}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* Create */}
      <Modal
        title="Add New Operator"
        open={isCreateOpen}
        onCancel={() => setIsCreateOpen(false)}
        footer={null}
        destroyOnClose
      >
        <AddOperatorPopover
          submitText="Create"
          onClose={() => setIsCreateOpen(false)}
          onSubmit={createOperator}
        />
      </Modal>

      {/* Edit */}
      <Modal
        title={editing ? `Edit Operator #${editing.operator_id}` : "Edit Operator"}
        open={isEditOpen}
        onCancel={() => {
          setIsEditOpen(false);
          setEditing(null);
        }}
        footer={null}
        destroyOnClose
      >
        <AddOperatorPopover
          initialValues={editing || {}}
          submitText="Update"
          onClose={() => {
            setIsEditOpen(false);
            setEditing(null);
          }}
          onSubmit={(vals) => updateOperator(editing.operator_id, vals)}
        />
      </Modal>
    </DashboardLayout>
  );
};

export default ManageOperators;
