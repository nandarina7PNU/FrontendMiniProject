import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

interface Photo {
  id: string;
  uri: string | number;
  name: string;
}

interface Props {
  route: any;
  navigation: any;
}

export const PhotoDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { photo }: { photo: Photo } = route.params;

  const handleEdit = () => {
    navigation.navigate('PhotoEditor', { photo });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={typeof photo.uri === 'number' ? photo.uri : { uri: photo.uri as string }}
          style={styles.fullImage}
          resizeMode="contain"
        />

        <View style={styles.infoContainer}>
          <Text style={styles.photoName}>{photo.name}</Text>
          <Text style={styles.photoId}>ID: {photo.id}</Text>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEdit}
          >
            <Text style={styles.buttonText}>편집</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
          >
            <Text style={styles.buttonText}>삭제</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>사진 정보</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>파일명:</Text>
            <Text style={styles.detailValue}>{photo.name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>추가 날짜:</Text>
            <Text style={styles.detailValue}>
              {new Date(parseInt(photo.id)).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 16,
  },
  fullImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoContainer: {
    marginBottom: 20,
  },
  photoName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  photoId: {
    fontSize: 12,
    color: '#999',
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  detailsSection: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#000',
  },
});
