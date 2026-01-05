import RNFS from 'react-native-fs';

/**
 * Save edited image captured by view-shot
 */
export const saveEditedImage = async (
  capturedUri: string,
  originalName: string
): Promise<string> => {
  try {
    // Create a unique filename
    const timestamp = Date.now();
    const filename = `edited_${originalName}_${timestamp}.jpg`;

    // Save to app's document directory
    const documentDir = RNFS.DocumentDirectoryPath;
    const imagePath = `${documentDir}/${filename}`;

    // Handle URI format for RNFS: remove 'file://' prefix if present
    let sourcePath = capturedUri;
    if (sourcePath.startsWith('file://')) {
      sourcePath = sourcePath.substring(7);
    }

    // Use copyFile instead of read/write base64 for better performance
    if (await RNFS.exists(sourcePath)) {
        await RNFS.copyFile(sourcePath, imagePath);
    } else {
        throw new Error(`Source file does not exist: ${sourcePath}`);
    }

    console.log('Image saved to:', imagePath);
    
    // Return with file:// prefix for React Native Image component
    return `file://${imagePath}`;
  } catch (error) {
    console.error('Save image error:', error);
    throw error;
  }
};

/**
 * Save filtered and drawn image to device storage (deprecated)
 */
export const captureAndSaveImage = async (
  imageUri: string | number,
  drawingPath: string,
  originalName: string
): Promise<string> => {
  try {
    // require() 이미지(숫자)는 편집할 수 없음 - 에러 발생
    if (typeof imageUri === 'number') {
      throw new Error('번들 이미지는 편집 후 저장할 수 없습니다. 기기의 사진을 선택해주세요.');
    }

    // Create a unique filename
    const timestamp = Date.now();
    const filename = `edited_${originalName}_${timestamp}.jpg`;

    // Save to Pictures directory (or app cache)
    const documentDir = RNFS.DocumentDirectoryPath;
    const imagePath = `${documentDir}/${filename}`;

    // Read the original image
    const base64 = await RNFS.readFile(imageUri as string, 'base64');

    // Write to new location
    await RNFS.writeFile(imagePath, base64, 'base64');

    console.log('Image saved to:', imagePath);
    return imagePath;
  } catch (error) {
    console.error('Save image error:', error);
    throw error;
  }
};

/**
 * Save image to device gallery
 */
export const saveToGallery = async (imagePath: string): Promise<void> => {
  try {
    // Copy image to Pictures directory for gallery access
    const picturesDir = `${RNFS.DocumentDirectoryPath}/../Pictures`;
    const filename = `edited_${Date.now()}.jpg`;
    const destinationPath = `${picturesDir}/${filename}`;

    await RNFS.copyFile(imagePath, destinationPath);
    console.log('Image saved to gallery:', destinationPath);
  } catch (error) {
    console.error('Save to gallery error:', error);
    throw error;
  }
};
