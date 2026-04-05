import { useState } from 'react';
import { Layout } from '../Layout';
import { Stepper } from '../components/Stepper';
import { PersonalDetailsForm } from '../components/forms/PersonalDetailsForm';
import { AcademicInfoForm } from '../components/forms/AcademicInfoForm';
import { ParentDetailsForm } from '../components/forms/ParentDetailsForm';
// import { Stepper } from './components/Stepper';
// import { PersonalDetailsForm } from './components/forms/PersonalDetailsForm';
// import { AcademicInfoForm } from './components/forms/AcademicInfoForm';
// import { ParentDetailsForm } from './components/forms/ParentDetailsForm';

export function AddStudentPage() {
  // Manage which step the user is currently viewing
  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  return (
    <Layout title="Registration">
      {/* We use Flex Column Gap here so Electron spaces everything perfectly */}
      <div className="p-8 max-w-[960px] w-full mx-auto flex flex-col gap-8">
        
        {/* Header Section */}
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Add New Student</h2>
          <p className="text-slate-600 dark:text-slate-400">Follow the steps to register a new student in the system.</p>
        </div>

        {/* Dynamic Stepper Component */}
        <Stepper currentStep={currentStep} />

        {/* Render the correct form based on state */}
        <div className="w-full">
          {currentStep === 1 && <PersonalDetailsForm onNext={nextStep} />}
          {currentStep === 2 && <AcademicInfoForm onNext={nextStep} onPrev={prevStep} />}
          {currentStep === 3 && <ParentDetailsForm onPrev={prevStep} />}
        </div>
        
      </div>
    </Layout>
  );
}