"use client";

import { useState, useEffect, useRef } from "react";
import { Progress, Typography, Card, Alert, List } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@/src/lib/hooks";
import { setStep, saveProgress } from "@/src/store/onboardingSlice";
import { URL } from "@/src/assets/url";

const { Title, Text } = Typography;

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
  const [errorMsg, setErrorMsg] = useState("");

  const pollInterval = useRef<ReturnType<typeof setInterval> | undefined>(undefined);


  const userData = customer_id ? users[customer_id] : null;
  console.log("userData", customer_id, userData);
  // 1. Polling Logic (Every 4 seconds)
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const site_id = userData?.site?.id;
        if (!site_id) return;

        const response = await fetch(`${URL.STORE_STATUS}?site_id=${site_id}`);
        const result = await response.json();

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
  }, [userData]);

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

  const finishBuild = () => {
    setPercent(100);
    setTimeout(async () => {
      // dispatch(setStep(4));
      await dispatch(saveProgress()).unwrap();
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full max-w-2xl mx-auto px-4">
      <div className="mb-8 text-center">
        <LoadingOutlined className="text-4xl text-blue-600 mb-4" spin={status !== "COMPLETED"} />
        <Title level={3}>Building your store...</Title>
        <Text type="secondary">Current Status: <strong>{status}</strong></Text>
      </div>

      <Card className="w-full mb-6">
        <Progress
          percent={percent}
          status={status === "FAILED" ? "exception" : "active"}
          strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
        />
      </Card>

      {/* Timeline Logs (Optional) */}
      <Card title="Activity Log" size="small" className="w-full max-h-40 overflow-y-auto">
        <List
          size="small"
          dataSource={timeline}
          renderItem={(item) => <List.Item className="text-xs font-mono">{item}</List.Item>}
        />
      </Card>
    </div>
  );
}