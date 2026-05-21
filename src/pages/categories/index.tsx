import React from "react";
import { useTable, useModalForm, DeleteButton } from "@refinedev/antd";
import { Table, Typography, Button, Modal, Form, Input, Space, Tooltip } from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;
const GOLD = "#c9a84c";
const BORDER = "#22262e";
const PANEL = "#13151a";

const FormLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#5a5448" }}>
    {children}
  </span>
);

const inputStyle = { background: "#1a1d24", border: `1px solid ${BORDER}`, color: "#e8e0d0", borderRadius: 4 };
const modalStyle = {
  content: { background: "#13151a", border: `1px solid ${BORDER}`, borderRadius: 8 },
  header: { background: "#13151a", borderBottom: `1px solid ${BORDER}`, paddingBottom: 16 },
  body: { paddingTop: 24 },
};

// NOTE: categories table has NO is_active column — only id, name, slug, description, created_at
export const Categories: React.FC = () => {
  const { tableProps } = useTable({
    resource: "categories",
    syncWithLocation: true,
    sorters: { initial: [{ field: "created_at", order: "asc" }] },
  }) as any;

  const { modalProps: createModalProps, formProps: createFormProps, show: showCreate } = useModalForm({
    resource: "categories",
    action: "create",
    redirect: false,
    successNotification: { message: "Category created", type: "success" },
  });

  const { modalProps: editModalProps, formProps: editFormProps, show: showEdit, setId: setEditId } = useModalForm({
    resource: "categories",
    action: "edit",
    redirect: false,
    id: undefined,
    autoResetForm: true,
    successNotification: { message: "Category updated", type: "success" },
  });

  const columns = [
    {
      title: "NAME", dataIndex: "name",
      render: (v: string) => <Text style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#e8e0d0" }}>{v}</Text>,
    },
    {
      title: "SLUG", dataIndex: "slug",
      render: (v: string) => <Text style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#5a5448" }}>/{v}</Text>,
    },
    {
      title: "DESCRIPTION", dataIndex: "description",
      render: (v: string) => <Text style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#8a8070" }}>{v ? (v.length > 60 ? v.slice(0, 60) + "…" : v) : "—"}</Text>,
    },
    {
      title: "CREATED", dataIndex: "created_at", width: 140,
      render: (v: string) => <Text style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#5a5448" }}>{v ? new Date(v).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</Text>,
    },
    {
      title: "", width: 90,
      render: (_: any, r: any) => (
        <Space size={4}>
          <Tooltip title="Edit">
            <Button type="text" size="small" icon={<EditOutlined style={{ color: "#8a8070" }} />}
              onClick={(e) => { e.stopPropagation(); setEditId(r.id); showEdit(r.id); }} />
          </Tooltip>
          <DeleteButton resource="categories" recordItemId={r.id} hideText size="small" />
        </Space>
      ),
    },
  ];

  const CategoryForm: React.FC<{ formProps: any }> = ({ formProps }) => (
    <Form {...formProps} layout="vertical" requiredMark={false}>
      <Form.Item label={<FormLabel>Category Name</FormLabel>} name="name" rules={[{ required: true }]}>
        <Input placeholder="e.g. Signature Collection" style={inputStyle}
          onChange={(e) => {
            const slug = e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
            formProps.form?.setFieldsValue({ slug });
          }}
        />
      </Form.Item>
      <Form.Item label={<FormLabel>URL Slug</FormLabel>} name="slug" rules={[{ required: true }]}>
        <Input placeholder="signature-collection" style={inputStyle} />
      </Form.Item>
      <Form.Item label={<FormLabel>Description</FormLabel>} name="description">
        <Input.TextArea rows={2} placeholder="Short description..." style={{ ...inputStyle, resize: "none" }} />
      </Form.Item>
    </Form>
  );

  return (
    <div>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a5448", marginBottom: 6 }}>Catalogue</div>
          <Title level={2} style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: "#e8e0d0", margin: 0, fontSize: 28 }}>Categories</Title>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showCreate()}
          style={{ background: `linear-gradient(135deg, ${GOLD}, #8a6f2e)`, border: "none", borderRadius: 4, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 12, letterSpacing: "0.08em", color: "#0c0d0f", height: 38 }}>
          Add Category
        </Button>
      </div>

      <div style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 6, overflow: "hidden" }}>
        <Table {...tableProps} columns={columns} rowKey="id" style={{ fontFamily: "'DM Sans', sans-serif" }} />
      </div>

      <Modal {...createModalProps}
        title={<div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, color: "#e8e0d0" }}>New Category</div>}
        width={500} footer={null} styles={modalStyle}>
        <CategoryForm formProps={createFormProps} />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20, paddingTop: 16, borderTop: `1px solid ${BORDER}` }}>
          <Button onClick={(e) => createModalProps.onCancel?.(e as any)} style={{ borderColor: BORDER, color: "#8a8070" }}>Cancel</Button>
          <Button type="primary" onClick={() => createFormProps.form?.submit()} style={{ background: `linear-gradient(135deg, ${GOLD}, #8a6f2e)`, border: "none", color: "#0c0d0f" }}>Create</Button>
        </div>
      </Modal>

      <Modal {...editModalProps}
        title={<div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, color: "#e8e0d0" }}>Edit Category</div>}
        width={500} footer={null} styles={modalStyle}>
        <CategoryForm formProps={editFormProps} />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20, paddingTop: 16, borderTop: `1px solid ${BORDER}` }}>
          <Button onClick={(e) => editModalProps.onCancel?.(e as any)} style={{ borderColor: BORDER, color: "#8a8070" }}>Cancel</Button>
          <Button type="primary" onClick={() => editFormProps.form?.submit()} style={{ background: `linear-gradient(135deg, ${GOLD}, #8a6f2e)`, border: "none", color: "#0c0d0f" }}>Save</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Categories;