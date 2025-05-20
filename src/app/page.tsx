'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import TestSettings from '@/components/TestSettings';
import TypingArea from '@/components/TypingArea';
import { generateText } from '@/utils/textGenerator';
import Image from 'next/image';
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';

export default function Home() {
  const [text, setText] = useState(generateText(250));
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [isActive, setIsActive] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
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
    setAccuracy(100);
    setText(getText());
  };

  const handleTimeChange = (time: number) => {
    setSelectedTime(time);
    setTimeLeft(time);
    setElapsed(0);
    setIsActive(false);
    setUserInput('');
    setWpm(0);
    setAccuracy(100);
    setText(getText());
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <div className="flex-1 px-2 sm:px-0 pb-6 max-w-4xl mx-auto w-full">
        <div className="w-full text-left px-4 sm:px-12 pt-6 sm:pt-12 pb-4 flex items-center gap-4">
          <Image src={`/typetastic/logo.svg`} alt="TypeTastic Logo" width={48} height={48} className="w-12 h-12 sm:w-16 sm:h-16" />
          <div>
            <h1 className="text-3xl sm:text-5xl font-bold font-mono mb-1 sm:mb-2">TypeTastic</h1>
            <p className="text-gray-400 font-mono font-semibold text-base sm:text-lg">Test your typing speed and accuracy</p>
          </div>
        </div>
        <div className="w-full px-4 sm:px-0 pt-6 sm:pt-12 pb-4">   
          <TestSettings
            selectedTime={selectedTime}
            onTimeChange={handleTimeChange}
            includeNumbers={includeNumbers}
            setIncludeNumbers={setIncludeNumbers}
            includePunctuation={includePunctuation}
            setIncludePunctuation={setIncludePunctuation}
          />
        </div>
        <div className="flex flex-col items-center w-full px-2 sm:px-0 max-w-3xl mx-auto gap-4 sm:gap-4 justify-start mt-8 sm:mt-24">
          <TypingArea
            text={text}
            userInput={userInput}
            onInputChange={setUserInput}
            isActive={isActive}
            onStart={handleStart}
            disabled={timeLeft === 0}
            timeLeft={timeLeft}
            wpm={wpm}
            onAccuracyChange={setAccuracy}
            accuracy={accuracy}
          />

          <div className="w-full flex flex-col">
            {timeLeft > 0 && (
              <button
                onClick={resetTest}
                className="w-full sm:min-w-[600px] sm:w-[800px] max-w-full py-3 sm:py-4 bg-gray-700 rounded-lg hover:bg-gray-800 text-lg sm:text-xl font-semibold"
              >
                New Test
              </button>
            )}
            {timeLeft === 0 && (
              <button
                onClick={resetTest}
                className="w-full sm:min-w-[600px] sm:w-[800px] max-w-full py-3 sm:py-4 bg-blue-600 rounded-lg hover:bg-blue-700 text-lg sm:text-xl font-semibold"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Footer social links */}
      <footer className="w-full bg-gray-900 py-6 flex justify-center items-center gap-6 border-t border-gray-800 mt-8 sm:mt-16">
        <a
          href="https://github.com/JacobLiberty/typetastic"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition"
          title="GitHub Repository"
        >
          <FaGithub size={24} className="sm:w-7 sm:h-7" />
          <span className="hidden sm:inline text-lg font-mono">GitHub</span>
        </a>
        <a
          href="https://www.linkedin.com/in/jacobtliberty/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition"
          title="LinkedIn"
        >
          <FaLinkedin size={24} className="sm:w-7 sm:h-7" />
          <span className="hidden sm:inline text-lg font-mono">LinkedIn</span>
        </a>
        <a
          href="mailto:jacob.tobin.liberty@gmail.com"
          className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition"
          title="Contact via Email"
        >
          <FaEnvelope size={24} className="sm:w-7 sm:h-7" />
          <span className="hidden sm:inline text-lg font-mono">Contact</span>
        </a>
      </footer>
    </div>
  );
} 