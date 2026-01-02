import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const GalleryScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gallery Screen</Text>
      <Text style={styles.description}>갤러리 기능이 들어갈 예정입니다</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
});
