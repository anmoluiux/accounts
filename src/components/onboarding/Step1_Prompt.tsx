"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Input, Button, Select, Typography, Card, Form, Space } from "antd";
import { ArrowRightOutlined, ThunderboltFilled, CheckCircleFilled, CloseCircleFilled, LoadingOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@/src/lib/hooks";
import { saveProgress, setStep, updateFormData } from "@/src/store/onboardingSlice";
import debounce from "lodash/debounce";
import { URL, MAIN_SITE_URL } from "@/src/assets/url";

const { Title, Text } = Typography;
const { Option } = Select;

export default function Step1_Prompt() {
  const dispatch = useAppDispatch();
  const savedData = useAppSelector((state) => state.onboarding.stepData);

  // Form State
  const [subdomain, setSubdomain] = useState(savedData.siteName || ""); // siteName acts as subdomain
  const [businessName, setBusinessName] = useState(savedData.businessName || "");
  const [type, setType] = useState(savedData.siteType || "online_store");

  // Validation State
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Debounced Validation Function
  // We use useCallback so the debounce function doesn't get recreated on every render
  const debouncedCheckAvailability = useRef(
    debounce(async (val: string) => {
      if (!val || val.length < 3) {
        setIsChecking(false);
        setIsAvailable(null);
        return;
      }

      try {
        const res = await fetch(`${URL.CHECK_SUBDOMAIN}?subdomain=${val}`);
        const data = await res.json().then((res) => res.data);
        console.log("API Response:", data)
        setIsChecking(false);

        if (data.error) {
          setIsAvailable(false);
          setErrorMsg(data.error);
        } else {
          setIsAvailable(data.available);
          setErrorMsg(data.available ? "" : "Already taken");
        }
      } catch {
        setIsChecking(false);
        setIsAvailable(false);
        setErrorMsg("Network error");
      }
    }, 500),
  ).current;



  // Handle Subdomain Input
  const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");

    setSubdomain(val);
    setIsAvailable(null);
    setErrorMsg("");

    if (val.length >= 3) {
      setIsChecking(true);
      debouncedCheckAvailability(val);
    } else {
      setIsChecking(false);
    }
  };

  const handleNext = async () => {
    if (!subdomain || !isAvailable || !businessName) return;

    // 1. Save Lead Data to Redux
    dispatch(updateFormData({ siteName: subdomain, businessName: businessName, siteType: type }));

    // 2. Trigger Save for API
    try {
      dispatch(saveProgress()).unwrap();
      dispatch(setStep(1));
    } catch (error) {
      console.error("Failed to save:", error);
    }
  };

  useEffect(() => {
    return () => {
      debouncedCheckAvailability.cancel();
    };
  }, [debouncedCheckAvailability]);

  const options = [
    { value: "online_store", label: "Online Store" },
    { value: "blog", label: "Blog" },
    { value: "portfolio", label: "Portfolio" },
    { value: "restaurant", label: "Restaurant / Food" },
  ];

  const StatusSuffix = ({ isChecking, isAvailable }: { isChecking: boolean; isAvailable: boolean | null }) => {
    if (isChecking) return <LoadingOutlined />;
    if (isAvailable === true) return <CheckCircleFilled className="text-green-500" />;
    if (isAvailable === false) return <CloseCircleFilled className="text-red-500" />;
    return <span style={{ width: 16, display: "inline-block" }} />; // placeholder
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-2xl mx-auto px-4 animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4 animate-pulse">
          <ThunderboltFilled style={{ fontSize: "24px" }} />
        </div>
        <Title level={2} style={{ margin: 0 }}>
          Let's name your dream store.
        </Title>
        <Text type="secondary" className="text-lg mt-2 block">
          Choose a unique address and tell us your brand name.
        </Text>
      </div>

      <Card className="w-full shadow-xl border-0 rounded-2xl overflow-hidden">
        <div className="flex flex-col gap-6 p-6">
          {/* 1. Business Name (Simple) */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Brand Name</label>
            <Input size="large" placeholder="e.g. Kicks On Fire" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="rounded-lg" />
          </div>

          {/* 2. Subdomain (Complex Validation) */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Store Address {errorMsg && <span className="text-red-500 normal-case ml-2">- {errorMsg}</span>}</label>

            <Space.Compact style={{ width: "100%" }}>
              {/* Subdomain input */}
              <Input
                size="large"
                placeholder="toyscitys"
                value={subdomain}
                onChange={handleSubdomainChange}
                className="rounded-l-lg"
                suffix={<StatusSuffix isChecking={isChecking} isAvailable={isAvailable} />}
                status={isAvailable === false ? "error" : ""}
              />

              {/* Domain suffix */}
              <Input
                size="large"
                value={'.'+MAIN_SITE_URL}
                readOnly
                className="rounded-r-lg border-l-0 bg-white text-gray-500"
                style={{
                  width: 300,
                  pointerEvents: "none", // feels like text, not input
                }}
              />
            </Space.Compact>

            <div className="text-xs text-gray-400 mt-1 pl-1">This will be your temporary URL. You can add a custom domain later.</div>
          </div>

          {/* 3. Type Selection */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Business Type</label>
            <Select size="large" value={type} onChange={setType} className="w-full rounded-lg">
              {options.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </div>

          <Button
            type="primary"
            size="large"
            onClick={handleNext}
            loading={isChecking}
            disabled={!subdomain || !businessName || isAvailable !== true}
            className="h-12 text-lg font-semibold bg-black hover:bg-gray-800 mt-2 rounded-lg"
            icon={<ArrowRightOutlined />}
            iconPlacement="end">
            Start Building
          </Button>
        </div>
      </Card>
    </div>
  );
}
