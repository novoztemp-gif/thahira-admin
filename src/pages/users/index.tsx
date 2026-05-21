import React, { useState } from "react";
import { useTable } from "@refinedev/antd";
import { useList } from "@refinedev/core";
import { Table, Typography, Select, Avatar, Drawer } from "antd";
import { CrownOutlined, UserOutlined, EyeOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;
const GOLD = "#c9a84c";
const BORDER = "#22262e";
const PANEL = "#13151a";

const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const isAdmin = role === "admin";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 3,
      background: isAdmin ? "rgba(201,168,76,0.1)" : "rgba(90,143,201,0.08)",
      border: `1px solid ${isAdmin ? "rgba(201,168,76,0.25)" : "rgba(90,143,201,0.15)"}`,
      color: isAdmin ? GOLD : "#5a8fc9",
      fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase",
    }}>
      {isAdmin ? <CrownOutlined /> : <UserOutlined />}
      {role || "customer"}
    </span>
  );
};

const UserDrawer: React.FC<{ user: any; open: boolean; onClose: () => void }> = ({ user, open, onClose }) => {
  const ordersResult = useTable({

    resource: "orders",

    syncWithLocation: false,

    filters: { permanent: user ? [{ field: "user_id", operator: "eq", value: user.id }] : [] },

    pagination: { pageSize: 100 },

    queryOptions: { enabled: !!user },

  } as any) as any;

  const orders: any[] = ordersResult.tableProps?.dataSource || [];
  const totalSpend = orders.reduce((s: number, o: any) => s + Number(o.total_amount || 0), 0);
  if (!user) return null;

  const initials = ((user.full_name || user.id || "?").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2));

  return (
    <Drawer open={open} onClose={onClose} width={440} title={null} closable={false}
      styles={{ body: { padding: 0, background: "#13151a" }, wrapper: { boxShadow: "-4px 0 40px rgba(0,0,0,0.5)" } }}>
      <div style={{ padding: "28px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 20 }}>
        <Avatar size={48} style={{ background: `linear-gradient(135deg, ${GOLD}, #8a6f2e)`, fontSize: 16, color: "#0c0d0f", fontWeight: 700, flexShrink: 0 }}>{initials}</Avatar>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: "#e8e0d0", fontWeight: 300 }}>{user.full_name || "—"}</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#5a5448", marginTop: 2 }}>{user.phone || "No phone"}</div>
          <div style={{ marginTop: 8 }}><RoleBadge role={user.role || "customer"} /></div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#5a5448", cursor: "pointer", fontSize: 18, padding: 4 }}>✕</button>
      </div>

      <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", gap: 12 }}>
          {[
            { label: "Orders", value: orders.length },
            { label: "Total Spent", value: `₹${totalSpend.toLocaleString("en-IN")}` },
            { label: "Avg. Order", value: orders.length > 0 ? `₹${Math.round(totalSpend / orders.length).toLocaleString("en-IN")}` : "—" },
          ].map((s) => (
            <div key={s.label} style={{ flex: 1, background: "#0f1116", border: `1px solid ${BORDER}`, borderRadius: 4, padding: "12px 14px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: "#e8e0d0", fontWeight: 300 }}>{s.value}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5a5448", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a5448", marginBottom: 12 }}>— Info —</div>
          {[
            ["Joined", user.created_at ? new Date(user.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "—"],
            ["Role", user.role || "customer"],
          ].map(([l, v]) => (
            <div key={l} style={{ display: "flex", gap: 16, marginBottom: 8 }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "#5a5448", width: 80, flexShrink: 0 }}>{l}</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#e8e0d0" }}>{v}</span>
            </div>
          ))}
        </div>

        {orders.length > 0 && (
          <div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a5448", marginBottom: 12 }}>— Recent Orders —</div>
            {orders.slice(0, 5).map((o: any) => (
              <div key={o.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#0f1116", border: `1px solid ${BORDER}`, borderRadius: 4, marginBottom: 8 }}>
                <div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: GOLD }}>#TG-{o.id.slice(0, 8).toUpperCase()}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#5a5448", marginTop: 2 }}>{new Date(o.created_at).toLocaleDateString("en-IN")}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: "#e8e0d0" }}>₹{Number(o.total_amount).toLocaleString("en-IN")}</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", color: o.status === "delivered" ? "#4caf7a" : o.status === "cancelled" ? "#c06060" : "#c9a84c", marginTop: 2 }}>{o.status || "pending"}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Drawer>
  );
};

export const Users: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { tableProps, setFilters } = useTable({
    resource: "profiles",
    syncWithLocation: false,
    sorters: { initial: [{ field: "created_at", order: "desc" }] },
    pagination: { pageSize: 25 },
  }) as any;

  const columns = [
    {
      title: "USER",
      render: (_: any, r: any) => {
        const initials = ((r.full_name || r.id || "?").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2));
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar size={32} style={{ background: `linear-gradient(135deg, ${GOLD}60, #8a6f2e60)`, fontSize: 11, color: "#e8e0d0", fontWeight: 600, flexShrink: 0 }}>{initials}</Avatar>
            <div>
              <Text style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#e8e0d0", display: "block" }}>{r.full_name || "—"}</Text>
              <Text style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#5a5448" }}>{r.phone || "No phone"}</Text>
            </div>
          </div>
        );
      },
    },
    {
      title: "ROLE", dataIndex: "role", width: 140,
      render: (v: string) => <RoleBadge role={v || "customer"} />,
    },
    {
      title: "JOINED", dataIndex: "created_at", width: 150,
      render: (v: string) => <Text style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#5a5448" }}>{v ? new Date(v).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</Text>,
    },
    {
      title: "", width: 48,
      render: (_: any, r: any) => (
        <button onClick={(e) => { e.stopPropagation(); setSelectedUser(r); setDrawerOpen(true); }}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#5a5448", padding: 4, display: "flex", alignItems: "center" }}>
          <EyeOutlined />
        </button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a5448", marginBottom: 6 }}>Customer Management</div>
          <Title level={2} style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: "#e8e0d0", margin: 0, fontSize: 28 }}>Users</Title>
        </div>
        <Select
          placeholder="Filter by role"
          allowClear // This keeps the 'x' button working
          style={{ width: 180 }}
          onChange={(val) => {
          if (val && val !== "all") {
            // Added "replace" as the second argument to overwrite previous filters!
            setFilters([{ field: "role", operator: "eq", value: val }], "replace");
          } else {
            // Wipes the slate completely clean
            setFilters([], "replace");
          }
        }}
          options={[
            { 
              value: "all", 
              label: (
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8a8070" }}>
                  View All Users
                </span>
              ) 
            },
            { value: "admin",    label: <RoleBadge role="admin" /> },
            { value: "customer", label: <RoleBadge role="customer" /> },
          ]}
        />
      </div>

      <div style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 6, overflow: "hidden" }}>
        <Table
          {...tableProps}
          columns={columns}
          rowKey="id"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
          onRow={(r) => ({ style: { cursor: "pointer" }, onClick: () => { setSelectedUser(r); setDrawerOpen(true); } })}
        />
      </div>

      <UserDrawer user={selectedUser} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
};

export default Users;