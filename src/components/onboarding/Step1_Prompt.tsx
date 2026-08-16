"use client";

import { useState, useEffect, useRef } from "react";
import { Input, Button, Select, Alert } from "antd";
import { ArrowRightOutlined, CheckCircleFilled, CloseCircleFilled, LoadingOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@/src/lib/hooks";
import { saveProgress, setStep, updateFormData } from "@/src/store/onboardingSlice";
import debounce from "lodash/debounce";
import { URL, MAIN_SITE_URL } from "@/src/assets/url";
import styles from "./onboard.module.css";

const options = [
  { value: "online_store", label: "Online Store" },
  { value: "blog", label: "Blog" },
  { value: "portfolio", label: "Portfolio" },
  { value: "restaurant", label: "Restaurant / Food" },
];

// Declared at module scope on purpose. Defined inside the component it would be
// a brand-new component type every render, so React would unmount and remount
// the suffix node on every keystroke instead of just updating the icon.
const StatusIcon = ({ isChecking, isAvailable }: { isChecking: boolean; isAvailable: boolean | null }) => {
  if (isChecking) return <LoadingOutlined style={{ color: "var(--bw-ink-faint)" }} />;
  if (isAvailable === true) return <CheckCircleFilled style={{ color: "var(--bw-mint)" }} />;
  if (isAvailable === false) return <CloseCircleFilled style={{ color: "var(--bw-danger)" }} />;
  return <span style={{ width: 16, display: "inline-block" }} />; // placeholder
};

// The domain tail rides inside the input's own border rather than in `addonAfter`
// (deprecated in antd 6, which points at Space.Compact) or a second read-only
// Input. Both alternatives add a node the user can focus and select that isn't
// really a field; as a suffix it is inert text sharing the real input's border,
// so there is nothing to fake and nothing to tab into.
const AddressSuffix = ({ isChecking, isAvailable }: { isChecking: boolean; isAvailable: boolean | null }) => (
  <span className={styles.addressSuffix}>
    {MAIN_SITE_URL && <span className={styles.domainTail}>.{MAIN_SITE_URL}</span>}
    <StatusIcon isChecking={isChecking} isAvailable={isAvailable} />
  </span>
);

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

  // Submit State
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // The availability probe itself, kept separate from the debounced wrapper so
  // it can also be called directly on mount. It only touches state setters,
  // which are stable, so holding it in a ref is safe.
  const checkAvailability = useRef(async (val: string) => {
    if (!val || val.length < 3) {
      setIsChecking(false);
      setIsAvailable(null);
      return;
    }

    try {
      const res = await fetch(`${URL.CHECK_SUBDOMAIN}?subdomain=${encodeURIComponent(val)}`);
      const body = await res.json();
      setIsChecking(false);

      // Laravel's error envelope is { status, message, errors } with no `data`
      // key at all, so reading `body.data.error` threw a TypeError and the
      // catch below reported every rejection as "Network error". Read the
      // status off the envelope instead and surface the real message.
      if (body?.status === "error" || !body?.data) {
        setIsAvailable(false);
        setErrorMsg(body?.message || "Couldn't check that address");
        return;
      }

      setIsAvailable(body.data.available);
      setErrorMsg(body.data.available ? "" : "Already taken");
    } catch {
      setIsChecking(false);
      setIsAvailable(false);
      setErrorMsg("Network error");
    }
  }).current;

  // Debounced Validation Function
  // We use useCallback so the debounce function doesn't get recreated on every render
  const debouncedCheckAvailability = useRef(debounce((val: string) => checkAvailability(val), 500)).current;

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
    if (!subdomain || !isAvailable || !businessName || isSaving) return;

    // 1. Save Lead Data to Redux
    dispatch(updateFormData({ siteName: subdomain, businessName: businessName, siteType: type }));

    // 2. Trigger Save for API
    //
    // The await matters: without it the try/catch could never fire (a failed
    // save became a silent unhandled rejection) and step 1 was reached before
    // lead_id existed, so /onboard/register could be called with lead_id: null.
    setIsSaving(true);
    setSaveError("");
    try {
      await dispatch(saveProgress()).unwrap();
      dispatch(setStep(1));
    } catch (error: any) {
      setSaveError(typeof error === "string" ? error : error?.message || "Couldn't save your details. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Step 0 is unmounted whenever the funnel advances (page.tsx renders it behind
  // `currentStep === 0`), so pressing Back remounts it with subdomain restored
  // from persisted Redux but isAvailable reset to null — which left "Start
  // Building" disabled until the user retyped the address. Re-probe once on
  // mount so a returning user finds the form exactly as they left it. This also
  // re-confirms the name is still free, since nothing reserves it until
  // /onboard/register runs.
  useEffect(() => {
    const saved = savedData.siteName;

    if (saved && saved.length >= 3) {
      setIsChecking(true);
      checkAvailability(saved);
    }
    // Mount only: this seeds state that the user's own typing then owns.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      debouncedCheckAvailability.cancel();
    };
  }, [debouncedCheckAvailability]);

  const canSubmit = Boolean(subdomain) && Boolean(businessName) && isAvailable === true && !isSaving;

  return (
    <div>
      <div className={styles.stepHead}>
        <span className={styles.stepEyebrow}>
          <SparkIcon />
          Takes about 2 minutes
        </span>
        <h2 className={styles.stepTitle}>Let&apos;s name your store.</h2>
        <p className={styles.stepSubtitle}>
          Your brand name is what customers see. The address is where they find you — you can point
          a custom domain at it later.
        </p>
      </div>

      <div className={styles.fields}>
        {/* 1. Business Name (Simple) */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="brand-name">
            Brand name
          </label>
          <Input
            id="brand-name"
            size="large"
            placeholder="e.g. Kicks On Fire"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
        </div>

        {/* 2. Subdomain (Complex Validation) */}
        <div className={styles.field}>
          <div className={styles.fieldRow}>
            <label className={styles.label} htmlFor="store-address">
              Store address
            </label>
            {errorMsg && <span className={styles.error}>{errorMsg}</span>}
            {!errorMsg && isAvailable === true && <span className={styles.ok}>Available</span>}
          </div>

          <Input
            id="store-address"
            size="large"
            placeholder="toyscity"
            value={subdomain}
            onChange={handleSubdomainChange}
            suffix={<AddressSuffix isChecking={isChecking} isAvailable={isAvailable} />}
            status={isAvailable === false ? "error" : ""}
            autoComplete="off"
            spellCheck={false}
          />

          <span className={styles.hint}>Lowercase letters, numbers and hyphens. At least 3 characters.</span>
        </div>

        {/* 3. Type Selection */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="business-type">
            What are you building?
          </label>
          <Select id="business-type" size="large" value={type} onChange={setType} options={options} style={{ width: "100%" }} />
        </div>

        {saveError && <Alert type="error" showIcon message={saveError} closable onClose={() => setSaveError("")} />}

        <Button
          type="primary"
          size="large"
          block
          className={styles.submit}
          onClick={handleNext}
          loading={isChecking || isSaving}
          disabled={!canSubmit}
          icon={<ArrowRightOutlined />}
          iconPlacement="end"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

function SparkIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0.8 9.5 5.4 14 7 9.5 8.6 8 13.2 6.5 8.6 2 7 6.5 5.4Z" />
    </svg>
  );
}
