'use client';

import { FC, useRef, useState, useEffect, useLayoutEffect } from 'react';

interface TypingAreaProps {
  text: string;
  userInput: string;
  onInputChange: (value: string) => void;
  isActive: boolean;
  onStart: () => void;
  disabled: boolean;
  timeLeft: number;
  wpm: number;
}

const TypingArea: FC<TypingAreaProps> = ({
  text,
  userInput,
  onInputChange,
  isActive,
  onStart,
  disabled,
  timeLeft,
  wpm
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const beforeCursorRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [offset, setOffset] = useState(0);
  const [started, setStarted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isActive) {
      onStart();
      setStarted(true);
    }
    if (e.target.value.length <= text.length) {
      onInputChange(e.target.value);
    }
  };

  // Split text and input into words
  const textWords = text.split(/\s+/);
  const inputWords = userInput.split(/\s+/);
  // Determine current word index robustly
  let currentWordIndex;
  if (userInput.endsWith(' ')) {
    currentWordIndex = inputWords.length - 1;
  } else {
    currentWordIndex = inputWords.length - 1;
  }
  const currentWord = textWords[currentWordIndex] || '';
  const userCurrentWord = !userInput.endsWith(' ') ? inputWords[inputWords.length - 1] : '';
  // Split current word into typed and untyped
  const typedLength = userCurrentWord.length;
  const currentWordTyped = currentWord.slice(0, typedLength);
  const currentWordUntyped = currentWord.slice(typedLength);

  // Build beforeCursor: all completed words + spaces
  let beforeCursor = '';
  for (let i = 0; i < currentWordIndex; i++) {
    if (textWords[i] !== undefined) {
      beforeCursor += textWords[i] + ' ';
    }
  }

  // Calculate character colors for the before cursor text (completed words + typed part of current word)
  const beforeAndCurrentChars = (beforeCursor + currentWordTyped).split('').map((char, idx) => {
    let isCorrect;
    if (idx < beforeCursor.length) {
      isCorrect = char === userInput[idx];
    } else {
      // For current word, offset index
      const userIdx = idx;
      isCorrect = char === userInput[userIdx];
    }
    return (
      <span key={idx} className={isCorrect ? 'text-green-500' : 'text-red-500'}>
        {char}
      </span>
    );
  });

  // For offset calculation, use completed + typed part
  // After next word
  const afterNextWord = textWords.slice(currentWordIndex + 1).join(' ');

  // Measure width of beforeCursor to center the current character
  useLayoutEffect(() => {
    if (beforeCursorRef.current && containerRef.current) {
      const width = beforeCursorRef.current.offsetWidth;
      setOffset(width);
    }
  }, [userInput, text]);

  // Focus the hidden input when the test starts or if it loses focus
  useEffect(() => {
    if (started && inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.focus();
    }
  }, [started, userInput]);

  // Global keydown handler to focus input and add character if not focused
  useEffect(() => {
    if (!started || disabled) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!inputRef.current) return;
      // If input is not focused and a character key is pressed
      if (document.activeElement !== inputRef.current) {
        // Only allow single character keys (ignore control/meta/alt/arrow keys)
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          // Append the key to the current value if not exceeding text length
          if (userInput.length < text.length) {
            onInputChange(userInput + e.key);
          }
          inputRef.current.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [started, disabled, userInput, text, onInputChange]);

  // On blur, refocus the input if test is started and not disabled
  const handleBlur = () => {
    if (started && !disabled && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const handleStartTest = () => {
    setStarted(true);
    onStart();
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  return (
    <div className="space-y-4 w-full flex flex-col items-center">
      {/* Time and WPM display */}
      <div className="flex justify-center items-center space-x-32 my-8">
        <div className="flex flex-col items-center">
          <span className="text-2xl font-mono text-gray-400 font-bold">Time</span>
          <span className="text-3xl font-bold font-mono text-blue-500">{timeLeft}s</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-mono text-gray-400 font-bold">WPM</span>
          <span className="text-3xl font-bold font-mono text-blue-500">{wpm}</span>
        </div>
      </div>
      <div
        ref={containerRef}
        className="relative min-h-32 h-24 min-w-[600px] w-[800px] max-w-full bg-gray-800 rounded-lg overflow-hidden border-2 border-blue-700 flex items-center justify-center"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full max-w-5xl mx-auto px-12">
            {/* Center line */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-8 bg-blue-500 z-10" />
            {/* Text container */}
            <div className="relative flex items-center justify-center">
              <div
                className="text-4xl font-mono whitespace-nowrap typing-text text-white"
                style={{ transform: `translateX(calc(50% - ${offset}px))` }}
              >
                <span ref={beforeCursorRef}>{beforeAndCurrentChars}</span>
                {/* Add a space after current word if there are more words */}
                {currentWordUntyped && <span className="text-blue-500">{currentWordUntyped}</span>}
                {afterNextWord && <span> </span>}
                <span className="text-gray-400">{afterNextWord}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden input for typing */}
      <input
        ref={inputRef}
        type="text"
        value={userInput}
        onChange={handleInputChange}
        disabled={disabled}
        className="absolute opacity-0 pointer-events-none"
        tabIndex={-1}
        maxLength={text.length}
        autoComplete="off"
        spellCheck={false}
        onBlur={handleBlur}
      />

      {/* Start Test button */}
      {!started && (
        <button
          className="w-full py-4 bg-blue-600 rounded-lg hover:bg-blue-700 text-xl font-semibold"
          onClick={handleStartTest}
        >
          Start Test
        </button>
      )}
    </div>
  );
};

export default TypingArea; 