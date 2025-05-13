'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import TestSettings from '@/components/TestSettings';
import TypingArea from '@/components/TypingArea';
import { generateText } from '@/utils/textGenerator';

export default function Home() {
  const [text, setText] = useState(generateText(250));
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [isActive, setIsActive] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [selectedTime, setSelectedTime] = useState(30);
  const [elapsed, setElapsed] = useState(0); // seconds since first char
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [includeNumbers, setIncludeNumbers] = useState(false);
  const [includePunctuation, setIncludePunctuation] = useState(false);

  // Helper: generate text with current options
  const getText = () => generateText(250, { includeNumbers, includePunctuation });

  // Helper: count completed words
  const getCompletedWordsCount = useCallback(() => {
    const inputWords = userInput.trim().split(/\s+/);
    const textWords = text.split(/\s+/);
    let completed = 0;
    for (let i = 0; i < inputWords.length; i++) {
      if (inputWords[i] === textWords[i]) {
        completed++;
      } else {
        break;
      }
    }
    return completed;
  }, [userInput, text]);

  // Start timer on first character
  useEffect(() => {
    if (!isActive && userInput.length === 1) {
      setIsActive(true);
      setElapsed(0);
      setTimeLeft(selectedTime);
    }
  }, [userInput, isActive, selectedTime]);

  // Timer effect
  useEffect(() => {
    if (!isActive) return;
    if (timeLeft <= 0) {
      setIsActive(false);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [isActive, timeLeft]);

  // WPM calculation
  useEffect(() => {
    if (!isActive && elapsed === 0) {
      setWpm(0);
      return;
    }
    if (elapsed > 0) {
      const completedWords = getCompletedWordsCount();
      setWpm(Math.floor((completedWords / elapsed) * 60));
    }
  }, [elapsed, userInput, isActive, getCompletedWordsCount]);

  const handleStart = () => {
    // No-op: timer starts on first character
  };

  const resetTest = () => {
    setUserInput('');
    setTimeLeft(selectedTime);
    setIsActive(false);
    setWpm(0);
    setElapsed(0);
    setText(getText());
  };

  const handleTimeChange = (time: number) => {
    setSelectedTime(time);
    setTimeLeft(time);
    setElapsed(0);
    setIsActive(false);
    setUserInput('');
    setWpm(0);
    setText(getText());
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="w-full text-left ml-12 pt-12 pb-4">
        <h1 className="text-5xl font-bold font-mono font-bold mb-2">TypeTastic</h1>
        <p className="text-gray-400 font-mono font-semibold text-lg">Test your typing speed and accuracy</p>
      </div>
      <div className="w-full pt-12 pb-4">
        <TestSettings
          selectedTime={selectedTime}
          onTimeChange={handleTimeChange}
          includeNumbers={includeNumbers}
          setIncludeNumbers={setIncludeNumbers}
          includePunctuation={includePunctuation}
          setIncludePunctuation={setIncludePunctuation}
        />
      </div>
      <div className="flex-1 flex flex-col items-center max-w-4xl mx-auto gap-8 justify-start mt-[10vh]">
        <TypingArea
          text={text}
          userInput={userInput}
          onInputChange={setUserInput}
          isActive={isActive}
          onStart={handleStart}
          disabled={timeLeft === 0}
          timeLeft={timeLeft}
          wpm={wpm}
        />

        {/* New Test button, show whenever timeLeft > 0 */}
        {timeLeft > 0 && (
          <button
            onClick={resetTest}
            className="min-w-[600px] w-[800px] max-w-full py-4 bg-gray-700 rounded-lg hover:bg-gray-800 text-xl font-semibold mb-2"
          >
            New Test
          </button>
        )}

        {timeLeft === 0 && (
          <button
            onClick={resetTest}
            className="min-w-[600px] w-[800px] max-w-full py-4 bg-blue-600 rounded-lg hover:bg-blue-700 text-xl font-semibold"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
} 