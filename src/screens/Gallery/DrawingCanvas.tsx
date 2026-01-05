import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  GestureResponderEvent,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface DrawingCanvasProps {
  width: number;
  height: number;
  onDrawingChange?: (svgPath: string) => void;
  resetTrigger?: number;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  width,
  height,
  onDrawingChange,
  resetTrigger = 0,
}) => {
  const [paths, setPaths] = useState<Array<{ d: string }>>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const isDrawingRef = useRef(false);

  useEffect(() => {
    if (resetTrigger > 0) {
      setPaths([]);
      setCurrentPath('');
      onDrawingChange?.('');
    }
  }, [resetTrigger, onDrawingChange]);

  const handleTouchStart = (event: GestureResponderEvent) => {
    isDrawingRef.current = true;
    const { locationX, locationY } = event.nativeEvent;
    const pathData = `M ${locationX} ${locationY}`;
    setCurrentPath(pathData);
  };

  const handleTouchMove = (event: GestureResponderEvent) => {
    if (!isDrawingRef.current) return;
    const { locationX, locationY } = event.nativeEvent;
    setCurrentPath((prev) => `${prev} L ${locationX} ${locationY}`);
  };

  const handleTouchEnd = () => {
    isDrawingRef.current = false;
    if (currentPath) {
      const newPaths = [...paths, { d: currentPath }];
      setPaths(newPaths);
      onDrawingChange?.(JSON.stringify(newPaths));
      setCurrentPath('');
    }
  };

  return (
    <View style={[styles.container, { width, height }]} collapsable={false}>
      <Svg 
        width={width} 
        height={height}
        style={styles.svg}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 저장된 경로들 */}
        {paths.map((path, idx) => (
          <Path
            key={`saved-${idx}`}
            d={path.d}
            stroke="black"
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {/* 현재 그리고 있는 경로 */}
        {currentPath && (
          <Path
            d={currentPath}
            stroke="black"
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: 'transparent',
  },
  svg: {
    backgroundColor: 'transparent',
  },
});
