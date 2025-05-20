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
  onAccuracyChange: (accuracy: number) => void;
  accuracy: number;
}

const TypingArea: FC<TypingAreaProps> = ({
  text,
  userInput,
  onInputChange,
  isActive,
  onStart,
  disabled,
  timeLeft,
  wpm,
  onAccuracyChange,
  accuracy
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const beforeCursorRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [offset, setOffset] = useState(0);
  const [started, setStarted] = useState(false);
  const [totalMistakes, setTotalMistakes] = useState(0);
  const [lastInputLength, setLastInputLength] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isActive) {
      onStart();
      setStarted(true);
    }
    if (e.target.value.length <= text.length) {
      const newInput = e.target.value;
      let newMistakes = totalMistakes;
      
      // Only check for new mistakes in the newly typed characters
      if (newInput.length > lastInputLength) {
        // Check the last character typed for a mistake
        const lastCharIndex = newInput.length - 1;
        if (lastCharIndex < text.length && newInput[lastCharIndex] !== text[lastCharIndex]) {
          newMistakes += 1;
          setTotalMistakes(newMistakes);
        }
      }
      
      // Update total characters
      setLastInputLength(newInput.length);
      
      // Calculate accuracy based on total mistakes and characters
      const accuracy = newInput.length > 0 
        ? Math.max(0, Math.round((1 - newMistakes / newInput.length) * 100))
        : 100;
      
      onAccuracyChange(accuracy);
      onInputChange(e.target.value);
    }
  };

  // Reset totals when test is reset
  useEffect(() => {
    if (!isActive && userInput === '') {
      setTotalMistakes(0);
      setLastInputLength(0);
    }
  }, [isActive, userInput]);

  // Split text and input into words
  const textWords = text.split(/\s+/);
  const inputWords = userInput.split(/\s+/);
  
  // Get the actual spaces between words from the input
  const inputSpaces = userInput.split(/[^\s]+/).filter(space => space.length > 0);
  
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
  let spaceIndex = 0;
  for (let i = 0; i < currentWordIndex; i++) {
    if (textWords[i] !== undefined) {
      beforeCursor += textWords[i];
      // Add spaces based on actual input
      if (inputSpaces[spaceIndex]) {
        // If there are extra spaces, show them as underscores
        if (inputSpaces[spaceIndex].length > 1) {
          beforeCursor += ' ' + '_'.repeat(inputSpaces[spaceIndex].length - 1);
        } else {
          beforeCursor += ' ';
        }
        spaceIndex++;
      } else {
        beforeCursor += ' ';
      }
    }
  }

  // Calculate character colors for the before cursor text (completed words + typed part of current word)
  const beforeAndCurrentChars = (beforeCursor + currentWordTyped).split('').map((char, idx) => {
    let isCorrect;
    let displayChar = char;
    if (idx < beforeCursor.length) {
      isCorrect = char === userInput[idx];
      if (!isCorrect) {
        // If we expect a space but got a character, show that character
        if (char === ' ' && userInput[idx] && userInput[idx] !== ' ') {
          displayChar = userInput[idx];
        } else {
          // Show underscore for incorrect spaces, otherwise show the typed character
          displayChar = userInput[idx] === ' ' ? '_' : (userInput[idx] || char);
        }
      }
    } else {
      // For current word, offset index
      const userIdx = idx;
      isCorrect = char === userInput[userIdx];
      if (!isCorrect) {
        // If we expect a space but got a character, show that character
        if (char === ' ' && userInput[userIdx] && userInput[userIdx] !== ' ') {
          displayChar = userInput[userIdx];
        } else {
          displayChar = userInput[userIdx] === ' ' ? '_' : (userInput[userIdx] || char);
        }
      }
    }
    return (
      <span key={idx} className={isCorrect ? 'text-green-500' : 'text-red-500'}>
        {displayChar}
      </span>
    );
  });

  // Add any extra characters from the current word that weren't in the target text
  const extraChars = userCurrentWord.slice(currentWord.length);
  if (extraChars) {
    beforeAndCurrentChars.push(
      <span key="extra" className="text-red-500">
        {extraChars}
      </span>
    );
  }

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
      {/* Time, WPM, and Accuracy display - Card Style with Dividers */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 my-4 sm:my-8 w-full">
        <div className="flex flex-col items-center bg-gray-700/60 rounded-lg px-4 sm:px-8 py-3 sm:py-4 shadow w-full sm:w-auto min-w-[0] sm:min-w-[8rem]">
          <span className="text-base sm:text-lg font-mono text-gray-400 font-semibold tracking-wide">Time</span>
          <span className="text-2xl sm:text-4xl font-extrabold font-mono text-blue-500 mt-1">{timeLeft}s</span>
        </div>
        <div className="hidden sm:block w-0.5 h-12 bg-gray-600 rounded mx-2" />
        <div className="block sm:hidden h-0.5 w-full bg-gray-600 rounded my-2" />
        <div className="flex flex-col items-center bg-gray-700/60 rounded-lg px-4 sm:px-8 py-3 sm:py-4 shadow w-full sm:w-auto min-w-[0] sm:min-w-[8rem]">
          <span className="text-base sm:text-lg font-mono text-gray-400 font-semibold tracking-wide">WPM</span>
          <span className="text-2xl sm:text-4xl font-extrabold font-mono text-blue-500 mt-1">{wpm}</span>
        </div>
        <div className="hidden sm:block w-0.5 h-12 bg-gray-600 rounded mx-2" />
        <div className="block sm:hidden h-0.5 w-full bg-gray-600 rounded my-2" />
        <div className="flex flex-col items-center bg-gray-700/60 rounded-lg px-4 sm:px-8 py-3 sm:py-4 shadow w-full sm:w-auto min-w-[0] sm:min-w-[8rem]">
          <span className="text-base sm:text-lg font-mono text-gray-400 font-semibold tracking-wide">Accuracy</span>
          <span className="text-2xl sm:text-4xl font-extrabold font-mono text-blue-500 mt-1">{accuracy}%</span>
        </div>
      </div>
      <div
        ref={containerRef}
        className="relative min-h-32 h-24 w-full max-w-full bg-gray-800 rounded-lg overflow-hidden border-2 border-blue-700 flex items-center justify-center"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full max-w-5xl mx-auto px-2 sm:px-12">
            {/* Center line */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-8 bg-blue-500 z-10" />
            {/* Text container */}
            <div className="relative flex items-center justify-center">
              <div
                className="text-lg sm:text-4xl font-mono whitespace-nowrap typing-text text-white"
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