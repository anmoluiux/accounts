"use client";
import { useAppSelector } from "@/src/lib/hooks";
import Step1_Prompt from "@/src/components/onboarding/Step1_Prompt";
import Details from "@/src/components/onboarding/Details";
import UserCredentials from "@/src/components/onboarding/userCredentials";
import PersistBoundary from "@/src/store/PersistBoundary";

// Step2_Vibe / Building / Step5_Reveal still exist on disk but are not rendered.
// They were imported here, which kept all three (plus Building's hardcoded
// localhost API URL) in the shipped bundle. Re-add the import to re-enable one.

import { Steps } from "antd";

function OnboardingFunnel() {
  const currentStep = useAppSelector((state) => state.onboarding.currentStep);

  // Hide the progress stepper on the final Reveal step for immersion
  // const showStepper = currentStep < 4;
  const showStepper = false;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <header className="px-8 py-6 flex justify-between items-center">
        <div className="font-bold text-xl tracking-tight">logo.</div>

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

// The funnel reads persisted state to decide which step to show, so it stays
// behind the rehydration gate. Keeping the gate here rather than in the root
// layout is what lets the marketing page prerender.
export default function OnboardingPage() {
  return (
    <PersistBoundary>
      <OnboardingFunnel />
    </PersistBoundary>
  );
}
