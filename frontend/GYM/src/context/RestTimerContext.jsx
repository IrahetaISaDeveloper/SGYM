// src/context/RestTimerContext.jsx
import React, { createContext, useState, useRef, useCallback, useEffect } from 'react';

export const RestTimerContext = createContext();

export const RestTimerProvider = ({ children }) => {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Create audio element once
  useEffect(() => {
    const audio = new Audio();
    // Use a data URI for a short beep tone so it works without external files
    // This is a tiny WAV beep (~0.3s, 440Hz)
    audio.src = 'data:audio/wav;base64,UklGRl4FAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToFAAAAAAEAAgADAP//AAD//wAA//8AAAAAAAABAAIABAAGAAYABQADAAAA/v/8//r/+f/4//j/+f/6//z//v8AAAIABAAGAAgACgALAAsACgAIAAUAAgD+//r/9//0//H/8P/v//D/8f/z//b/+f/9/wEABQAJAA0AEAASABMAEwARAA4ACgAFAAAA+v/1//D/7P/p/+f/5v/m/+f/6f/s//D/9P/5//7/AwAIAA4AEwAXABoAGwAbABkAFQAQAAoAAwD8//X/7v/o/+P/3//c/9v/2//c/97/4f/l/+r/8P/2//z/AgAJABAAFgAbAB8AIQAiACAAHQAYABIACgACAP3/+P/y/+3/6P/k/+D/3f/b/9n/2f/a/9z/3//i/+b/6//w//b//P8CAAkADwAVABkAHQAfAB4AHQAbABgAFQARAA4ACwAIAAUAAgD//wAA//8AAAEAAQABAAAA//8AAAEAAQACAAIAAQABAAAA//8AAAEAAQACAAIAAQABAAAA//8AAAAAAQABAAIAAQABAAAA//8AAAAAAQACAAIAAQABAAAA//8AAAEAAQACAAIAAQABAAAA//8AAAEAAQACAAIAAQABAAAA//8AAAEAAQACAAIAAQABAAAA//8AAAEAAQACAAIAAQABAAAA//8AAAEAAQACAAIAAQABAAAA//8AAAEAAQACAAIAAQAAAAAAAAAAAAEAAQACAAIAAQAAAAAAAAAAAAEAAQACAAIAAQABAAAA//8AAAEAAQACAAIAAQABAAAA//8AAAEAAQACAAIAAQAAAAAAAAAAAAEAAQACAAIAAQABAAAA//8AAAEAAQACAAIAAQABAAAA//8AAAEAAQACAAIAAQABAAAA//8AAAEAAQACAAIAAQAAAAAAAAAAAAEAAQACAAIAAQABAAAA//8AAAEAAQACAAIAAQAAAAAAAAAAAAEAAQACAAIAAQABAAAA//8AAAEAAQACAAIAAQABAAAA//8AAAEAAQACAAIAAQAAAAAAAAAAAAEAAQACAAIAAQABAAAA//8AAAEAAQACAAIAAQAAAAAAAAAAAAEAAQACAAIAAQAAAAAAAAAAAAEAAQACAAIAAQAAAAAAAAAAAAEAAQACAAIAAQABAAAA//8AAAEAAQACAAIAAQABAAAA//8AAAEAAQACAAIAAQABAAAA//8AAAEAAQACAAIAAQABAAAA//8AAAEAAQACAAIAAQABAAAA//8AAAEAAQACAAIAAQABAAAA//8AAAEAAQACAAIAAQABAAAA//8AAAEAAQACAAIAAQABAAAA//8AAAEAAQACAAIAAQABAAAA//8AAAEAAQACAAIAAQABAAAA//8AAAEAAQACAAIAAQABAAAA//8AAAEAAQACAAIAAQAAAAAAAAAAAAEAAQACAAIAAQAAAAAAAAAAAAEAAQACAAIAAQAAAAAAAAAAAAEAAQACAAIAAQAAAAAAAAAAAAEAAQACAAIAAQAAAAAAAAAAAAEAAQACAAIAAQAAAAAAAAAAAAEAAQACAAIAAQAAAAAAAAAAAAEAAQACAAIAAQAAAAAAAAAAAAEAAQACAAIAAQAAAAAAAAAA';
    audioRef.current = audio;
  }, []);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback((seconds) => {
    clearTimer();
    setSecondsLeft(seconds);
    setTotalSeconds(seconds);
    setIsRunning(true);
    setIsFinished(false);

    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setIsRunning(false);
          setIsFinished(true);
          // Play the alert sound
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer]);

  const stopTimer = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setSecondsLeft(0);
    setTotalSeconds(0);
    setIsFinished(false);
  }, [clearTimer]);

  const dismissFinished = useCallback(() => {
    setIsFinished(false);
    setSecondsLeft(0);
    setTotalSeconds(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return (
    <RestTimerContext.Provider
      value={{
        secondsLeft,
        totalSeconds,
        isRunning,
        isFinished,
        startTimer,
        stopTimer,
        dismissFinished,
      }}
    >
      {children}
    </RestTimerContext.Provider>
  );
};
