import React, { useState } from "react";
import { useTable, useModalForm, DeleteButton } from "@refinedev/antd";
import {
  Table, Typography, Button, Modal, Form, Input, InputNumber,
  Switch, Space, Tag, Tooltip, Row, Col, Upload, message,
} from "antd";
import { PlusOutlined, EditOutlined, CheckCircleOutlined, StopOutlined, UploadOutlined } from "@ant-design/icons";
import { supabaseClient } from "../../providers/supabase-client";

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

// ── Production-Safe Stock Badge ───────────────────────────────────────────────
const StockTag: React.FC<{ stock: number }> = ({ stock }) => {
  if (stock === 0)
    return <Tag style={{ background: "rgba(192,96,96,0.1)", border: "1px solid rgba(192,96,96,0.2)", color: "#c06060", fontFamily: "'DM Mono', monospace", fontSize: 10 }}>Out of Stock</Tag>;
  if (stock < 5)
    return <Tag style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", color: "#c9a84c", fontFamily: "'DM Mono', monospace", fontSize: 10 }}>Low — {stock} left</Tag>;
  return <Tag style={{ background: "rgba(76,175,122,0.1)", border: "1px solid rgba(76,175,122,0.2)", color: "#4caf7a", fontFamily: "'DM Mono', monospace", fontSize: 10 }}>{stock} in stock</Tag>;
};

// ── Production-Safe Image Uploader ────────────────────────────────────────────
const MultiImageUploader: React.FC<{ value?: string[]; onChange?: (urls: string[]) => void }> = ({
  value, onChange,
}) => {
  const [uploading, setUploading] = useState(false);
  
  // PERMANENT FIX: Defensively safeguard against 'null' database returns
  const safeValue = Array.isArray(value) ? value : [];

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabaseClient.storage.from("product-images").upload(fileName, file, { upsert: true });
      if (error) throw error;
      const { data } = supabaseClient.storage.from("product-images").getPublicUrl(fileName);
      onChange?.([...safeValue, data.publicUrl]);
      message.success("Image uploaded successfully");
    } catch (e: any) {
      message.error("Upload failed: " + (e.message || "Unknown error"));
    } finally {
      setUploading(false);
    }
    return false;
  };

  const removeImage = (idx: number) => {
    const updated = safeValue.filter((_, i) => i !== idx);
    onChange?.(updated);
  };

  return (
    <div>
      {safeValue.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {safeValue.map((url, idx) => (
            <div key={idx} style={{ position: "relative" }}>
              <img src={url} alt={`img-${idx}`}
                style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 4, border: `1px solid ${BORDER}` }} />
              <button
                onClick={(e) => { e.preventDefault(); removeImage(idx); }}
                style={{
                  position: "absolute", top: -6, right: -6, width: 18, height: 18,
                  background: "#c06060", border: "none", borderRadius: "50%",
                  color: "#fff", fontSize: 10, cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center", lineHeight: 1,
                }}
              >✕</button>
            </div>
          ))}
        </div>
      )}
      <Upload accept="image/*" showUploadList={false} multiple beforeUpload={(file) => { handleUpload(file); return false; }}>
        <Button icon={<UploadOutlined />} loading={uploading} style={{ ...inputStyle, width: "100%" }}>
          {uploading ? "Uploading..." : `Upload Image${safeValue.length > 0 ? " (Add More)" : ""}`}
        </Button>
      </Upload>
    </div>
  );
};

// ── Products Core ─────────────────────────────────────────────────────────────
export const Products: React.FC = () => {
  const { tableProps } = useTable({
    resource: "products",
    syncWithLocation: true,
    sorters: { initial: [{ field: "created_at", order: "desc" }] },
  }) as any;

  // PERMANENT FIX: liveMode="off" prevents Supabase WebSocket crashes
  const { modalProps: createModalProps, formProps: createFormProps, show: showCreate } = useModalForm({
    resource: "products",
    action: "create",
    redirect: false,
    liveMode: "off",
    successNotification: { message: "Product created successfully", type: "success" },
  });

  // PERMANENT FIX: Removed duplicate ID setting that caused useForm console warnings
  const { modalProps: editModalProps, formProps: editFormProps, show: showEdit } = useModalForm({
    resource: "products",
    action: "edit",
    redirect: false,
    liveMode: "off",
    autoResetForm: true,
    successNotification: { message: "Product updated successfully", type: "success" },
  });

  const columns = [
    {
      title: "PRODUCT", dataIndex: "name",
      render: (name: string, r: any) => (
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ flexShrink: 0 }}>
            {r.images?.[0] ? (
              <img src={r.images[0]} alt={name}
                style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 4, border: `1px solid ${BORDER}` }} />
            ) : (
              <div style={{ width: 48, height: 48, background: "#1a1d24", border: `1px solid ${BORDER}`, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="36" height="9" viewBox="0 0 340 80" fill="none">
                  <rect x="32" y="26" width="210" height="28" rx="2" fill="#c9a84c" opacity={0.5} />
                  <rect x="248" y="22" width="88" height="36" rx="14" fill="#161210" />
                </svg>
              </div>
            )}
          </div>
          <div>
            <Text style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#e8e0d0", display: "block" }}>{name}</Text>
            {r.slug && <Text style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#5a5448" }}>/{r.slug}</Text>}
          </div>
        </div>
      ),
    },
    {
      title: "PRICE", dataIndex: "price", width: 130, sorter: true,
      render: (v: number, r: any) => (
        <div>
          <Text style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, color: "#e8e0d0" }}>₹{Number(v).toLocaleString("en-IN")}</Text>
          {r.original_price && <Text style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#5a5448", textDecoration: "line-through", display: "block" }}>₹{Number(r.original_price).toLocaleString("en-IN")}</Text>}
        </div>
      ),
    },
    {
      title: "STOCK", dataIndex: "stock", width: 130, sorter: true,
      render: (v: number) => <StockTag stock={v} />,
    },
    {
      title: "ACTIVE", dataIndex: "is_active", width: 100,
      render: (v: boolean) => (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: v ? "#4caf7a" : "#5a5448" }}>
          {v ? <CheckCircleOutlined /> : <StopOutlined />}{v ? "Active" : "Hidden"}
        </span>
      ),
    },
    {
      title: "", width: 90,
      render: (_: any, r: any) => (
        <Space size={4}>
          <Tooltip title="Edit">
            {/* PERMANENT FIX: Corrected onClick handler to only fire showEdit */}
            <Button type="text" size="small" icon={<EditOutlined style={{ color: "#8a8070" }} />}
              onClick={(e) => { e.stopPropagation(); showEdit(r.id); }} />
          </Tooltip>
          <DeleteButton resource="products" recordItemId={r.id} hideText size="small" />
        </Space>
      ),
    },
  ];

  const ProductForm: React.FC<{ formProps: any; mode: "create" | "edit" }> = ({ formProps, mode }) => (
    <Form {...formProps} layout="vertical" requiredMark={false}>
      <Row gutter={16}>
        <Col span={16}>
          <Form.Item label={<FormLabel>Pen Name</FormLabel>} name="name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Noir Signature Gold" style={inputStyle}
              onChange={(e) => {
                if (mode === "create") {
                  const slug = e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
                  formProps.form?.setFieldsValue({ slug });
                }
              }}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={<FormLabel>URL Slug</FormLabel>} name="slug" rules={[{ required: true }]}>
            <Input placeholder="noir-signature-gold" style={inputStyle} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label={<FormLabel>Description</FormLabel>} name="description">
        <Input.TextArea rows={3} placeholder="Describe the pen..." style={{ ...inputStyle, resize: "none" }} />
      </Form.Item>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label={<FormLabel>Price (₹)</FormLabel>} name="price" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: "100%", background: "#1a1d24", border: `1px solid ${BORDER}`, borderRadius: 4 }}
              formatter={(v) => `₹ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(v) => v?.replace(/₹\s?|(,*)/g, "") as any}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={<FormLabel>Original Price (₹)</FormLabel>} name="original_price">
            <InputNumber min={0} style={{ width: "100%", background: "#1a1d24", border: `1px solid ${BORDER}`, borderRadius: 4 }}
              placeholder="Strikethrough price"
              formatter={(v) => v ? `₹ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}
              parser={(v) => v?.replace(/₹\s?|(,*)/g, "") as any}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={<FormLabel>Stock Qty</FormLabel>} name="stock" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: "100%", background: "#1a1d24", border: `1px solid ${BORDER}`, borderRadius: 4 }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label={<FormLabel>Category ID (optional)</FormLabel>} name="category_id">
            <Input placeholder="UUID of category" style={inputStyle} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={<FormLabel>Active on Store</FormLabel>} name="is_active" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="Visible" unCheckedChildren="Hidden" />
          </Form.Item>
        </Col>
      </Row>

      <div style={{ height: 1, background: BORDER, margin: "8px 0 20px" }} />
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a5448", marginBottom: 12 }}>
        — Product Images —
      </div>

      <Form.Item name="images">
        <MultiImageUploader />
      </Form.Item>
    </Form>
  );

  return (
    <div>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a5448", marginBottom: 6 }}>Catalogue</div>
          <Title level={2} style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: "#e8e0d0", margin: 0, fontSize: 28 }}>Products</Title>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showCreate()}
          style={{ background: `linear-gradient(135deg, ${GOLD}, #8a6f2e)`, border: "none", borderRadius: 4, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 12, letterSpacing: "0.08em", color: "#0c0d0f", height: 38 }}>
          Add New Pen
        </Button>
      </div>

      <div style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 6, overflow: "hidden" }}>
        <Table {...tableProps} columns={columns} rowKey="id" style={{ fontFamily: "'DM Sans', sans-serif" }} />
      </div>

      <Modal {...createModalProps}
        title={<div><div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a5448", marginBottom: 4 }}>New Product</div><div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, color: "#e8e0d0" }}>Add a Pen</div></div>}
        width={700} footer={null} styles={modalStyle}>
        <ProductForm formProps={createFormProps} mode="create" />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24, paddingTop: 20, borderTop: `1px solid ${BORDER}` }}>
          <Button onClick={(e) => createModalProps.onCancel?.(e as any)} style={{ fontFamily: "'DM Sans', sans-serif", borderColor: BORDER, color: "#8a8070" }}>Cancel</Button>
          <Button type="primary" onClick={() => createFormProps.form?.submit()} style={{ background: `linear-gradient(135deg, ${GOLD}, #8a6f2e)`, border: "none", color: "#0c0d0f", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>Create Product</Button>
        </div>
      </Modal>

      <Modal {...editModalProps}
        title={<div><div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a5448", marginBottom: 4 }}>Edit Product</div><div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, color: "#e8e0d0" }}>Update Pen Details</div></div>}
        width={700} footer={null} styles={modalStyle}>
        <ProductForm formProps={editFormProps} mode="edit" />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24, paddingTop: 20, borderTop: `1px solid ${BORDER}` }}>
          <Button onClick={(e) => editModalProps.onCancel?.(e as any)} style={{ fontFamily: "'DM Sans', sans-serif", borderColor: BORDER, color: "#8a8070" }}>Cancel</Button>
          <Button type="primary" onClick={() => editFormProps.form?.submit()} style={{ background: `linear-gradient(135deg, ${GOLD}, #8a6f2e)`, border: "none", color: "#0c0d0f", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>Save Changes</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Products;