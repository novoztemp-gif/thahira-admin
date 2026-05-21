import React, { useState } from "react";
import { useTable, useModalForm, DeleteButton } from "@refinedev/antd";
import { Table, Typography, Button, Modal, Form, Input, Switch, Space, Tooltip, Upload, message } from "antd";
import { PlusOutlined, EditOutlined, LinkOutlined, UploadOutlined } from "@ant-design/icons";
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

// ── Supabase image uploader ───────────────────────────────────────────────────
const ImageUploader: React.FC<{ value?: string; onChange?: (url: string) => void; bucket?: string }> = ({
  value, onChange, bucket = "banners",
}) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabaseClient.storage.from(bucket).upload(fileName, file, { upsert: true });
      if (error) throw error;
      const { data } = supabaseClient.storage.from(bucket).getPublicUrl(fileName);
      onChange?.(data.publicUrl);
      message.success("Image uploaded");
    } catch (e: any) {
      message.error("Upload failed: " + (e.message || "Unknown error"));
    } finally {
      setUploading(false);
    }
    return false; // prevent default antd upload
  };

  return (
    <div>
      {value && (
        <div style={{ marginBottom: 12 }}>
          <img src={value} alt="preview" style={{ width: "100%", maxHeight: 140, objectFit: "cover", borderRadius: 4, border: `1px solid ${BORDER}` }} />
        </div>
      )}
      <Upload
        accept="image/*"
        showUploadList={false}
        beforeUpload={(file) => { handleUpload(file); return false; }}
      >
        <Button
          icon={<UploadOutlined />}
          loading={uploading}
          style={{ background: "#1a1d24", border: `1px solid ${BORDER}`, color: "#e8e0d0", borderRadius: 4, width: "100%" }}
        >
          {uploading ? "Uploading..." : value ? "Replace Image" : "Upload Image"}
        </Button>
      </Upload>
      {value && (
        <div style={{ marginTop: 6, fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#5a5448", wordBreak: "break-all" }}>
          {value.slice(0, 60)}...
        </div>
      )}
    </div>
  );
};

export const Banners: React.FC = () => {
  const { tableProps } = useTable({
    resource: "banners",
    syncWithLocation: true,
    sorters: { initial: [{ field: "sort_order", order: "asc" }] },
  }) as any;

  const { modalProps: createModalProps, formProps: createFormProps, show: showCreate } = useModalForm({
    resource: "banners",
    action: "create",
    redirect: false,
    successNotification: { message: "Banner created", type: "success" },
  });

  const { modalProps: editModalProps, formProps: editFormProps, show: showEdit, setId: setEditId } = useModalForm({
    resource: "banners",
    action: "edit",
    redirect: false,
    id: undefined,
    autoResetForm: true,
    successNotification: { message: "Banner updated", type: "success" },
  });

  const columns = [
    {
      title: "PREVIEW", dataIndex: "image_url", width: 110,
      render: (url: string) => url ? (
        <img src={url} alt="banner" style={{ width: 88, height: 50, objectFit: "cover", borderRadius: 3, border: `1px solid ${BORDER}` }} />
      ) : (
        <div style={{ width: 88, height: 50, background: "#1a1d24", border: `1px solid ${BORDER}`, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 10, color: "#3a3a3a" }}>No image</Text>
        </div>
      ),
    },
    {
      title: "TITLE", dataIndex: "title",
      render: (v: string) => <Text style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#e8e0d0" }}>{v || "—"}</Text>,
    },
    {
      title: "LINK", dataIndex: "link_url", width: 200,
      render: (v: string) => v ? (
        <a href={v} target="_blank" rel="noreferrer" style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#5a8fc9", display: "flex", alignItems: "center", gap: 4 }}>
          <LinkOutlined />{v.length > 30 ? v.slice(0, 30) + "…" : v}
        </a>
      ) : <Text style={{ color: "#3a3a3a", fontSize: 11 }}>No link</Text>,
    },
    {
      title: "ORDER", dataIndex: "sort_order", width: 80,
      render: (v: number) => <Text style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#8a8070" }}>{v ?? "—"}</Text>,
    },
    {
      title: "STATUS", dataIndex: "is_active", width: 90,
      render: (v: boolean) => (
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 3,
          background: v ? "rgba(76,175,122,0.1)" : "rgba(58,58,58,0.3)",
          border: `1px solid ${v ? "rgba(76,175,122,0.2)" : BORDER}`,
          color: v ? "#4caf7a" : "#5a5448",
          fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
        }}>
          {v ? "Live" : "Hidden"}
        </span>
      ),
    },
    {
      title: "", width: 90,
      render: (_: any, r: any) => (
        <Space size={4}>
          <Tooltip title="Edit">
            <Button type="text" size="small" icon={<EditOutlined style={{ color: "#8a8070" }} />}
              onClick={(e) => { e.stopPropagation(); setEditId(r.id); showEdit(r.id); }} />
          </Tooltip>
          <DeleteButton resource="banners" recordItemId={r.id} hideText size="small" />
        </Space>
      ),
    },
  ];

  const BannerForm: React.FC<{ formProps: any }> = ({ formProps }) => (
    <Form {...formProps} layout="vertical" requiredMark={false}>
      <Form.Item label={<FormLabel>Banner Title</FormLabel>} name="title" rules={[{ required: true }]}>
        <Input placeholder="e.g. New Arrival — Midnight Black" style={inputStyle} />
      </Form.Item>

      <Form.Item
        label={<FormLabel>Banner Image</FormLabel>}
        name="image_url"
        rules={[{ required: true, message: "Please upload an image" }]}
      >
        <ImageUploader bucket="banners" />
      </Form.Item>

      <Form.Item label={<FormLabel>Link URL (optional)</FormLabel>} name="link_url">
        <Input placeholder="https://thahira.com/collection" prefix={<LinkOutlined style={{ color: "#5a5448" }} />} style={inputStyle} />
      </Form.Item>

      <Form.Item label={<FormLabel>Sort Order</FormLabel>} name="sort_order">
        <Input type="number" placeholder="1 = first" style={{ ...inputStyle, width: 120 }} />
      </Form.Item>

      <Form.Item label={<FormLabel>Show on Store</FormLabel>} name="is_active" valuePropName="checked" initialValue={true}>
        <Switch checkedChildren="Live" unCheckedChildren="Hidden" />
      </Form.Item>
    </Form>
  );

  return (
    <div>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a5448", marginBottom: 6 }}>Store Front</div>
          <Title level={2} style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: "#e8e0d0", margin: 0, fontSize: 28 }}>Banners</Title>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showCreate()}
          style={{ background: `linear-gradient(135deg, ${GOLD}, #8a6f2e)`, border: "none", borderRadius: 4, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 12, letterSpacing: "0.08em", color: "#0c0d0f", height: 38 }}>
          Add Banner
        </Button>
      </div>

      <div style={{ background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.12)", borderRadius: 6, padding: "12px 20px", marginBottom: 16, fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#8a8070", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ color: GOLD }}>✦</span>
        Upload banner images directly. Lower sort order = appears first. Only active banners show to customers.
      </div>

      <div style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 6, overflow: "hidden" }}>
        <Table {...tableProps} columns={columns} rowKey="id" style={{ fontFamily: "'DM Sans', sans-serif" }} />
      </div>

      <Modal {...createModalProps}
        title={<div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, color: "#e8e0d0" }}>New Banner</div>}
        width={560} footer={null} styles={modalStyle}>
        <BannerForm formProps={createFormProps} />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20, paddingTop: 16, borderTop: `1px solid ${BORDER}` }}>
          <Button onClick={(e) => createModalProps.onCancel?.(e as any)} style={{ borderColor: BORDER, color: "#8a8070" }}>Cancel</Button>
          <Button type="primary" onClick={() => createFormProps.form?.submit()} style={{ background: `linear-gradient(135deg, ${GOLD}, #8a6f2e)`, border: "none", color: "#0c0d0f" }}>Create</Button>
        </div>
      </Modal>

      <Modal {...editModalProps}
        title={<div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, color: "#e8e0d0" }}>Edit Banner</div>}
        width={560} footer={null} styles={modalStyle}>
        <BannerForm formProps={editFormProps} />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20, paddingTop: 16, borderTop: `1px solid ${BORDER}` }}>
          <Button onClick={(e) => editModalProps.onCancel?.(e as any)} style={{ borderColor: BORDER, color: "#8a8070" }}>Cancel</Button>
          <Button type="primary" onClick={() => editFormProps.form?.submit()} style={{ background: `linear-gradient(135deg, ${GOLD}, #8a6f2e)`, border: "none", color: "#0c0d0f" }}>Save</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Banners;