"use client";

import { Button, Typography, Tag, Modal, Input } from "antd";
import { EyeOutlined, EditOutlined, CrownFilled } from "@ant-design/icons";
import { useAppSelector } from "@/src/lib/hooks";
import { useState } from "react";

const { Title, Text } = Typography;

export default function Step5_Reveal() {
  const stepData = useAppSelector((state) => state.onboarding.stepData);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Determine styles based on Vibe
  const isDark = stepData.siteVibe === "bold";
  const bgColor = isDark ? "bg-black text-white" : "bg-white text-gray-900";
  const accentColor = isDark ? "text-yellow-400" : "text-blue-600";

  return (
    <div className="w-full max-w-6xl mx-auto px-4 animate-fadeIn pb-20">
      {/* 1. The Success Header */}
      <div className="text-center mb-8">
        <Tag color="green" className="px-3 py-1 text-sm rounded-full mb-4 border-0 bg-green-100 text-green-700 font-bold">
          ✨ GENERATION COMPLETE
        </Tag>
        <Title level={2}>Your store is ready.</Title>
        <Text type="secondary" className="text-lg">
          We've built a <strong>{stepData.siteVibe}</strong> layout for <strong>{stepData.siteName}</strong>.
        </Text>
      </div>

      {/* 2. The Browser Window Preview (The "Hook") */}
      <div className="border-4 border-gray-900 rounded-t-2xl shadow-2xl overflow-hidden max-w-4xl mx-auto transform transition hover:scale-[1.01] duration-500">
        {/* Fake Browser Toolbar */}
        <div className="bg-gray-900 h-10 flex items-center px-4 gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="bg-gray-800 text-gray-400 text-xs px-3 py-1 rounded flex-grow text-center mx-4 font-mono">{stepData.siteName?.toLowerCase().replace(/\s/g, "")}.com</div>
        </div>

        {/* The Website Preview Content */}
        <div className={`min-h-[500px] flex flex-col ${bgColor} relative`}>
          {/* The "Edit" Overlay - Encourages Action */}
          <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors group cursor-pointer flex items-center justify-center z-10" onClick={() => setIsRegisterModalOpen(true)}>
            <Button type="primary" size="large" icon={<EditOutlined />} className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all shadow-xl">
              Customize Design
            </Button>
          </div>

          {/* Mock Header */}
          <header className="p-6 flex justify-between items-center border-b border-gray-100/10">
            <div className="font-bold text-2xl tracking-tighter">{stepData.siteName}</div>
            <nav className="hidden md:flex gap-6 text-sm font-medium opacity-70">
              <span>Shop</span>
              <span>Collections</span>
              <span>About</span>
              <span>Contact</span>
            </nav>
          </header>

          {/* Mock Hero Section */}
          <div className="flex-grow flex flex-col items-center justify-center text-center p-12">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">{stepData.siteType === "fashion" ? "WEAR THE MOMENT." : "EXPERIENCE QUALITY."}</h1>
            <p className="max-w-md mx-auto text-lg opacity-80 mb-8">{stepData.description || "Premium products curated just for you. Discover our latest collection today."}</p>
            <div className={`px-8 py-4 rounded-full font-bold text-lg ${isDark ? "bg-white text-black" : "bg-black text-white"}`}>Shop Now</div>
          </div>

          {/* Mock Features Grid */}
          <div className="grid grid-cols-3 gap-4 p-8 border-t border-gray-100/10 opacity-60">
            {stepData.features?.slice(0, 3).map((feat, i) => (
              <div key={i} className="text-center text-xs font-bold uppercase tracking-widest">
                • {feat}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. The Bottom CTA Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <div className="font-bold text-gray-900">14-Day Free Trial</div>
            <div className="text-xs text-gray-500">No credit card required.</div>
          </div>
          <Button type="primary" size="large" icon={<CrownFilled />} className="h-12 px-8 bg-black hover:bg-gray-800" onClick={() => setIsRegisterModalOpen(true)}>
            Claim This Site
          </Button>
        </div>
      </div>

      {/* 4. Registration Modal (Soft Gate) */}
      <Modal title="Save your progress" open={isRegisterModalOpen} onCancel={() => setIsRegisterModalOpen(false)} footer={null} centered>
        <div className="flex flex-col gap-4 py-4">
          <p className="text-gray-500 mb-2">
            Create an account to save <strong>{stepData.siteName}</strong> and start editing.
          </p>
          <Input size="large" placeholder="Enter your email" value={stepData.email} disabled className="bg-gray-50" />
          <Input.Password size="large" placeholder="Create a password" />
          <Button type="primary" size="large" className="w-full h-12 bg-blue-600 mt-2">
            Create Account
          </Button>
        </div>
      </Modal>
    </div>
  );
}
