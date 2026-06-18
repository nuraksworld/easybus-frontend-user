import React, { useEffect, useMemo, useState, useCallback } from "react";
import { DashboardLayout } from "../../layouts";
import { DashboardHeader } from "../../components";
import { Button, Input, Modal, message, Popconfirm, Table, Tag, Space } from "antd";
import AddOperatorPopover from "../../features/manage-operators/add-new/AddOperatorPopover";
import { api } from "../../api"; // axios instance with VITE_API_URL base

const ManageOperators = () => {
  const [searchText, setSearchText] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [operators, setOperators] = useState([]);   // operators rows
  const [buses, setBuses] = useState([]);          // all buses (for mapping)
  const [editing, setEditing] = useState(null);     // operator row being edited

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [ops, bs] = await Promise.all([
        api.get("/operators"),
        api.get("/buses"),
      ]);
      setOperators(ops.data || []);
      setBuses(bs.data || []); // expects SELECT b.*, o.company_name ... from backend
    } catch (e) {
      message.error(e?.response?.data?.error || "Failed to load operators/buses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

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

  // --- CREATE ---
  const createOperator = async (values) => {
    // values: { owner_name, phone, company_name?, bus_numbers: [] }
    try {
      // 1) create operator
      const { data } = await api.post("/operators", {
        company_name: values.company_name || values.owner_name, // fallback
        owner_name: values.owner_name,
        phone: values.phone,
      });
      const operator_id = data.operator_id;

      // 2) create buses (if any)
      const nums = values.bus_numbers?.filter(Boolean) || [];
      if (nums.length) {
        await Promise.all(
          nums.map((num) =>
            api.post("/buses", {
              operator_id,
              bus_number: num,
              bus_name: null,
              ac_type: "NON_AC",
              total_seats: 45,
              driver_name: null,
              driver_phone: null,
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

  // --- UPDATE (operator + reconcile bus numbers) ---
  const updateOperator = async (operator_id, values) => {
    // values: { owner_name, phone, company_name?, bus_numbers: [] }
    try {
      // 1) update operator fields
      await api.put(`/operators/${operator_id}`, {
        company_name: values.company_name || values.owner_name,
        owner_name: values.owner_name,
        phone: values.phone,
      });

      // 2) reconcile buses
      const existing = (busesByOperator.get(operator_id) || []);
      const currentNums = new Set(existing.map((b) => String(b.bus_number).trim()));
      const newNums = new Set((values.bus_numbers || []).map((x) => String(x).trim()).filter(Boolean));

      // to add
      const toAdd = [...newNums].filter((n) => !currentNums.has(n));
      // to delete
      const toDel = existing.filter((b) => !newNums.has(String(b.bus_number).trim()));

      // add
      await Promise.all(
        toAdd.map((num) =>
          api.post("/buses", {
            operator_id,
            bus_number: num,
            bus_name: null,
            ac_type: "NON_AC",
            total_seats: 45,
            driver_name: null,
            driver_phone: null,
          })
        )
      );

      // delete
      await Promise.all(toDel.map((b) => api.delete(`/buses/${b.bus_id}`)));

      message.success("Operator updated");
      setIsEditOpen(false);
      setEditing(null);
      await loadAll();
    } catch (e) {
      message.error(e?.response?.data?.error || "Failed to update operator");
    }
  };

  // --- DELETE operator (and its buses via FK if you want) ---
  const deleteOperator = async (operator_id) => {
    try {
      await api.delete(`/operators/${operator_id}`);
      message.success("Operator deleted");
      await loadAll();
    } catch (e) {
      message.error(e?.response?.data?.error || "Failed to delete operator");
    }
  };

  // Filter client-side
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
      title: "Buses",
      key: "buses",
      render: (_, r) => {
        const list = busesByOperator.get(r.operator_id) || [];
        if (!list.length) return <Tag>None</Tag>;
        return (
          <Space wrap size={[8, 8]}>
            {list.map((b) => (
              <Tag key={b.bus_id}>{b.bus_number}</Tag>
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
              // compose initial form values for edit
              const list = busesByOperator.get(r.operator_id) || [];
              setEditing({
                ...r,
                bus_numbers: list.map((b) => String(b.bus_number)),
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
        <Button type="primary" onClick={() => setIsCreateOpen(true)}>Add New Operator</Button>
        <Button onClick={loadAll} loading={loading}>Refresh</Button>
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
        onCancel={() => { setIsEditOpen(false); setEditing(null); }}
        footer={null}
        destroyOnClose
      >
        <AddOperatorPopover
          initialValues={editing || {}}
          submitText="Update"
          onClose={() => { setIsEditOpen(false); setEditing(null); }}
          onSubmit={(vals) => updateOperator(editing.operator_id, vals)}
        />
      </Modal>
    </DashboardLayout>
  );
};

export default ManageOperators;
