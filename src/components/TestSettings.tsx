'use client';

import { FC } from 'react';

const TIME_OPTIONS = [15, 30, 60];

interface TestSettingsProps {
  selectedTime: number;
  onTimeChange: (time: number) => void;
  includeNumbers: boolean;
  setIncludeNumbers: (val: boolean) => void;
  includePunctuation: boolean;
  setIncludePunctuation: (val: boolean) => void;
}

const TestSettings: FC<TestSettingsProps> = ({
  selectedTime,
  onTimeChange,
  includeNumbers,
  setIncludeNumbers,
  includePunctuation,
  setIncludePunctuation,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 mb-6 w-full">
        {TIME_OPTIONS.map((time) => (
          <button
            key={time}
            onClick={() => onTimeChange(time)}
            className={`w-full sm:w-auto px-6 py-3 sm:py-4 rounded text-base sm:text-lg font-semibold transition-colors duration-150 ${
              selectedTime === time
                ? 'bg-blue-600'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {time}s
          </button>
        ))}
        <div className="hidden sm:block w-0.5 h-12 bg-gray-600 rounded mx-2" />
        <div className="block sm:hidden h-0.5 w-full bg-gray-600 rounded my-2" />
        <button
          onClick={() => setIncludeNumbers(!includeNumbers)}
          className={`w-full sm:w-auto px-6 py-3 sm:py-4 rounded text-base sm:text-lg font-semibold transition-colors duration-150 ${
            includeNumbers ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          Numbers
        </button>
        <button
          onClick={() => setIncludePunctuation(!includePunctuation)}
          className={`w-full sm:w-auto px-6 py-3 sm:py-4 rounded text-base sm:text-lg font-semibold transition-colors duration-150 ${
            includePunctuation ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          Punctuation
        </button>
      </div>
    </div>
  );
};

export default TestSettings; 