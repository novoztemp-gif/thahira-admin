import React, { useState } from "react";
import { useLogin } from "@refinedev/core";
import { Form, Input, Button, Typography, Alert } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";

const { Text } = Typography;
const GOLD = "#c9a84c";

export const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
 const { mutate: login, isLoading = false } = useLogin<{ email: string; password: string }>() as any;
  const [error, setError] = useState("");

  const handleSubmit = (values: { email: string; password: string }) => {
    setError("");
    login(values, {
      onError: (err: any) => {
        setError(err?.message || "Access denied.");
      },
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0c0d0f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            radial-gradient(ellipse at 20% 50%, rgba(201,168,76,0.04) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(201,168,76,0.03) 0%, transparent 50%)
          `,
          pointerEvents: "none",
        }}
      />

      {/* Grid lines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          width: 420,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div
            style={{
              width: 52,
              height: 52,
              background: `linear-gradient(135deg, ${GOLD}, #8a6f2e)`,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: 22,
              color: "#0c0d0f",
              fontWeight: 700,
              fontFamily: "'Cormorant Garamond', serif",
            }}
          >
            T
          </div>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 28,
              fontWeight: 300,
              color: "#e8e0d0",
              letterSpacing: "0.05em",
              lineHeight: 1.2,
            }}
          >
            Thahira Groups
          </div>
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              color: "#5a5448",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              marginTop: 6,
            }}
          >
            Admin Console
          </div>
        </div>

        {/* Card */}
        <div
          style={{
            background: "#13151a",
            border: "1px solid #22262e",
            borderRadius: 8,
            padding: "36px 40px",
          }}
        >
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.2em",
              color: GOLD,
              textTransform: "uppercase",
              marginBottom: 24,
            }}
          >
            — Secure Access —
          </div>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              style={{
                marginBottom: 20,
                background: "rgba(192,96,96,0.08)",
                border: "1px solid rgba(192,96,96,0.2)",
                borderRadius: 4,
              }}
            />
          )}

          <Form form={form} onFinish={handleSubmit} layout="vertical" requiredMark={false}>
            <Form.Item
              name="email"
              label={
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 11,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#5a5448",
                  }}
                >
                  Email Address
                </span>
              }
              rules={[{ required: true, type: "email", message: "Valid email required" }]}
            >
              <Input
                prefix={<MailOutlined style={{ color: "#5a5448" }} />}
                placeholder="admin@thahira.com"
                size="large"
                style={{
                  background: "#1a1d24",
                  border: "1px solid #22262e",
                  borderRadius: 4,
                  color: "#e8e0d0",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 11,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#5a5448",
                  }}
                >
                  Password
                </span>
              }
              rules={[{ required: true, message: "Password required" }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "#5a5448" }} />}
                placeholder="••••••••"
                size="large"
                style={{
                  background: "#1a1d24",
                  border: "1px solid #22262e",
                  borderRadius: 4,
                  color: "#e8e0d0",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 28 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                size="large"
                block
                style={{
                  background: `linear-gradient(135deg, ${GOLD}, #8a6f2e)`,
                  border: "none",
                  borderRadius: 4,
                  height: 48,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                  fontSize: 13,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#0c0d0f",
                }}
              >
                {isLoading ? "Verifying..." : "Access Panel"}
              </Button>
            </Form.Item>
          </Form>
        </div>

        <Text
          style={{
            display: "block",
            textAlign: "center",
            marginTop: 24,
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            color: "#2a2820",
            letterSpacing: "0.1em",
          }}
        >
          Restricted to authorised personnel only.
        </Text>
      </div>
    </div>
  );
};