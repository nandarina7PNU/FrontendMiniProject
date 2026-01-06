import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { GOOGLE_MAPS_API_KEY } from '@env';

export const MapScreen: React.FC = () => {
  // 대한민국(서울) 중심 좌표
  const [region, setRegion] = useState<Region>({
    latitude: 37.5665, // 서울 위도
    longitude: 126.978, // 서울 경도
    latitudeDelta: 5.0, // 지도 확대/축소 수준 (위도)
    longitudeDelta: 5.0, // 지도 확대/축소 수준 (경도)
  });

  /**
   * 사용자가 지도를 이동하거나 확대/축소했을 때 호출되는 함수
   * @param newRegion - 변경된 지도 영역 정보
   */
  const handleRegionChangeComplete = (newRegion: Region) => {
    setRegion(newRegion);
  };

  // API 키가 설정되지 않았는지 확인 (개발 중 디버깅용)
  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'your_api_key_here') {
    console.warn(
      'Google Maps API 키가 설정되지 않았습니다. .env 파일을 확인하세요.',
    );
  }

  return (
    <View style={styles.container}>
      {/* Google Maps 컴포넌트 */}
      <MapView
        provider={PROVIDER_GOOGLE} // Google Maps 사용
        style={styles.map}
        region={region} // 현재 지도 영역
        onRegionChangeComplete={handleRegionChangeComplete} // 지도 변경 완료 시 호출
        showsUserLocation={false} // 사용자 위치 표시 (옵션)
        showsMyLocationButton={false} // 내 위치 버튼 표시 (옵션)
        zoomEnabled={true} // 확대/축소 가능
        scrollEnabled={true} // 지도 이동 가능
        pitchEnabled={true} // 3D 각도 조절 가능
        rotateEnabled={true} // 회전 가능
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1, // 전체 화면을 지도로 채움
  },
});
