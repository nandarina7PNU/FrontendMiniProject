import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface Photo {
  id: string;
  uri: string | number;
  name: string;
}

interface PhotoContextType {
  photos: Photo[];
  addPhoto: (photo: Photo) => void;
  updatePhoto: (updatedPhoto: Photo) => void;
}

const PhotoContext = createContext<PhotoContextType | undefined>(undefined);

export const PhotoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [photos, setPhotos] = useState<Photo[]>([
    {
      id: 'planner',
      uri: require('../assets/planner.png'),
      name: 'planner.png',
    },
    {
      id: 'apple',
      uri: require('../assets/apple.jpg'),
      name: 'apple.jpg',
    },
  ]);

  const addPhoto = (photo: Photo) => {
    setPhotos((prev) => [photo, ...prev]);
  };

  const updatePhoto = (updatedPhoto: Photo) => {
    setPhotos((prev) =>
      prev.map((photo) => (photo.id === updatedPhoto.id ? updatedPhoto : photo))
    );
  };

  return (
    <PhotoContext.Provider value={{ photos, addPhoto, updatePhoto }}>
      {children}
    </PhotoContext.Provider>
  );
};

export const usePhotoContext = () => {
  const context = useContext(PhotoContext);
  if (!context) {
    throw new Error('usePhotoContext must be used within a PhotoProvider');
  }
  return context;
};
