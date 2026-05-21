import React, { useState } from "react";
import { useTable } from "@refinedev/antd";
import { useUpdate } from "@refinedev/core";
import { Table, Typography, Input, Select, Drawer, Button, Tooltip } from "antd";
import { SearchOutlined, EyeOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;
const GOLD = "#c9a84c";
const BORDER = "#22262e";
const PANEL = "#13151a";

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  pending:    { color: "#c9a84c", bg: "rgba(201,168,76,0.1)",  label: "Pending"    },
  processing: { color: "#5a8fc9", bg: "rgba(90,143,201,0.1)",  label: "Processing" },
  shipped:    { color: "#9b7fd4", bg: "rgba(155,127,212,0.1)", label: "Shipped"    },
  delivered:  { color: "#4caf7a", bg: "rgba(76,175,122,0.1)",  label: "Delivered"  },
  cancelled:  { color: "#c06060", bg: "rgba(192,96,96,0.1)",   label: "Cancelled"  },
};

// ── Order Detail Drawer ───────────────────────────────────────────────────────
const OrderDrawer: React.FC<{
  order: any; open: boolean; onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
}> = ({ order, open, onClose, onStatusChange }) => {
  if (!order) return null;
  const addr = order.address || {};
  const items: any[] = order.items || [];
  const subtotal = items.reduce((s: number, i: any) => s + i.price * i.qty, 0);

  return (
    <Drawer open={open} onClose={onClose} width={500} title={null} closable={false}
      styles={{ body: { padding: 0, background: "#13151a" }, wrapper: { boxShadow: "-4px 0 40px rgba(0,0,0,0.5)" } }}>
      <div style={{ padding: "24px 28px", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a5448", marginBottom: 4 }}>Order Detail</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 16, color: GOLD }}>#TG-{order.id?.slice(0, 8).toUpperCase()}</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#5a5448", marginTop: 4 }}>
            {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#5a5448", cursor: "pointer", fontSize: 18, padding: 4 }}>✕</button>
      </div>

      <div style={{ padding: "20px 28px", display: "flex", flexDirection: "column", gap: 20, overflowY: "auto", maxHeight: "calc(100vh - 120px)" }}>
        {/* Status updater in Drawer */}
        <div style={{ background: "#0f1116", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "16px 20px" }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5a5448", marginBottom: 10 }}>Update Status</div>
          <Select
            value={order.status || "pending"}
            onChange={(val) => onStatusChange(order.id, val)}
            style={{ width: "100%" }}
            options={Object.entries(STATUS_CONFIG).map(([k, v]) => ({
              value: k,
              label: <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: v.color, display: "inline-block" }} />
                <span style={{ color: v.color, fontFamily: "'DM Mono', monospace", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>{v.label}</span>
              </span>,
            }))}
          />
        </div>

        {/* Delivery */}
        <div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a5448", marginBottom: 12 }}>— Delivery Details —</div>
          {[
            ["Name", addr.name], ["Email", addr.email], ["Phone", addr.phone || "—"],
            ["Address", [addr.address_line1, addr.address_line2].filter(Boolean).join(", ")],
            ["City / State", [addr.city, addr.state].filter(Boolean).join(", ")],
            ["PIN", addr.pincode],
          ].map(([label, value]) => (
            <div key={label} style={{ display: "flex", gap: 16, marginBottom: 8 }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "#5a5448", width: 80, flexShrink: 0 }}>{label}</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#e8e0d0" }}>{value || "—"}</span>
            </div>
          ))}
        </div>

        <div style={{ height: 1, background: BORDER }} />

        {/* Items */}
        <div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a5448", marginBottom: 12 }}>— Order Items —</div>
          {items.map((item: any, idx: number) => (
            <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#0f1116", border: `1px solid ${BORDER}`, borderRadius: 4, marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <svg width="40" height="10" viewBox="0 0 340 80" fill="none"><rect x="32" y="26" width="210" height="28" rx="2" fill="#c9a84c" opacity={0.6} /><rect x="248" y="22" width="88" height="36" rx="14" fill="#161210" /></svg>
                <div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#e8e0d0" }}>{item.name}</div>
                  {item.variant && item.variant !== item.name && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#5a5448" }}>{item.variant}</div>}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#5a5448" }}>×{item.qty}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: "#e8e0d0" }}>₹{(item.price * item.qty).toLocaleString("en-IN")}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div style={{ background: "#0f1116", border: `1px solid ${BORDER}`, borderRadius: 4, padding: "16px 20px" }}>
          {[
            ["Subtotal", `₹${subtotal.toLocaleString("en-IN")}`],
            ["GST (18%)", `₹${Math.round(subtotal * 0.18).toLocaleString("en-IN")}`],
            ["Shipping", subtotal >= 999 ? "Free" : "₹99"],
          ].map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#5a5448" }}>{l}</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#8a8070" }}>{v}</span>
            </div>
          ))}
          <div style={{ height: 1, background: BORDER, margin: "8px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#e8e0d0", fontWeight: 500 }}>Total</span>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: GOLD }}>₹{Number(order.total_amount).toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

// ── Orders Page ───────────────────────────────────────────────────────────────
export const Orders: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { tableProps, setFilters, setSorters } = useTable({
    resource: "orders",
    syncWithLocation: false,
    sorters: { initial: [{ field: "created_at", order: "desc" }] },
    pagination: { pageSize: 20 },
  }) as any;

  const { mutate: updateStatus } = useUpdate();

  const handleStatusChange = (id: string, newStatus: string) => {
    updateStatus({ resource: "orders", id, values: { status: newStatus } });
    if (selectedOrder?.id === id) setSelectedOrder((p: any) => ({ ...p, status: newStatus }));
  };

  const rawData: any[] = tableProps.dataSource || [];
  const filteredData = search.trim()
    ? rawData.filter((o: any) => {
        const q = search.toLowerCase();
        return (
          o.id?.toLowerCase().includes(q) ||
          o.address?.name?.toLowerCase().includes(q) ||
          o.address?.email?.toLowerCase().includes(q)
        );
      })
    : rawData;

  const columns = [
    {
      title: "ORDER ID", dataIndex: "id", width: 160,
      render: (v: string) => <Text style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: GOLD }}>#TG-{v?.slice(0, 8).toUpperCase()}</Text>,
    },
    {
      title: "DATE", dataIndex: "created_at", width: 140,
      render: (v: string) => <Text style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#8a8070" }}>{new Date(v).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</Text>,
    },
    {
      title: "CUSTOMER", dataIndex: ["address", "name"],
      render: (v: string, r: any) => (
        <div>
          <Text style={{ color: "#e8e0d0", fontSize: 13, display: "block" }}>{v || "—"}</Text>
          <Text style={{ color: "#5a5448", fontSize: 11 }}>{r.address?.email || ""}</Text>
        </div>
      ),
    },
    {
      title: "TOTAL", dataIndex: "total_amount", width: 130,
      render: (v: number) => <Text style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, color: "#e8e0d0" }}>₹{Number(v).toLocaleString("en-IN")}</Text>,
    },
    {
      //  The dropdown is now right here in the table column!
      title: "STATUS", dataIndex: "status", width: 150,
      render: (v: string, r: any) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Select
            value={v || "pending"}
            onChange={(val) => handleStatusChange(r.id, val)}
            style={{ width: "130px" }}
            options={Object.entries(STATUS_CONFIG).map(([k, cfg]) => ({
              value: k,
              label: (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color, display: "inline-block" }} />
                  <span style={{ color: cfg.color, fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase" }}>{cfg.label}</span>
                </span>
              ),
            }))}
          />
        </div>
      ),
    },
    {
      title: "", width: 48,
      render: (_: any, r: any) => (
        <Tooltip title="View details">
          <Button type="text" size="small" icon={<EyeOutlined style={{ color: "#5a5448" }} />}
            onClick={(e) => { e.stopPropagation(); setSelectedOrder(r); setDrawerOpen(true); }}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a5448", marginBottom: 6 }}>Management</div>
          <Title level={2} style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: "#e8e0d0", margin: 0, fontSize: 28 }}>Orders</Title>
        </div>
        <Text style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#5a5448" }}>{rawData.length} total</Text>
      </div>

      {/* Filters */}
      <div style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "14px 20px", marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <Input
          placeholder="Search by order ID, name or email..."
          prefix={<SearchOutlined style={{ color: "#5a5448" }} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ width: 280, background: "#1a1d24", border: `1px solid ${BORDER}`, borderRadius: 4, color: "#e8e0d0" }}
        />
        {/*  Main filter dropdown with View All and Replace logic */}
        <Select
          placeholder="Filter by status"
          allowClear
          style={{ width: 180 }}
          onChange={(val) => {
            if (val && val !== "all") {
              setFilters([{ field: "status", operator: "eq", value: val }], "replace");
            } else {
              setFilters([], "replace");
            }
          }}
          options={[
            {
              value: "all",
              label: (
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8a8070" }}>
                  View All Orders
                </span>
              )
            },
            ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({
              value: k,
              label: (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: v.color, display: "inline-block" }} />
                  <span style={{ color: v.color, fontFamily: "'DM Mono', monospace", fontSize: 11, textTransform: "uppercase" }}>{v.label}</span>
                </span>
              ),
            }))
          ]}
        />
        <Select
          defaultValue="desc"
          style={{ width: 160 }}
          onChange={(val) => setSorters([{ field: "created_at", order: val }])}
          options={[
            { value: "desc", label: "Newest first" },
            { value: "asc",  label: "Oldest first" },
          ]}
        />
      </div>

      {/* Table */}
      <div style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 6, overflow: "hidden" }}>
        <Table
          {...tableProps}
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
          onRow={(record) => ({
            style: { cursor: "pointer" },
            onClick: () => { setSelectedOrder(record); setDrawerOpen(true); },
          })}
        />
      </div>

      <OrderDrawer
        order={selectedOrder}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default Orders;