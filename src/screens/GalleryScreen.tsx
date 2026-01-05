import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  GalleryListScreen,
  PhotoDetailScreen,
  PhotoEditorScreen,
} from './Gallery';

type GalleryStackParamList = {
  GalleryList: undefined;
  PhotoDetail: { photo: any };
  PhotoEditor: { photo: any };
};

const Stack = createNativeStackNavigator<GalleryStackParamList>();

export const GalleryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name="GalleryList"
        component={GalleryListScreen}
        options={{ title: '갤러리' }}
      />
      <Stack.Screen
        name="PhotoDetail"
        component={PhotoDetailScreen}
        options={{ title: '사진 상세' }}
      />
      <Stack.Screen
        name="PhotoEditor"
        component={PhotoEditorScreen}
        options={{ title: '편집' }}
      />
    </Stack.Navigator>
  );
};

