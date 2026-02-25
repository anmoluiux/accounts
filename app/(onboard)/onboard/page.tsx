"use client";
import { useAppDispatch, useAppSelector } from "@/src/lib/hooks";
import Step1_Prompt from "@/src/components/onboarding/Step1_Prompt";
import Step2_Vibe from "@/src/components/onboarding/Step2_Vibe";
import Details from "@/src/components/onboarding/Details";
import Building from "@/src/components/onboarding/Building"; // Import
import Step5_Reveal from "@/src/components/onboarding/Step5_Reveal"; // Import
import UserCredentials from "@/src/components/onboarding/userCredentials"; // Import

import { Steps } from "antd";
import { updateFormData, setStep, saveProgress } from "@/src/store/onboardingSlice";

export default function OnboardingPage() {
  const currentStep = useAppSelector((state) => state.onboarding.currentStep);

  // Hide the progress stepper on the final Reveal step for immersion
  // const showStepper = currentStep < 4;
  const showStepper = false;

  const dispatch = useAppDispatch();
  const SetStepCustom = (step: number) => () => {
    dispatch(setStep(step));
  };

  console.log(currentStep);

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <header className="px-8 py-6 flex justify-between items-center">
        <div className="font-bold text-xl tracking-tight">logo.</div>
        <button onClick={SetStepCustom(0)}>SetStep</button>

        {showStepper && (
          <div className="w-1/3 hidden md:block">
            <Steps
              current={currentStep}
              size="small"
              items={[
                { title: "Concept" },
                { title: "Vibe" },
                { title: "Details" },
                { title: "Building" }, // Updated label
              ]}
            />
          </div>
        )}

        <div className="text-sm text-gray-500">Need help?</div>
      </header>

      <div className={`flex-grow flex items-center justify-center ${currentStep === 4 ? "items-start pt-10" : ""}`}>
        {currentStep === 0 && <Step1_Prompt />}
        {currentStep === 1 && <Details />}
        {currentStep === 2 && <UserCredentials />}
        {/* {currentStep === 3 && <Building />}
        {currentStep === 2 && <Step3_Details />}
        {currentStep === 4 && <Step5_Reveal />} */}
      </div>
    </main>
  );
}
