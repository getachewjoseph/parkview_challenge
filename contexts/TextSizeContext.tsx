import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TextSizeContextType {
  textSize: number;
  setTextSize: (size: number) => void;
  getScaledFontSize: (baseSize: number) => number;
}

const TextSizeContext = createContext<TextSizeContextType | undefined>(undefined);

export const useTextSize = () => {
  const context = useContext(TextSizeContext);
  if (context === undefined) {
    throw new Error('useTextSize must be used within a TextSizeProvider');
  }
  return context;
};

interface TextSizeProviderProps {
  children: React.ReactNode;
}

export const TextSizeProvider: React.FC<TextSizeProviderProps> = ({ children }) => {
  const [textSize, setTextSizeState] = useState(1.0); // Default scale factor

  useEffect(() => {
    // Load saved text size on app start
    loadTextSize();
  }, []);

  const loadTextSize = async () => {
    try {
      const savedTextSize = await AsyncStorage.getItem('textSize');
      if (savedTextSize) {
        setTextSizeState(parseFloat(savedTextSize));
      }
    } catch (error) {
      console.log('Error loading text size:', error);
    }
  };

  const setTextSize = async (size: number) => {
    try {
      setTextSizeState(size);
      await AsyncStorage.setItem('textSize', size.toString());
    } catch (error) {
      console.log('Error saving text size:', error);
    }
  };

  const getScaledFontSize = (baseSize: number): number => {
    return Math.round(baseSize * textSize);
  };

  const value = {
    textSize,
    setTextSize,
    getScaledFontSize,
  };

  return (
    <TextSizeContext.Provider value={value}>
      {children}
    </TextSizeContext.Provider>
  );
};
