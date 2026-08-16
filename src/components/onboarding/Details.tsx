"use client";

import { useState, useEffect, useRef } from "react";
import { Button, Input, Checkbox, Form, Alert } from "antd";
import { ArrowLeftOutlined, RocketFilled, CheckCircleFilled, CloseCircleFilled, LoadingOutlined } from "@ant-design/icons";
import styles from "./onboard.module.css";
// import PhoneInput from "react-phone-number-input";
// import "react-phone-number-input/style.css"; // Import default styles
import { useAppDispatch, useAppSelector } from "@/src/lib/hooks";
import { updateFormData, setStep, saveProgress, setBoardState, setBoardMerge } from "@/src/store/onboardingSlice";
import { URL } from "@/src/assets/url";
import debounce from "lodash/debounce";


const { TextArea } = Input;

// AI Logic: Smart features based on Store Type
const FEATURE_SUGGESTIONS: Record<string, { label: string, value: string }[]> = {
  fashion: [
    { label: "Size Guide", value: "site_guide" },
    { label: "Instagram Feed", value: "instagram_feed" },
    { label: "Lookbook Gallery", value: "lookbook_gallery" },
    { label: "Newsletter Popup", value: "newsletter_popup" }
  ],
  restaurant: [
    { label: "Menu Display", value: "menu_display" },
    { label: "Table Reservation", value: "table_reservation" },
    { label: "Location Map", value: "location_map" },
    { label: "UberEats Link", value: "ubereats_link" }
  ],
  beauty: [
    { label: "Booking System", value: "booking_system" },
    { label: "Before/After Slider", value: "before_after_slider" },
    { label: "Service Menu", value: "service_menu" },
    { label: "Testimonials", value: "testimonials" }
  ],
  electronics: [
    { label: "Tech Specs Table", value: "tech_specs_table" },
    { label: "Compare Products", value: "compare_products" },
    { label: "Support Chat", value: "support_chat" },
    { label: "Warranty Info", value: "warranty_info" }
  ],
  default: [
    { label: "Contact Form", value: "contact_form" },
    { label: "About Us Section", value: "about_us_section" },
    { label: "FAQ Section", value: "faq_section" },
    { label: "Blog", value: "blog" }
  ],
};

// Module scope, same reasoning as Step1_Prompt's StatusIcon: a component
// declared inside the render body is a new type every render, which remounts
// the suffix node on each keystroke rather than re-rendering it.
const EmailStatusSuffix = ({ isChecking, isAvailable }: { isChecking: boolean; isAvailable: boolean | null }) => {
  if (isChecking) return <LoadingOutlined />;
  if (isAvailable === true) return <CheckCircleFilled className="text-green-500" />;
  if (isAvailable === false) return <CloseCircleFilled className="text-red-500" />;
  return null;
};

export default function Details() {
  const dispatch = useAppDispatch();
  const onBoard = useAppSelector((state) => state.onboarding);
  const stepData = onBoard.stepData;
  const [form] = Form.useForm();

  // Load correct suggestions based on Step 1 selection
  const activeSuggestions = FEATURE_SUGGESTIONS[stepData.siteType || "default"] || FEATURE_SUGGESTIONS["default"];

  // Email validation state
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null);
  const [emailError, setEmailError] = useState("");

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const debouncedCheckEmail = useRef(
    debounce(async (email: string) => {
      if (!email) {
        setIsCheckingEmail(false);
        setIsEmailAvailable(null);
        return;
      }

      try {
        // encodeURIComponent matters here: an unencoded "+" in a plus-addressed
        // email (user+tag@x.com) decodes server-side as a space, so the
        // availability check would run against the wrong address.
        const res = await fetch(`${URL.CHECK_EMAIL}?email=${encodeURIComponent(email)}`);
        const result = await res.json();

        setIsCheckingEmail(false);

        // ✅ IMPORTANT: use result.data.available
        const available = result?.data?.available;

        if (available === false) {
          setIsEmailAvailable(false);
          setEmailError("Email already registered");
        } else if (available === true) {
          setIsEmailAvailable(true);
          setEmailError("");
        } else {
          setIsEmailAvailable(null);
          setEmailError("Invalid response");
        }
      } catch {
        setIsCheckingEmail(false);
        setIsEmailAvailable(false);
        setEmailError("Network error");
      }
    }, 500)
  ).current;

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    form.setFieldsValue({ email: val });
    setIsEmailAvailable(null);
    setEmailError("");

    if (val && /\S+@\S+\.\S+/.test(val)) {
      setIsCheckingEmail(true);
      debouncedCheckEmail(val);
    } else {
      setIsCheckingEmail(false);
    }
  };

  // Pre-fill form on mount
  useEffect(() => {
    form.setFieldsValue({
      description: stepData.description,
      // `.value`, not the whole object: Checkbox.Group matches against the
      // string values, so seeding it with {label,value} left nothing visibly
      // checked AND posted an array of objects to /onboard/lead.
      features: stepData.features?.length ? stepData.features : [activeSuggestions[0].value], // Pre-select first one
      email: stepData.email,
      phone: stepData.phone,
    });
  }, [form, stepData, activeSuggestions]);

  // Every await below used to be unguarded: a non-2xx from /onboard/register
  // threw inside `data.data.site`, the form sat there, and the user saw nothing.
  // A CREATE_STORE response that wasn't "success" dead-ended just as silently.
  const onFinish = async (values: any) => {
    setSubmitError("");
    setIsSubmitting(true);

    try {
      // STEP 1 : Save LEAD to Redux and DB
      dispatch(updateFormData({ description: values.description, features: values.features, email: values.email, phone: values.phone, }));
      await dispatch(saveProgress()).unwrap();

      // STEP 2 : Register lead as Customer : Returns Customer and Site data
      const response = await fetch(URL.REGISTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: onBoard.lead_id, password: values.password }),
      });

      const data = await response.json();

      if (!response.ok || data?.status === "error") {
        throw new Error(data?.message || "We couldn't create your account. Please try again.");
      }

      const siteData      = data?.data?.site;
      const customerData  = data?.data?.customer;
      const customer_id   = customerData?.id;

      // Previously `customerData.id || null`, which wrote the payload to
      // users.null and carried a null customer_id into the next step.
      if (!customer_id || !siteData?.id) {
        throw new Error(data?.message || "Registration didn't return your store details. Please try again.");
      }

      dispatch(setBoardMerge({ name: `users.${customer_id}`, data: { ...data.data } }));
      dispatch(setBoardState({ name: `customer_id`, data: customer_id }));

      // STEP 3 : Trigger Site Creation
      const siteResponse = await fetch(URL.CREATE_STORE, {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({ site_id: siteData.id, }),
      });
      const siteResponseData = await siteResponse.json();

      dispatch(setBoardMerge({ name: `users.${customer_id}.message`, data: siteResponseData.message }));

      if (siteResponseData.status === "success") {
        dispatch(setStep(2));
      } else {
        throw new Error(siteResponseData.message || "We couldn't start building your store. Please try again.");
      }
    } catch (err: any) {
      // saveProgress rejects with rejectWithValue(error.message), i.e. a string.
      setSubmitError(typeof err === "string" ? err : err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      debouncedCheckEmail.cancel();
    };
  }, [debouncedCheckEmail]);

  return (
    <div>
      <div className={styles.stepHead}>
        <button type="button" className={styles.backLink} onClick={() => dispatch(setStep(0))} disabled={isSubmitting}>
          <ArrowLeftOutlined style={{ fontSize: 11, marginRight: 6 }} />
          Back
        </button>
        <h2 className={styles.stepTitle} style={{ marginTop: 14 }}>
          Almost there.
        </h2>
        <p className={styles.stepSubtitle}>
          {/* businessName is the brand the customer typed; siteName is the
              subdomain. Greeting someone with their subdomain reads like a bug. */}
          A few details about <strong>{stepData.businessName || stepData.siteName || "your store"}</strong> so
          we can set it up with the right pages and content.
        </p>
      </div>

      {/* Single column: the form lives in the 40% rail, so a two-up grid would
          crush every control. `size="large"` matches step 1's controls. */}
      <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false} size="large">
        {/* 1. Business Description */}
        <Form.Item label="What do you sell?" name="description" rules={[{ required: true, message: "Please write a short description." }]}>
          <TextArea rows={3} placeholder="e.g. Premium leather sneakers for urban hikers, based in NYC." />
        </Form.Item>

        {/* 2. Smart Features (Checkboxes) */}
        <Form.Item label="Features you want" name="features">
          {/* Tiles are divs, not labels: antd's Checkbox already renders its own
              <label>, and nesting labels is invalid HTML. */}
          <Checkbox.Group className={styles.featureGrid}>
            {activeSuggestions.map((feature) => (
              <div key={feature.value} className={styles.featureTile}>
                <Checkbox value={feature.value}>{feature.label}</Checkbox>
              </div>
            ))}
          </Checkbox.Group>
        </Form.Item>

        {/* 3. Email */}
        <Form.Item
          label={
            <span className={styles.fieldRow} style={{ width: "100%" }}>
              <span>Your email</span>
              {emailError && <span className={styles.error}>{emailError}</span>}
            </span>
          }
          name="email"
          validateStatus={isEmailAvailable === false ? "error" : ""}
          rules={[
            { required: true, message: "Email is required" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input
            placeholder="john@example.com"
            onChange={handleEmailChange}
            autoComplete="email"
            suffix={<EmailStatusSuffix isChecking={isCheckingEmail} isAvailable={isEmailAvailable} />}
          />
        </Form.Item>

        {/* 4. Phone (Custom Lib) */}
        {/* <PhoneInput defaultCountry="US" placeholder="Enter phone number" value={phoneValue} onChange={(val) => setPhoneValue(val as string)} /> */}
        <Form.Item label="Phone" name="phone" rules={[{ required: true, message: "Phone number is required" }]}>
          <Input autoComplete="tel" placeholder="+1 555 000 1234" />
        </Form.Item>

        <Form.Item
          label="Choose a password"
          name="password"
          rules={[{ required: true, message: "Password is required" }]}
          extra={<span className={styles.hint}>You&apos;ll use this to sign in to your store admin.</span>}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>

        {submitError && (
          <Alert
            type="error"
            showIcon
            message={submitError}
            style={{ marginBottom: 16 }}
            closable
            onClose={() => setSubmitError("")}
          />
        )}

        <Button
          type="primary"
          htmlType="submit"
          size="large"
          block
          className={styles.submit}
          loading={isSubmitting}
          disabled={isEmailAvailable === false || isCheckingEmail || isSubmitting}
          icon={<RocketFilled />}
          iconPlacement="end"
        >
          Build my store
        </Button>
      </Form>
    </div>
  );
}
