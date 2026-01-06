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
import Svg, { Image as SvgImage, Defs, Filter, FeColorMatrix, Rect } from 'react-native-svg';
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

  // 모든 슬라이더의 기본값은 1 (원본 상태)
  const [brightness, setBrightness] = useState(1);
  const [saturation, setSaturation] = useState(1);
  const [contrast, setContrast] = useState(1);
  
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawingPath, setDrawingPath] = useState<string>('');
  const [resetTrigger, setResetTrigger] = useState(0);
  
  // 이미지 레이아웃 계산을 위한 상태
  const [imageLayout, setImageLayout] = useState({ width: 0, height: 0 });

  const viewShotRef = useRef<any>(null);

  // 이미지 원본 크기를 가져와서 화면에 맞게 비율 계산
  useEffect(() => {
    const screenWidth = Dimensions.get('window').width;
    const maxDisplayHeight = 350; // 미리보기 영역 최대 높이

    const calculateLayout = (width: number, height: number) => {
      const aspectRatio = width / height;
      
      let displayWidth = screenWidth;
      let displayHeight = screenWidth / aspectRatio;

      if (displayHeight > maxDisplayHeight) {
        displayHeight = maxDisplayHeight;
        displayWidth = maxDisplayHeight * aspectRatio;
      }

      setImageLayout({ width: displayWidth, height: displayHeight });
    };

    if (typeof photo.uri === 'string') {
      Image.getSize(photo.uri, (width, height) => {
        calculateLayout(width, height);
      }, (error) => {
        console.error("Failed to get image size", error);
        // 실패 시 기본 비율 설정 (정사각형 등)
        calculateLayout(screenWidth, screenWidth);
      });
    } else {
      // 로컬 리소스(require)인 경우
      const source = Image.resolveAssetSource(photo.uri as number);
      if (source) {
        calculateLayout(source.width, source.height);
      }
    }
  }, [photo.uri]);

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

  return (
    <View style={styles.container}>
      <View style={styles.imagePreviewContainer}>
        {/* ViewShot은 정확히 이미지 크기만큼만 감싸도록 설정 */}
        <ViewShot
          ref={viewShotRef}
          options={{ format: 'jpg', quality: 0.9 }}
          style={{ width: imageLayout.width, height: imageLayout.height }}
        >
          <View style={{ width: imageLayout.width, height: imageLayout.height }} collapsable={false}>
            {/* SVG 필터를 사용한 이미지 렌더링 */}
            <Svg width="100%" height="100%">
              <Defs>
                <Filter id="colorFilter">
                  {/* 밝기(Brightness) 조절 */}
                  <FeColorMatrix
                    type="matrix"
                    values={`
                      ${brightness} 0 0 0 0
                      0 ${brightness} 0 0 0
                      0 0 ${brightness} 0 0
                      0 0 0 1 0
                    `}
                    result="brightness"
                  />
                  {/* 채도(Saturation) 조절 */}
                  <FeColorMatrix
                    type="saturate"
                    values={saturation}
                    in="brightness"
                    result="saturation"
                  />
                  {/* 명암(Contrast) 조절: C(v-0.5) + 0.5 = Cv + 0.5(1-C) */}
                  <FeColorMatrix
                    type="matrix"
                    values={`
                      ${contrast} 0 0 0 ${0.5 * (1 - contrast)}
                      0 ${contrast} 0 0 ${0.5 * (1 - contrast)}
                      0 0 ${contrast} 0 ${0.5 * (1 - contrast)}
                      0 0 0 1 0
                    `}
                    in="saturation"
                  />
                </Filter>
              </Defs>
              <SvgImage
                x="0"
                y="0"
                width="100%"
                height="100%"
                preserveAspectRatio="none" // View 자체가 비율대로 계산되었으므로 꽉 채움
                href={typeof photo.uri === 'string' ? { uri: photo.uri } : photo.uri}
                filter="url(#colorFilter)"
              />
            </Svg>

            {/* 그리기 캔버스 - 이미지 크기와 동일하게 설정 */}
            <View 
              style={[
                styles.drawingCanvasAbsolute,
                { width: '100%', height: '100%', left: 0 }, // 부모 크기에 꽉 차게
                !isDrawingMode && { pointerEvents: 'none' }
              ]}
              collapsable={false}
            >
              <DrawingCanvas
                resetTrigger={resetTrigger}
                width={imageLayout.width}
                height={imageLayout.height}
                onDrawingChange={setDrawingPath}
              />
            </View>
          </View>
        </ViewShot>
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
            minimumValue={0}
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
            minimumValue={0}
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
  imagePreviewContainer: {
    height: 350, // 고정 높이 대신 이미지 크기에 맞춰짐, 그러나 컨테이너로서의 최대 영역 확보
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    overflow: 'hidden', // 이미지가 튀어나오지 않도록
  },
  drawingCanvasAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
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
