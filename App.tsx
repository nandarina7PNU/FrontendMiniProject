/**
 * Frontend Mini Project
 * React Native Navigation 구조
 * @format
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  MainScreen,
  GalleryScreen,
  CreativeScreen,
  MapScreen,
} from './src/screens';
import { PhotoProvider } from './src/context/PhotoContext';

export type RootStackParamList = {
  MainTab: undefined;
  Main: undefined;
  Gallery: undefined;
  Creative: undefined;
  Map: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const navTheme = isDarkMode ? DarkTheme : DefaultTheme;

  return (
    <PhotoProvider>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <NavigationContainer theme={navTheme}>
          <Stack.Navigator
            screenOptions={{
              headerShown: true,
              headerTitleAlign: 'center',
            }}
          >
            <Stack.Screen
              name="Main"
              component={MainScreen}
              options={{ title: '메인' }}
            />
            <Stack.Screen
              name="Gallery"
              component={GalleryScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Creative"
              component={CreativeScreen}
              options={{ title: 'Creative' }}
            />
            <Stack.Screen
              name="Map"
              component={MapScreen}
              options={{ title: 'Map' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </PhotoProvider>
  );
}

export default App;
