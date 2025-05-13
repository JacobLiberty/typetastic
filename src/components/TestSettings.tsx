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
      <div className="flex justify-center items-center space-x-8 mb-6">
        {TIME_OPTIONS.map((time, idx) => (
          <button
            key={time}
            onClick={() => onTimeChange(time)}
            className={`px-6 py-4 rounded text-lg font-semibold transition-colors duration-150 ${
              selectedTime === time
                ? 'bg-blue-600'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {time}s
          </button>
        ))}
        <span className="text-gray-500 text-2xl font-mono font-bold">|</span>
        <button
          onClick={() => setIncludeNumbers(!includeNumbers)}
          className={`px-6 py-4 rounded text-lg font-semibold transition-colors duration-150 ${
            includeNumbers ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          Numbers
        </button>
        <button
          onClick={() => setIncludePunctuation(!includePunctuation)}
          className={`px-6 py-4 rounded text-lg font-semibold transition-colors duration-150 ${
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