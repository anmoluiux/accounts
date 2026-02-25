"use client";

import { Card, Typography, Button } from "antd";
import { ArrowLeftOutlined, CheckCircleFilled } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@/src/lib/hooks"; // We will create this hook next
import { updateFormData, setStep, saveProgress } from "@/src/store/onboardingSlice";

const { Title, Text } = Typography;

// Define our "Vibes" with visual cues
const VIBES = [
  {
    id: "minimal",
    title: "Minimalist",
    description: "Clean lines, lots of whitespace, modern sans-serif fonts.",
    color: "bg-gray-50",
    borderColor: "border-gray-200",
  },
  {
    id: "bold",
    title: "Bold & Loud",
    description: "High contrast, large typography, vibrant accent colors.",
    color: "bg-black text-white",
    borderColor: "border-black",
  },
  {
    id: "luxury",
    title: "Luxury",
    description: "Elegant serifs, gold/cream palette, sophisticated feel.",
    color: "bg-stone-100",
    borderColor: "border-stone-300",
  },
  {
    id: "playful",
    title: "Playful",
    description: "Rounded corners, soft pastels, friendly geometry.",
    color: "bg-blue-50",
    borderColor: "border-blue-200",
  },
];

export default function Step2_Vibe() {
  const dispatch = useAppDispatch();
  const currentVibe = useAppSelector((state) => state.onboarding.stepData.siteVibe);

  const handleSelect = (vibeId: string) => {
    dispatch(updateFormData({ siteVibe: vibeId }));
    // Optional: Auto-advance after selection, or wait for button click
    // Let's wait for button click to let them "feel" the choice
  };

  const handleNext = async () => {
    if (currentVibe) {
      try {
        await dispatch(saveProgress()).unwrap();
        dispatch(setStep(2));
      } catch (error) {
        console.error("Failed to save:", error);
      }

      // dispatch(setStep(2)); // Go to Details
    }
  };

  const handleBack = () => {
    dispatch(setStep(0));
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 animate-fadeIn">
      <div className="text-center mb-10">
        <Title level={2} style={{ margin: 0 }}>
          Choose your style.
        </Title>
        <Text type="secondary" className="text-lg mt-2">
          We will generate a unique design based on this vibe.
        </Text>
      </div>

      {/* The Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {VIBES.map((vibe) => {
          const isSelected = currentVibe === vibe.id;

          return (
            <div
              key={vibe.id}
              onClick={() => handleSelect(vibe.id)}
              className={`
                relative cursor-pointer group transition-all duration-300
                border-2 rounded-2xl p-6 h-40 flex flex-col justify-center
                ${isSelected ? "border-blue-600 shadow-xl scale-[1.02]" : "border-gray-100 hover:border-blue-300 hover:shadow-md"}
                ${vibe.id === "bold" ? "bg-black text-white" : "bg-white"}
              `}>
              {/* Selection Checkmark */}
              {isSelected && (
                <div className="absolute top-4 right-4 text-blue-600 bg-white rounded-full">
                  <CheckCircleFilled style={{ fontSize: "24px" }} />
                </div>
              )}

              <h3 className={`text-2xl font-bold mb-2 ${vibe.id === "bold" ? "text-white" : "text-gray-900"}`}>{vibe.title}</h3>
              <p className={`text-sm ${vibe.id === "bold" ? "text-gray-400" : "text-gray-500"}`}>{vibe.description}</p>
            </div>
          );
        })}
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center mt-8 border-t pt-6">
        <Button type="text" size="large" icon={<ArrowLeftOutlined />} onClick={handleBack}>
          Back
        </Button>

        <Button type="primary" size="large" onClick={handleNext} disabled={!currentVibe} className="h-12 px-8 text-lg font-semibold bg-black hover:bg-gray-800">
          Continue
        </Button>
      </div>
    </div>
  );
}
