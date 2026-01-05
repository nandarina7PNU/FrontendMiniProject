import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { usePhotoContext, Photo } from '../../context/PhotoContext';

interface Props {
  navigation: any;
  route: any;
}

export const GalleryListScreen: React.FC<Props> = ({ navigation }) => {
  const { photos, addPhoto } = usePhotoContext();

  const handleAddPhoto = useCallback(() => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
      },
      (response) => {
        if (response.didCancel) {
          return;
        }

        if (response.errorCode) {
          console.error('ImagePicker Error:', response.errorMessage);
          return;
        }

        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          const newPhoto: Photo = {
            id: Date.now().toString(),
            uri: asset.uri || '',
            name: asset.fileName || `photo_${Date.now()}`,
          };
          addPhoto(newPhoto);
        }
      }
    );
  }, [addPhoto]);

  const handlePhotoPress = (photo: Photo) => {
    navigation.navigate('PhotoDetail', { photo });
  };

  const renderPhoto = ({ item }: { item: Photo }) => (
    <TouchableOpacity
      style={styles.photoContainer}
      onPress={() => handlePhotoPress(item)}
    >
      <Image
        source={typeof item.uri === 'number' ? item.uri : { uri: item.uri as string }}
        style={styles.photo}
        resizeMode="cover"
        onError={(e) => console.log('Image Load Error:', item.uri, e.nativeEvent.error)}
      />
    </TouchableOpacity>
  );

  const numColumns = 3;

  return (
    <View style={styles.container}>
      {photos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>사진이 없습니다</Text>
          <Text style={styles.emptySubText}>
            아래 버튼을 눌러 사진을 추가하세요
          </Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          renderItem={renderPhoto}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddPhoto}
      >
        <Text style={styles.addButtonText}>+ 사진 추가</Text>
      </TouchableOpacity>
    </View>
  );
};

const screenWidth = Dimensions.get('window').width;
const photoSize = screenWidth / 3 - 6;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
  },
  listContent: {
    padding: 3,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  photoContainer: {
    width: photoSize,
    height: photoSize,
    margin: 3,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  addButton: {
    backgroundColor: '#007AFF',
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
