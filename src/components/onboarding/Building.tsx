"use client";

import { useState, useEffect, useRef } from "react";
import { Progress, Typography, Card, Alert } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@/src/lib/hooks";
import { saveProgress, setStep } from "@/src/store/onboardingSlice";

const { Title, Text } = Typography;

const LOADING_PHRASES = ["Initializing server environment...", "Cloning OpenCart architecture...", "Injecting database schema...", "Configuring secure routes...", "Finalizing your dashboard..."];

export default function Building() {
  const dispatch = useAppDispatch();
  // Ensure your redux store has these values
  const { stepData, userData } = useAppSelector((state) => state.onboarding);

  const [percent, setPercent] = useState(0);
  const [status, setStatus] = useState("PENDING"); // PENDING | BUILDING | COMPLETED | FAILED
  const [errorMsg, setErrorMsg] = useState("");

  // Use a ref to prevent double-firing in React Strict Mode
  const hasTriggered = useRef(false);

  // 1. The "Fake" Progress Animation (Visual comfort)
  // We run this independently, but cap it at 90% until the API returns success
  useEffect(() => {
    if (status === "COMPLETED" || status === "FAILED") return;

    const timer = setInterval(() => {
      setPercent((prev) => {
        // Slow down as we get closer to 90%
        if (prev >= 90) return 90;
        return prev + 1;
      });
    }, 150); // Adjust speed

    return () => clearInterval(timer);
  }, [status]);

  // 2. The Real Work (Triggering DB Creation)
  useEffect(() => {
    const triggerBuild = async () => {
      if (hasTriggered.current) return;
      hasTriggered.current = true;

      try {
        setStatus("BUILDING");

        // Assuming stepData.config.db_database exists from Step 2
        // If not, you might need to regenerate the name logic here or ensure it's in Redux
        const dbName = stepData.siteName; // fallback logic
        const site_id = userData.site.id;
        const customer_id = userData.site.customer_id;

        if (!site_id || !customer_id) {
          throw new Error("Session lost. Please refresh or login again.");
        }

        const response = await fetch(`http://localhost/api/v1/customer/store/status?site_id=${site_id}&customer_id=${customer_id}&dbName=${dbName}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const result = await response.json();

        if (!response.ok) throw new Error(result.error);

        // SUCCESS!
        setStatus("COMPLETED");
        setPercent(100);

        // Wait 1 second then move on
        setTimeout(async () => {
          // dispatch(setStep(4)); // Or whatever your next step is
          await dispatch(saveProgress()).unwrap();
        }, 1000);
      } catch (err: any) {
        setStatus("FAILED");
        setErrorMsg(err.message || "Construction failed.");
        hasTriggered.current = false; // Allow retry
      }
    };

    // On Mount: Check if we need to start
    triggerBuild();
  }, [dispatch, stepData]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full max-w-xl mx-auto px-4 animate-fadeIn">
      {/* HEADER */}
      <div className="mb-8 text-center">
        {status === "FAILED" ? (
          <div className="p-4 bg-red-50 rounded-full mb-6 inline-block">❌</div>
        ) : (
          <div className="inline-block p-4 rounded-full bg-blue-50 mb-6 animate-bounce">
            <LoadingOutlined className="text-4xl text-blue-600" spin={status !== "COMPLETED"} />
          </div>
        )}

        <Title level={3} className="mb-2">
          {status === "COMPLETED" ? "Store Ready!" : LOADING_PHRASES[Math.floor((percent / 100) * LOADING_PHRASES.length) % LOADING_PHRASES.length]}
        </Title>
        <Text type="secondary">
          Creating <strong>{stepData.siteName}</strong>
        </Text>
      </div>

      {/* ERROR HANDLING */}
      {status === "FAILED" && (
        <Alert
          title="Build Failed"
          description={errorMsg}
          type="error"
          showIcon
          className="mb-6 w-full"
          action={
            <button onClick={() => window.location.reload()} className="btn-sm">
              Retry
            </button>
          }
        />
      )}

      {/* PROGRESS BAR */}
      <Card className="w-full shadow-sm border-0 bg-transparent">
        <Progress percent={percent} status={status === "FAILED" ? "exception" : "active"} strokeColor={{ "0%": "#108ee9", "100%": "#87d068" }} showInfo={false} strokeWidth={12} />
        <div className="flex justify-between text-xs text-gray-400 font-mono mt-2">
          <span>STATUS: {status}</span>
          <span>{percent}%</span>
        </div>
      </Card>
    </div>
  );
}
