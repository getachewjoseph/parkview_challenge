import React from 'react';
import { Text, TextProps } from 'react-native';
import { useTextSize } from '../contexts/TextSizeContext';

interface ScaledTextProps extends TextProps {
  baseSize?: number;
}

export const ScaledText: React.FC<ScaledTextProps> = ({ 
  style, 
  baseSize = 16, 
  children, 
  ...props 
}) => {
  const { getScaledFontSize } = useTextSize();
  
  const scaledStyle = {
    ...style,
    fontSize: getScaledFontSize(baseSize),
  };

  return (
    <Text style={scaledStyle} {...props}>
      {children}
    </Text>
  );
};
