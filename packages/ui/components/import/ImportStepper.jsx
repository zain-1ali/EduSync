export function ImportStepper({ currentStep }) {
  const steps = [
    { num: 1, label: "Upload File" },
    { num: 2, label: "Map Columns" },
    { num: 3, label: "Review & Import" }
  ];

  const progressPercentage = ((currentStep) / 3) * 100;

  return (
    <div className="w-full flex flex-col gap-3 mb-8">
      <div className="flex gap-6 justify-between items-center">
        <p className="text-slate-900 dark:text-white text-base font-semibold">
          Import Progress: Step {currentStep} of 3
        </p>
        <p className="text-primary text-sm font-bold uppercase tracking-wider">
          Active: {steps[currentStep - 1].label}
        </p>
      </div>
      <div className="rounded-full bg-slate-200 dark:bg-slate-700 h-2 overflow-hidden">
        <div 
          className="h-full rounded-full bg-primary transition-all duration-500" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-xs font-medium text-slate-500 mt-1 px-1">
        {steps.map((step) => (
          <span 
            key={step.num} 
            className={currentStep >= step.num ? "text-primary font-bold" : ""}
          >
            {step.num}. {step.label}
          </span>
        ))}
      </div>
    </div>
  );
}