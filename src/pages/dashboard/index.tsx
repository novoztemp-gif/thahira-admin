import React, { useMemo } from "react";
import { useTable } from "@refinedev/antd";
import { Row, Col, Card, Typography, Table, Spin } from "antd";
import { RiseOutlined, ShoppingOutlined, GoldOutlined, UserOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;
const GOLD = "#c9a84c";
const BORDER = "#22262e";
const PANEL = "#13151a";

const KpiCard: React.FC<{
  title: string; value: string | number; sub?: string;
  icon: React.ReactNode; accent?: string; loading?: boolean;
}> = ({ title, value, sub, icon, accent = GOLD, loading }) => (
  <Card loading={loading}
    style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 6, height: "100%" }}
    styles={{ body: { padding: "24px 28px" } }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#5a5448", marginBottom: 12 }}>{title}</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: "#e8e0d0", lineHeight: 1, fontWeight: 300 }}>{value}</div>
        {sub && <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#5a5448", marginTop: 8 }}>{sub}</div>}
      </div>
      <div style={{ width: 40, height: 40, borderRadius: 4, background: `${accent}14`, border: `1px solid ${accent}28`, display: "flex", alignItems: "center", justifyContent: "center", color: accent, fontSize: 18, flexShrink: 0 }}>
        {icon}
      </div>
    </div>
  </Card>
);

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  pending:    { color: "#c9a84c", label: "Pending"    },
  processing: { color: "#5a8fc9", label: "Processing" },
  shipped:    { color: "#9b7fd4", label: "Shipped"    },
  delivered:  { color: "#4caf7a", label: "Delivered"  },
  cancelled:  { color: "#c06060", label: "Cancelled"  },
};

const MiniBarChart: React.FC<{ data: { label: string; value: number; max: number }[] }> = ({ data }) => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 60 }}>
    {data.map((d, i) => (
      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", height: 48 }}>
          <div title={`Rs ${d.value.toLocaleString("en-IN")}`}
            style={{ width: "100%", height: d.max > 0 ? `${Math.max(4, (d.value / d.max) * 100)}%` : "4%", background: `linear-gradient(180deg, ${GOLD}, #8a6f2e)`, borderRadius: "2px 2px 0 0", transition: "height 0.5s ease" }} />
        </div>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#5a5448" }}>{d.label}</span>
      </div>
    ))}
  </div>
);

export const Dashboard: React.FC = () => {
  const ordersResult = useTable({
    resource: "orders",
    syncWithLocation: false,
    pagination: { pageSize: 500 },
    sorters: { initial: [{ field: "created_at", order: "desc" }] },
  }) as any;

  const productsResult = useTable({
    resource: "products",
    syncWithLocation: false,
    pagination: { pageSize: 200 },
  }) as any;

  const profilesResult = useTable({
    resource: "profiles",
    syncWithLocation: false,
    pagination: { pageSize: 200 },
  }) as any;

  const orders: any[] = ordersResult.tableProps?.dataSource || [];
  const products: any[] = productsResult.tableProps?.dataSource || [];
  const profiles: any[] = profilesResult.tableProps?.dataSource || [];

  const ordersLoading = ordersResult.tableProps?.loading;
  const productsLoading = productsResult.tableProps?.loading;
  const profilesLoading = profilesResult.tableProps?.loading;

  const totalRevenue = useMemo(() => orders.reduce((s: number, o: any) => s + Number(o.total_amount || 0), 0), [orders]);
  const avgOrder = orders.length > 0 ? totalRevenue / orders.length : 0;

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = {};
    orders.forEach((o: any) => { const s = o.status || "pending"; c[s] = (c[s] || 0) + 1; });
    return c;
  }, [orders]);

  const monthlyRevenue = useMemo(() => {
    const months: Record<string, number> = {};
    const now = new Date();
    const LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months[`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`] = 0;
    }
    orders.forEach((o: any) => {
      const d = new Date(o.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      if (key in months) months[key] += Number(o.total_amount || 0);
    });
    const max = Math.max(...Object.values(months), 1);
    return Object.entries(months).map(([key, val]) => ({ label: LABELS[parseInt(key.split("-")[1])-1], value: val, max }));
  }, [orders]);

  const recentOrders = orders.slice(0, 8);

  const columns = [
    { title: "ORDER ID", dataIndex: "id", width: 160, render: (v: string) => <Text style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: GOLD }}>#TG-{v?.slice(0,8).toUpperCase()}</Text> },
    { title: "CUSTOMER", dataIndex: ["address","name"], render: (v: string) => <Text style={{ color: "#e8e0d0", fontSize: 13 }}>{v || "-"}</Text> },
    { title: "DATE", dataIndex: "created_at", width: 130, render: (v: string) => <Text style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#8a8070" }}>{new Date(v).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}</Text> },
    { title: "AMOUNT", dataIndex: "total_amount", width: 120, render: (v: number) => <Text style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: "#e8e0d0" }}>Rs {Number(v).toLocaleString("en-IN")}</Text> },
    {
      title: "STATUS", dataIndex: "status", width: 120,
      render: (v: string) => {
        const cfg = STATUS_CONFIG[v || "pending"] || STATUS_CONFIG.pending;
        return (
          <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:3, background:`${cfg.color}15`, border:`1px solid ${cfg.color}28`, color:cfg.color, fontFamily:"'DM Mono', monospace", fontSize:10, textTransform:"uppercase", letterSpacing:"0.1em" }}>
            <span style={{ width:5, height:5, borderRadius:"50%", background:cfg.color, display:"inline-block" }} />{cfg.label}
          </span>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a5448", marginBottom: 6 }}>Overview</div>
        <Title level={2} style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: "#e8e0d0", margin: 0, fontSize: 28 }}>Command Centre</Title>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard title="Total Revenue" value={`Rs ${totalRevenue.toLocaleString("en-IN")}`} sub={`Avg Rs ${avgOrder.toLocaleString("en-IN",{maximumFractionDigits:0})} / order`} icon={<RiseOutlined />} loading={ordersLoading} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard title="Total Orders" value={orders.length} sub={`${statusCounts.pending||0} pending`} icon={<ShoppingOutlined />} accent="#5a8fc9" loading={ordersLoading} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard title="Active Products" value={products.filter((p:any)=>p.is_active).length} sub={`${products.length} total`} icon={<GoldOutlined />} accent="#9b7fd4" loading={productsLoading} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard title="Customers" value={profiles.length} sub="Registered users" icon={<UserOutlined />} accent="#4caf7a" loading={profilesLoading} />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} lg={14}>
          <Card style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 6 }} styles={{ body: { padding: 24 } }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
              <div>
                <div style={{ fontFamily:"'DM Mono', monospace", fontSize:10, letterSpacing:"0.15em", textTransform:"uppercase", color:"#5a5448", marginBottom:4 }}>Revenue</div>
                <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:20, color:"#e8e0d0", fontWeight:300 }}>Last 7 Months</div>
              </div>
              <div style={{ fontFamily:"'DM Mono', monospace", fontSize:11, color:GOLD, background:"rgba(201,168,76,0.08)", border:"1px solid rgba(201,168,76,0.15)", padding:"4px 10px", borderRadius:3 }}>
                Rs {totalRevenue.toLocaleString("en-IN")}
              </div>
            </div>
            {ordersLoading ? <div style={{ height:60, display:"flex", alignItems:"center", justifyContent:"center" }}><Spin /></div> : <MiniBarChart data={monthlyRevenue} />}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 6, height:"100%" }} styles={{ body: { padding:24, height:"100%", display:"flex", flexDirection:"column", justifyContent:"center" } }}>
            <div style={{ fontFamily:"'DM Mono', monospace", fontSize:10, letterSpacing:"0.15em", textTransform:"uppercase", color:"#5a5448", marginBottom:4 }}>Order Status</div>
            <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:20, color:"#e8e0d0", fontWeight:300, marginBottom:20 }}>Breakdown</div>
            {ordersLoading ? <Spin /> : (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <div key={key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:cfg.color }} />
                      <span style={{ fontFamily:"'DM Sans', sans-serif", fontSize:12, color:"#8a8070" }}>{cfg.label}</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:80, height:4, background:"#1a1d24", borderRadius:2, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${orders.length > 0 ? ((statusCounts[key]||0)/orders.length)*100 : 0}%`, background:cfg.color, borderRadius:2 }} />
                      </div>
                      <span style={{ fontFamily:"'DM Mono', monospace", fontSize:12, color:"#e8e0d0", width:20, textAlign:"right" }}>{statusCounts[key]||0}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Card style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 6 }} styles={{ body: { padding: 0 } }}>
        <div style={{ padding:"20px 24px", borderBottom:`1px solid ${BORDER}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontFamily:"'DM Mono', monospace", fontSize:10, letterSpacing:"0.15em", textTransform:"uppercase", color:"#5a5448", marginBottom:2 }}>Latest Activity</div>
            <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:20, color:"#e8e0d0", fontWeight:300 }}>Recent Orders</div>
          </div>
          <a href="/orders" style={{ fontFamily:"'DM Mono', monospace", fontSize:10, letterSpacing:"0.15em", textTransform:"uppercase", color:GOLD, textDecoration:"none" }}>View All &rarr;</a>
        </div>
        <Table dataSource={recentOrders} columns={columns} rowKey="id" pagination={false} loading={ordersLoading} style={{ fontFamily:"'DM Sans', sans-serif" }} />
      </Card>
    </div>
  );
};

export default Dashboard;