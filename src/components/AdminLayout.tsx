import React, { useState } from "react";
import { useLogout, useGetIdentity, useNavigation } from "@refinedev/core";
import { useNavigate, useLocation } from "react-router";
import { Layout, Menu, Avatar, Dropdown, Typography, Badge, Tooltip, Space } from "antd";
import {
  DashboardOutlined,
  ShoppingOutlined,
  GoldOutlined,
  UserOutlined,
  TagsOutlined,
  PictureOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
} from "@ant-design/icons";

const { Sider, Content, Header } = Layout;
const { Text } = Typography;

const GOLD = "#c9a84c";
const DARK = "#0c0d0f";
const PANEL = "#13151a";
const BORDER = "#22262e";

const NAV_ITEMS = [
  { key: "dashboard",  label: "Dashboard",  icon: <DashboardOutlined />, path: "/dashboard" },
  { key: "orders",     label: "Orders",     icon: <ShoppingOutlined />,  path: "/orders" },
  { key: "products",   label: "Products",   icon: <GoldOutlined />,      path: "/products" },
  { key: "users",      label: "Users",      icon: <UserOutlined />,      path: "/users" },
  { key: "categories", label: "Categories", icon: <TagsOutlined />,      path: "/categories" },
  { key: "banners",    label: "Banners",    icon: <PictureOutlined />,   path: "/banners" },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { mutate: logout } = useLogout();
  const { data: identity } = useGetIdentity<{ name: string; email: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const currentKey = (() => {
    const path = location.pathname.replace(/^\//, "").split("/")[0];
    if (!path || path === "") return "dashboard";
    if (path === "profiles") return "users";
    return path;
  })();

  const userMenu = {
    items: [
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Sign Out",
        onClick: () => logout(),
        danger: true,
      },
    ],
  };

  return (
    <Layout style={{ minHeight: "100vh", background: DARK }}>
      {/* ── Sidebar ── */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={240}
        collapsedWidth={64}
        style={{
          background: PANEL,
          borderRight: `1px solid ${BORDER}`,
          position: "fixed",
          height: "100vh",
          left: 0,
          top: 0,
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            padding: collapsed ? "0 20px" : "0 24px",
            borderBottom: `1px solid ${BORDER}`,
            gap: 12,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              background: `linear-gradient(135deg, ${GOLD}, #8a6f2e)`,
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: 14,
              color: "#0c0d0f",
              fontWeight: 700,
            }}
          >
            T
          </div>
          {!collapsed && (
            <div style={{ overflow: "hidden" }}>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 16,
                  color: "#e8e0d0",
                  letterSpacing: "0.05em",
                  whiteSpace: "nowrap",
                }}
              >
                Thahira
              </div>
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 10,
                  color: "#5a5448",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  marginTop: -2,
                }}
              >
                Admin Panel
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <Menu
          mode="inline"
          selectedKeys={[currentKey]}
          style={{
            background: "transparent",
            border: "none",
            padding: "16px 0",
            flex: 1,
            fontFamily: "'DM Sans', sans-serif",
          }}
          items={NAV_ITEMS.map((item) => ({
            key: item.key,
            icon: (
              <span
                style={{
                  color: currentKey === item.key ? GOLD : "#5a5448",
                  fontSize: 16,
                  transition: "color 0.2s",
                }}
              >
                {item.icon}
              </span>
            ),
            label: (
              <span
                style={{
                  color: currentKey === item.key ? GOLD : "#8a8070",
                  fontSize: 13,
                  letterSpacing: "0.04em",
                  fontWeight: currentKey === item.key ? 500 : 400,
                  transition: "color 0.2s",
                }}
              >
                {item.label}
              </span>
            ),
            onClick: () => navigate(item.path),
            style: {
              margin: "2px 8px",
              borderRadius: 4,
              height: 44,
              background:
                currentKey === item.key
                  ? "rgba(201,168,76,0.08)"
                  : "transparent",
              borderLeft:
                currentKey === item.key
                  ? `2px solid ${GOLD}`
                  : "2px solid transparent",
            },
          }))}
        />

        {/* Collapse toggle at bottom */}
        <div
          style={{
            padding: "16px",
            borderTop: `1px solid ${BORDER}`,
          }}
        >
          <Tooltip title={collapsed ? "Expand" : "Collapse"} placement="right">
            <div
              onClick={() => setCollapsed(!collapsed)}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: collapsed ? "center" : "flex-start",
                gap: 10,
                padding: "8px",
                borderRadius: 4,
                color: "#5a5448",
                transition: "all 0.2s",
              }}
            >
              {collapsed ? (
                <MenuUnfoldOutlined style={{ fontSize: 16 }} />
              ) : (
                <>
                  <MenuFoldOutlined style={{ fontSize: 16 }} />
                  <span style={{ fontSize: 12, letterSpacing: "0.08em" }}>
                    Collapse
                  </span>
                </>
              )}
            </div>
          </Tooltip>
        </div>
      </Sider>

      {/* ── Main ── */}
      <Layout
        style={{
          marginLeft: collapsed ? 64 : 240,
          transition: "margin-left 0.2s",
          background: DARK,
          minHeight: "100vh",
        }}
      >
        {/* Topbar */}
        <Header
          style={{
            background: PANEL,
            borderBottom: `1px solid ${BORDER}`,
            padding: "0 28px",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 99,
          }}
        >
          {/* Page breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Text
              style={{
                color: "#5a5448",
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              Thahira Groups
            </Text>
            <span style={{ color: "#2a2a2a" }}>/</span>
            <Text
              style={{
                color: GOLD,
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              {NAV_ITEMS.find((n) => n.key === currentKey)?.label || "Dashboard"}
            </Text>
          </div>

          {/* Right actions */}
          <Space size={8}>
            <Tooltip title="Notifications">
              <Badge count={0} size="small">
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 4,
                    border: `1px solid ${BORDER}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#5a5448",
                    transition: "all 0.2s",
                  }}
                >
                  <BellOutlined />
                </div>
              </Badge>
            </Tooltip>

            <Dropdown menu={userMenu} placement="bottomRight" trigger={["click"]}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  padding: "6px 10px",
                  borderRadius: 4,
                  border: `1px solid ${BORDER}`,
                  transition: "all 0.2s",
                }}
              >
                <Avatar
                  size={24}
                  style={{
                    background: `linear-gradient(135deg, ${GOLD}, #8a6f2e)`,
                    fontSize: 11,
                    color: "#0c0d0f",
                    fontWeight: 700,
                  }}
                >
                  {(identity?.name?.[0] || "A").toUpperCase()}
                </Avatar>
                <Text style={{ fontSize: 12, color: "#8a8070", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {identity?.name || "Admin"}
                </Text>
              </div>
            </Dropdown>
          </Space>
        </Header>

        {/* Page Content */}
        <Content
          style={{
            padding: 28,
            minHeight: "calc(100vh - 64px)",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};