import { Refine, Authenticated } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { useNotificationProvider } from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";
import routerProvider, {
  DocumentTitleHandler,
  UnsavedChangesNotifier,
  NavigateToResource,
  CatchAllNavigate,
} from "@refinedev/react-router";
import { liveProvider } from "@refinedev/supabase";
import { App as AntdApp, ConfigProvider, theme } from "antd";
import { BrowserRouter, Route, Routes, Outlet } from "react-router";
import authProvider from "./providers/auth";
import { dataProvider } from "./providers/data";
import { supabaseClient } from "./providers/supabase-client";
import { AdminLayout } from "./components/AdminLayout";
import { LoginPage } from "./pages/Login";
import { Dashboard } from "./pages/dashboard";
import { Orders } from "./pages/orders";
import { Products } from "./pages/products";
import { Users } from "./pages/users";
import { Banners } from "./pages/banners";
import { Categories } from "./pages/categories";

// ── Design Tokens ────────────────────────────────────────────────────────────
const GOLD = "#c9a84c";
const DARK_BG = "#0c0d0f";
const PANEL = "#13151a";
const BORDER = "#22262e";

const antdTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: GOLD,
    colorBgBase: DARK_BG,
    colorBgContainer: PANEL,
    colorBgElevated: "#1a1d24",
    colorBorder: BORDER,
    colorBorderSecondary: BORDER,
    colorText: "#e8e0d0",
    colorTextSecondary: "#8a8070",
    colorTextTertiary: "#5a5448",
    fontFamily: "'DM Sans', 'Montserrat', sans-serif",
    borderRadius: 4,
    borderRadiusLG: 6,
    boxShadow: "0 2px 16px rgba(0,0,0,0.4)",
    colorSuccess: "#4caf7a",
    colorWarning: "#c9a84c",
    colorError: "#c06060",
    colorInfo: "#5a8fc9",
  },
  components: {
    Table: {
      headerBg: "#0f1116",
      headerColor: "#8a8070",
      rowHoverBg: "#1a1d24",
      borderColor: BORDER,
    },
    Card: {
      colorBgContainer: PANEL,
    },
    Modal: {
      contentBg: "#13151a",
      headerBg: "#13151a",
    },
    Select: {
      colorBgContainer: "#1a1d24",
      colorBgElevated: "#1a1d24",
    },
    Input: {
      colorBgContainer: "#1a1d24",
    },
    InputNumber: {
      colorBgContainer: "#1a1d24",
    },
  },
};

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ConfigProvider theme={antdTheme}>
          <AntdApp>
            <Refine
              dataProvider={dataProvider}
              liveProvider={liveProvider(supabaseClient)}
              authProvider={authProvider}
              routerProvider={routerProvider}
              notificationProvider={useNotificationProvider}
              resources={[
                {
                  name: "dashboard",
                  list: "/dashboard",
                  meta: { label: "Dashboard", icon: "◈" },
                },
                {
                  name: "orders",
                  list: "/orders",
                  meta: { label: "Orders", icon: "◻" },
                },
                {
                  name: "products",
                  list: "/products",
                  create: "/products/create",
                  edit: "/products/edit/:id",
                  meta: { label: "Products", icon: "✦" },
                },
                {
                  name: "profiles",
                  list: "/users",
                  meta: { label: "Users", icon: "⊕" },
                },
                {
                  name: "categories",
                  list: "/categories",
                  create: "/categories/create",
                  edit: "/categories/edit/:id",
                  meta: { label: "Categories", icon: "⬡" },
                },
                {
                  name: "banners",
                  list: "/banners",
                  create: "/banners/create",
                  edit: "/banners/edit/:id",
                  meta: { label: "Banners", icon: "◎" },
                },
              ]}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                liveMode: "auto",
              }}
            >
              <Routes>
                <Route
                  element={
                    <Authenticated
                      key="authenticated-routes"
                      fallback={<CatchAllNavigate to="/login" />}
                    >
                      <AdminLayout>
                        <Outlet />
                      </AdminLayout>
                    </Authenticated>
                  }
                >
                  <Route index element={<NavigateToResource resource="dashboard" />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/create" element={<Products />} />
                  <Route path="/products/edit/:id" element={<Products />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/banners" element={<Banners />} />
                </Route>
                <Route
                  element={
                    <Authenticated key="auth-pages" fallback={<Outlet />}>
                      <NavigateToResource resource="dashboard" />
                    </Authenticated>
                  }
                >
                  <Route path="/login" element={<LoginPage />} />
                </Route>
              </Routes>
              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
          </AntdApp>
        </ConfigProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;