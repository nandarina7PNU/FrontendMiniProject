import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  BackHandler,
} from 'react-native';
import Slider from '@react-native-community/slider';
import ViewShot from 'react-native-view-shot';
import { DrawingCanvas } from './DrawingCanvas';
import { saveEditedImage } from './imageUtils';
import { usePhotoContext, Photo } from '../../context/PhotoContext';

interface Props {
  route: any;
  navigation: any;
}

export const PhotoEditorScreen: React.FC<Props> = ({ route, navigation }) => {
  const { photo }: { photo: Photo } = route.params;
  const { updatePhoto } = usePhotoContext();

  const [brightness, setBrightness] = useState(1);
  const [saturation, setSaturation] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawingPath, setDrawingPath] = useState<string>('');
  const [resetTrigger, setResetTrigger] = useState(0);

  const viewShotRef = useRef<any>(null);

  // 뒤로가기 로직: 편집 취소하고 갤러리 목록으로 이동 (스택 초기화)
  const handleBack = React.useCallback(() => {
    // 저장하지 않고 갤러리 목록으로 돌아감 (스택을 리셋하여 이전 화면들 제거)
    navigation.reset({
      index: 0,
      routes: [{ name: 'GalleryList' }],
    });
  }, [navigation]);

  // 헤더 백 버튼 및 하드웨어 백 버튼 오버라이드
  React.useEffect(() => {
    // 헤더 백 버튼
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={handleBack} style={{ marginRight: 16 }}>
          <Text style={{ fontSize: 16, color: '#007AFF' }}>뒤로</Text>
        </TouchableOpacity>
      ),
    });

    // 하드웨어 백 버튼
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        handleBack();
        return true; // 기본 동작 막음
      }
    );

    return () => backHandler.remove();
  }, [navigation, handleBack]);

  const handleSave = async () => {
    try {
      if (!viewShotRef.current) {
        throw new Error('이미지 캡처에 실패했습니다.');
      }

      // view-shot으로 현재 필터가 적용된 이미지 캡처
      const uri = await viewShotRef.current.capture();
      
      // 캡처한 이미지를 저장
      const savedPath = await saveEditedImage(uri, photo.name);
      console.log('Saved image path:', savedPath);
      
      Alert.alert('저장 완료', '편집된 사진이 저장되었습니다.', [
        {
          text: '확인',
          onPress: () => {
            // Context 업데이트: 전역 상태에 변경사항 반영
            updatePhoto({
              ...photo,
              uri: savedPath,
            });

            // 저장 성공 시 갤러리 목록으로 이동하며 스택 리셋
            navigation.reset({
              index: 0,
              routes: [{ name: 'GalleryList' }],
            });
          }
        }
      ]);
      
    } catch (error) {
      Alert.alert('오류', error instanceof Error ? error.message : '사진 저장에 실패했습니다.');
      console.error('Save error:', error);
    }
  };

  const handleClearDrawing = () => {
    setResetTrigger(prev => prev + 1);
  };

  const getFilterStyle = () => {
    // 밝기 조절: 0.5 ~ 2.0 범위
    // 0.5 = -50% (어둡게), 1.0 = 0% (원본), 2.0 = +100% (밝게)
    if (brightness >= 1) {
      // 밝게: 흰색 오버레이 추가
      const overlayOpacity = (brightness - 1) / 4; // 0 ~ 0.25
      return {
        backgroundColor: `rgba(255, 255, 255, ${overlayOpacity})`,
      };
    } else {
      // 어둡게: 이미지의 opacity 감소
      const imageOpacity = brightness * 1.5; // 0.75 ~ 1.0 (0.5 * 1.5 = 0.75)
      return {};
    }
  };

  const getImageOpacity = () => {
    // 어둡게: opacity로 직접 제어
    if (brightness < 1) {
      return brightness * 1.5; // 0.5 -> 0.75, 1.0 -> 1.5 (1.0으로 clamp)
    }
    return 1;
  };

  return (
    <View style={styles.container}>
      <ViewShot
        ref={viewShotRef}
        options={{ format: 'jpg', quality: 0.9 }}
        style={styles.viewShotContainer}
      >
        <View style={styles.imagePreviewContainer} collapsable={false}>
          <View style={[styles.imageWrapper, getFilterStyle()]}>
            <Image
              source={typeof photo.uri === 'number' ? photo.uri : { uri: photo.uri as string }}
              style={[styles.previewImage, { opacity: getImageOpacity() }]}
              resizeMode="contain"
            />
          </View>

          {/* 그리기 캔버스 - 항상 보이도록 유지 (view-shot이 캡처하기 위해) */}
          <View 
            style={[
              styles.drawingCanvasAbsolute,
              !isDrawingMode && { pointerEvents: 'none' }
            ]}
            collapsable={false}
          >
            <DrawingCanvas
              resetTrigger={resetTrigger}
              width={Dimensions.get('window').width * 0.9}
              height={250}
              onDrawingChange={setDrawingPath}
            />
          </View>
        </View>
      </ViewShot>

      <ScrollView style={styles.controlsContainer}>
        {/* 밝기 조절 */}
        <View style={styles.controlSection}>
          <View style={styles.controlHeader}>
            <Text style={styles.controlTitle}>밝기</Text>
            <Text style={styles.controlValue}>
              {brightness < 1 ? Math.round((brightness - 1) * 100) : `+${Math.round((brightness - 1) * 100)}`}%
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0.5}
            maximumValue={2}
            step={0.05}
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

        {/* 그리기 모드 및 지우기 버튼 */}
        <View style={styles.controlSection}>
          <View style={styles.drawingControlsRow}>
            <TouchableOpacity
              style={[
                styles.drawingModeButton,
                isDrawingMode && styles.drawingModeActive,
              ]}
              onPress={() => setIsDrawingMode(!isDrawingMode)}
            >
              <Text style={styles.drawingModeButtonText}>
                {isDrawingMode ? '✓ 그리기 모드' : '그리기 모드'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.clearDrawingButton}
              onPress={handleClearDrawing}
            >
              <Text style={styles.clearDrawingButtonText}>그림 지우기</Text>
            </TouchableOpacity>
          </View>
          
          {isDrawingMode && (
            <Text style={styles.drawingInfo}>
              이미지 위에 검은색으로 그릴 수 있습니다.
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
            handleClearDrawing();
            setDrawingPath('');
          }}
        >
          <Text style={styles.resetButtonText}>초기화</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 하단 액션 버튼 */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleBack}
        >
          <Text style={styles.actionButtonText}>나가기</Text>
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
  viewShotContainer: {
    height: 250,
  },
  imagePreviewContainer: {
    height: 250,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    position: 'relative',
  },
  imageWrapper: {
    width: '90%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  drawingCanvasAbsolute: {
    position: 'absolute',
    top: 0,
    left: '5%',
    width: '90%',
    height: 250,
  },
  drawingCanvasOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
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
  drawingControlsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  drawingModeButton: {
    flex: 2,
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  clearDrawingButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearDrawingButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
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
