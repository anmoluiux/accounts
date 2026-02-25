"use client";

import { useState, useEffect } from "react";
import { Button, Input, Checkbox, Typography, Form, Card } from "antd";
import { ArrowLeftOutlined, RocketFilled } from "@ant-design/icons";
// import PhoneInput from "react-phone-number-input";
// import "react-phone-number-input/style.css"; // Import default styles
import { useAppDispatch, useAppSelector } from "@/src/lib/hooks";
import { updateFormData, setStep, saveProgress, setBoardState } from "@/src/store/onboardingSlice";
import { InputNumber } from "antd";
import { setBoardMerge } from "@/src/store/onboardingSlice";
import { URL } from "@/src/assets/url";

const { Title, Text } = Typography;
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

export default function Details() {
  const dispatch = useAppDispatch();
  const onBoard = useAppSelector((state) => state.onboarding);
  const stepData = onBoard.stepData;
  const [form] = Form.useForm();

  // Load correct suggestions based on Step 1 selection
  const activeSuggestions = FEATURE_SUGGESTIONS[stepData.siteType || "default"] || FEATURE_SUGGESTIONS["default"];

  // Local state for Phone (React-phone-number-input uses its own state)
  const [phoneValue, setPhoneValue] = useState(stepData.phone || "");

  // Pre-fill form on mount
  useEffect(() => {
    form.setFieldsValue({
      description: stepData.description,
      features: stepData.features?.length ? stepData.features : [activeSuggestions[0]], // Pre-select first one
      email: stepData.email,
      phone: stepData.phone,
    });
  }, [form, stepData, activeSuggestions]);

  const onFinish = async (values: any) => {

    // STEP 1 : Save to Redux and DB
    dispatch(updateFormData({ description: values.description, features: values.features, email: values.email, phone: values.phone, }));
    await dispatch(saveProgress()).unwrap();



    // STEP 2 : Next Register lead as Customer : Returns Customer and Site data
    const response = await fetch(URL.REGISTER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead_id: onBoard.lead_id, password: values.password }),
    });

    const data = await response.json();
    const siteData = data.data.site;
    const customerData = data.data.customer;
    const customer_id = customerData.id || '1';

    console.log("Customer Data", data.data, siteData, customerData);
    dispatch(setBoardMerge({ name: `users.${customer_id}`, data: { ...data.data } }));
    dispatch(setBoardState({ name: `customer_id`, data: customer_id }));



    // STEP 3 : Trigger Site Creation
    const siteResponse = await fetch(URL.CREATE_STORE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ site_id: siteData.id, }),
    });

    const siteResponseData = await siteResponse.json();
    console.log("Site Data", siteResponseData);
    dispatch(setBoardMerge({ name: `userData.${onBoard.lead_id}`, data: siteResponseData }));
    dispatch(setStep(2));
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 animate-fadeIn pb-10">
      <div className="text-center mb-8">
        <Title level={2} style={{ margin: 0 }}>
          Almost there.
        </Title>
        <Text type="secondary" className="text-lg">
          Tell us a bit about <strong>{stepData.siteName}</strong> so we can write the content.
        </Text>
      </div>

      <Card className="shadow-lg border-0 rounded-2xl p-2">
        <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false} size="large">
          {/* 1. Business Description */}
          <Form.Item label={<span className="font-semibold text-gray-700">What is your business goal?</span>} name="description" rules={[{ required: true, message: "Please write a short description." }]}>
            <TextArea rows={3} placeholder={`e.g. We sell premium leather sneakers for urban hikers. based in NYC.`} className="rounded-lg" />
          </Form.Item>

          {/* 2. Smart Features (Checkboxes) */}
          <Form.Item label={<span className="font-semibold text-gray-700">Key Features Needed</span>} name="features">
            <Checkbox.Group className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
              {activeSuggestions.map((feature) => (
                <div key={feature.value} className="bg-gray-50 p-3 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
                  <Checkbox value={feature.value}>{feature.label}</Checkbox>
                </div>
              ))}
            </Checkbox.Group>
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* 3. Email */}
            <Form.Item
              label={<span className="font-semibold text-gray-700">Your Email</span>}
              name="email"
              rules={[
                { required: true, message: "Email is required" },
                { type: "email", message: "Please enter a valid email" },
              ]}>
              <Input placeholder="john@example.com" />
            </Form.Item>

            {/* 4. Phone (Custom Lib) */}
            <div className="ant-form-item">
              {/* <label className="font-semibold text-gray-700 block mb-2">Phone Number</label> */}
              {/* <PhoneInput defaultCountry="US" placeholder="Enter phone number" value={phoneValue} onChange={(val) => setPhoneValue(val as string)} className="ant-input rounded-lg h-10 px-3 flex items-center" /> */}
              <Form.Item label={<span className="font-semibold text-gray-700">Phone</span>} name="phone" rules={[{ required: true, message: "Phone number is required" }]}>
                <Input />
              </Form.Item>
            </div>
          </div>

          <Form.Item label={<span className="font-semibold text-gray-700">Password</span>} name="password" rules={[{ required: true, message: "Password is required" }]}>
            <Input.Password value={'121212'} />
          </Form.Item>
          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
            <Button type="text" size="large" icon={<ArrowLeftOutlined />} onClick={() => dispatch(setStep(0))}>Back</Button>

            <Button type="primary" htmlType="submit" size="large" className="h-12 px-8 text-lg font-semibold bg-blue-600 hover:bg-blue-500 shadow-blue-200 shadow-lg" icon={<RocketFilled />} iconPlacement="end">
              Generate Site
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
