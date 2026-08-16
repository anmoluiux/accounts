"use client";

import { useState, useEffect, useRef } from "react";
import {
  Progress,
  Typography,
  Card,
  Descriptions,
  Button,
  Tooltip,
  Space,
  Tag,
} from "antd";
import {
  LoadingOutlined,
  LinkOutlined,
  CopyOutlined,
  GlobalOutlined,
  LockOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@/src/lib/hooks";
import { saveProgress, resetStepData, setBoardMerge } from "@/src/store/onboardingSlice";
import { URL, MAIN_SITE_URL } from "@/src/assets/url";
import styles from "./onboard.module.css";


const { Text } = Typography;

// Mapping API status to Progress %
const STATUS_MAP = {
  "PENDING": 5,
  "BUILDING": 15,
  "DB_CREATED": 20,
  "DB_IMPORTING": 40,
  "DB_PERSONALIZING": 90,
  "COMPLETED": 100,
  "FAILED": 0
};
type StatusType = keyof typeof STATUS_MAP;

export default function Building() {
  const dispatch = useAppDispatch();
  const { customer_id, stepData, users } = useAppSelector((state) => state.onboarding);

  const [percent, setPercent] = useState(0);
  const [status, setStatus] = useState<StatusType>("PENDING");
  const [timeline, setTimeline] = useState([]);

  const pollInterval = useRef<ReturnType<typeof setInterval> | undefined>(undefined);


  const userData = customer_id ? users[customer_id] : null;
  const siteId = userData?.site?.id;
  const OverallStatus = userData?.status;

  // 1. Polling Logic (Every 4 seconds)
  // Depends on the primitive siteId/customer_id rather than the `customer` and
  // `site` objects: object identities change whenever the store is rewritten,
  // which would tear down and recreate this interval mid-build.
  useEffect(() => {
    if (!siteId) return;

    const fetchStatus = async () => {
      try {
        const response = await fetch(`${URL.STORE_STATUS}?site_id=${siteId}`);
        const result = await response.json();

        dispatch(setBoardMerge({ name: `users.${customer_id}.status`, data: result.data }));

        if (result.status === "success") {
          const apiStatus = result.data.status as StatusType;
          setStatus(apiStatus);

          // Optional: Update timeline logs from API
          if (result.data.timeline) setTimeline(result.data.timeline);

          // Stop polling if done or failed
          if (apiStatus === "COMPLETED" || apiStatus === "FAILED") {
            clearInterval(pollInterval.current);
            if (apiStatus === "COMPLETED") finishBuild();
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    pollInterval.current = setInterval(fetchStatus, 4000);
    return () => clearInterval(pollInterval.current); // Cleanup on unmount
  }, [siteId, customer_id, dispatch]);

  // 2. Visual Progress Increments (Every 2 seconds)
  useEffect(() => {
    if (status === "COMPLETED" || status === "FAILED") return;

    const visualTimer = setInterval(() => {
      setPercent((prev) => {
        const target = STATUS_MAP[status] || 90;
        // Increment slowly if below current status threshold
        if (prev < target) return prev + 2;
        // Cap at 95% until COMPLETED is received
        if (prev >= 95) return 95;
        return prev;
      });
    }, 2000);

    return () => clearInterval(visualTimer);
  }, [status]);

  const [showPassword, setShowPassword] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearLead = () => {
    dispatch(resetStepData());
  };

  const finishBuild = () => {
    setPercent(100);
    setTimeout(async () => {
      // dispatch(setStep(4));
      await dispatch(saveProgress()).unwrap();
    }, 1500);
  };

  if (!userData?.site) {
    return <div>Loading...</div>
  }

  const adminLoginLink = `https://${userData?.site.subdomain}.${MAIN_SITE_URL}/admin`;

  return (
    <div>
      <div className={styles.stepHead}>
        <span className={styles.stepEyebrow}>
          <LoadingOutlined spin={status !== "COMPLETED"} style={{ fontSize: 12 }} />
          {status === "COMPLETED" ? "Ready" : "Building"}
        </span>
        <h2 className={styles.stepTitle}>
          {status === "COMPLETED" ? "Your store is live." : "We're building your store."}
        </h2>
        <p className={styles.stepSubtitle}>
          {status === "COMPLETED"
            ? "Everything below is yours. Keep these details somewhere safe."
            : "This usually takes a couple of minutes. You can leave this page open."}
        </p>
      </div>

      <Progress
        percent={percent}
        status={status === "FAILED" ? "exception" : "active"}
        strokeColor={{ "0%": "#2e4b3a", "100%": "#4fa97a" }}
      />
      <div className={styles.hint} style={{ marginTop: 6 }}>
        Current status: <strong>{status}</strong>
      </div>

      {/* Timeline Logs (Optional) */}
      {OverallStatus?.status === "COMPLETED" &&
        <Card title="Store details" size="small" style={{ marginTop: 24 }}>

          {/* Vertical, and no fixed label width. Horizontally with a 220px
              label there is ~150px left for the value inside the 452px form
              column, which broke the store URLs onto one character per line.
              Stacking gives the value the full width. */}
          <Descriptions
            column={1}
            layout="vertical"
            size="small"
            colon={false}
            labelStyle={{ fontWeight: 500 }}
            contentStyle={{ display: "flex", alignItems: "center", width: "100%", wordBreak: "break-all" }}
          >
            {/* Site Name */}
            <Descriptions.Item
              label={
                <Space>
                  <GlobalOutlined />
                  Site Name
                </Space>
              }
            >
              <Text strong>{userData?.site.name}</Text>
            </Descriptions.Item>

            {/* Type */}
            <Descriptions.Item
              label={
                <Space>
                  <AppstoreOutlined />
                  Type
                </Space>
              }
            >
              <Tag color="blue">{userData?.site.type}</Tag>
            </Descriptions.Item>

            {/* Store Link */}
            <Descriptions.Item
              label={
                <Space>
                  <LinkOutlined />
                  Store Link
                </Space>
              }
            >
              <Space>
                <Text>{userData?.site.subdomain}.{MAIN_SITE_URL}</Text>
                <Tooltip title="Open in new tab">
                  <Button
                    type="text"
                    icon={<LinkOutlined />}
                    onClick={() => window.open(`https://${userData?.site.subdomain}.${MAIN_SITE_URL}`, "_blank")}
                  />
                </Tooltip>
                <Tooltip title="Copy link">
                  <Button
                    type="text"
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(`https://${userData?.site.subdomain}.${MAIN_SITE_URL}`)}
                  />
                </Tooltip>
              </Space>
            </Descriptions.Item>

            {/* Admin Login Link */}
            <Descriptions.Item
              label={
                <Space>
                  <LinkOutlined />
                  Admin Login
                </Space>
              }
            >
              <Space>
                <Text>{userData?.site.subdomain}.{MAIN_SITE_URL}/admin</Text>
                <Tooltip title="Open admin panel">
                  <Button
                    type="text"
                    icon={<LinkOutlined />}
                    onClick={() => window.open(adminLoginLink, "_blank")}
                  />
                </Tooltip>
                <Tooltip title="Copy link">
                  <Button
                    type="text"
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(adminLoginLink)}
                  />
                </Tooltip>
              </Space>
            </Descriptions.Item>

            {/* Admin Password */}
            <Descriptions.Item
              label={
                <Space>
                  <LockOutlined />
                  Admin Password
                </Space>
              }
            >
              <Space>
                <Text>
                  {showPassword ? 'adminPassword' : "********"}
                </Text>

                {/* <Tooltip title={showPassword ? "Hide password" : "Show password"}>
                <Button
                  type="text"
                  icon={showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  onClick={() => setShowPassword(!showPassword)}
                />
              </Tooltip>

              <Tooltip title="Copy password">
                <Button
                  type="text"
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard('adminPassword')}
                />
              </Tooltip> */}

                <Text type="secondary" style={{ fontSize: 12 }}> Your Password</Text>
              </Space>
            </Descriptions.Item>
          </Descriptions>




          {/* <List
          size="small"
          dataSource={timeline}
          renderItem={(item) => <List.Item className="text-xs font-mono">{item}</List.Item>}
        /> */}
        </Card>
      }

      {/* Escape hatch, demoted: it wipes the lead and restarts the funnel, so it
          no longer sits under the progress bar looking like the primary action. */}
      <button type="button" className={styles.backLink} style={{ marginTop: 24 }} onClick={clearLead}>
        Start over with a different store
      </button>
    </div>
  );
}