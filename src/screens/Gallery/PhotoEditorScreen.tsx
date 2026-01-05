import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';

interface Photo {
  id: string;
  uri: string;
  name: string;
}

interface Props {
  route: any;
  navigation: any;
}

export const PhotoEditorScreen: React.FC<Props> = ({ route, navigation }) => {
  const { photo }: { photo: Photo } = route.params;

  const [brightness, setBrightness] = useState(1);
  const [saturation, setSaturation] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  const handleSave = () => {
    Alert.alert('저장 완료', '편집된 사진이 저장되었습니다.');
    navigation.goBack();
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const getFilterStyle = () => {
    // React Native에서는 CSS 필터를 직접 사용할 수 없으므로
    // opacity로 표현합니다
    return {
      opacity: brightness,
    };
  };

  return (
    <View style={styles.container}>
      <View style={styles.imagePreviewContainer}>
        <Image
          source={{ uri: photo.uri }}
          style={[styles.previewImage, getFilterStyle()]}
          resizeMode="contain"
        />
      </View>

      <ScrollView style={styles.controlsContainer}>
        {/* 밝기 조절 */}
        <View style={styles.controlSection}>
          <View style={styles.controlHeader}>
            <Text style={styles.controlTitle}>밝기</Text>
            <Text style={styles.controlValue}>
              {Math.round(brightness * 100)}%
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0.3}
            maximumValue={2}
            step={0.1}
            value={brightness}
            onValueChange={setBrightness}
            minimumTrackTintColor="#007AFF"
            maximumTrackTintColor="#ddd"
          />
        </View>

        {/* 채도 조절 */}
        <View style={styles.controlSection}>
          <View style={styles.controlHeader}>
            <Text style={styles.controlTitle}>채도</Text>
            <Text style={styles.controlValue}>
              {Math.round(saturation * 100)}%
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={2}
            step={0.1}
            value={saturation}
            onValueChange={setSaturation}
            minimumTrackTintColor="#34C759"
            maximumTrackTintColor="#ddd"
          />
        </View>

        {/* 명암 조절 */}
        <View style={styles.controlSection}>
          <View style={styles.controlHeader}>
            <Text style={styles.controlTitle}>명암</Text>
            <Text style={styles.controlValue}>
              {Math.round(contrast * 100)}%
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0.5}
            maximumValue={2}
            step={0.1}
            value={contrast}
            onValueChange={setContrast}
            minimumTrackTintColor="#FF9500"
            maximumTrackTintColor="#ddd"
          />
        </View>

        {/* 그리기 모드 */}
        <View style={styles.controlSection}>
          <TouchableOpacity
            style={[
              styles.drawingModeButton,
              isDrawingMode && styles.drawingModeActive,
            ]}
            onPress={() => setIsDrawingMode(!isDrawingMode)}
          >
            <Text style={styles.drawingModeButtonText}>
              {isDrawingMode ? '✓ 그리기 모드 활성' : '그리기 모드'}
            </Text>
          </TouchableOpacity>
          {isDrawingMode && (
            <Text style={styles.drawingInfo}>
              그리기 모드가 활성화되었습니다. (향후 구현)
            </Text>
          )}
        </View>

        {/* 리셋 버튼 */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => {
            setBrightness(1);
            setSaturation(1);
            setContrast(1);
            setIsDrawingMode(false);
          }}
        >
          <Text style={styles.resetButtonText}>초기화</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 하단 액션 버튼 */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
        >
          <Text style={styles.actionButtonText}>취소</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.actionButtonText}>저장</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imagePreviewContainer: {
    height: 250,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  previewImage: {
    width: '90%',
    height: '100%',
  },
  controlsContainer: {
    flex: 1,
    padding: 16,
  },
  controlSection: {
    marginBottom: 24,
  },
  controlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  controlTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  controlValue: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  drawingModeButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  drawingModeActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  drawingModeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  drawingInfo: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
  resetButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
