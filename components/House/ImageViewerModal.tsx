import React, { useState } from "react";
import { ActivityIndicator, Image, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { COLORS } from "./styles";

interface ImageViewerModalProps {
  visible: boolean;
  imageLoading: boolean;
  selectedImage: string | null;
  onClose: () => void;
}

export const ImageViewerModal = ({
  visible,
  imageLoading: initialLoading,
  selectedImage,
  onClose
}: ImageViewerModalProps) => {
  const [isImageLoading, setIsImageLoading] = useState(initialLoading);
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.imageViewerContainer}>
          <View style={styles.imageViewerHeader}>
            <TouchableOpacity 
              style={styles.imageViewerCloseButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.imageViewerCloseText}>×</Text>
            </TouchableOpacity>
          </View>
          
          {selectedImage && (
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.imageViewerContent}>
                <Image 
                  source={{ uri: selectedImage }} 
                  style={styles.imageViewerImage}
                  resizeMode="contain"
                  onLoadStart={() => setIsImageLoading(true)}
                  onLoadEnd={() => setIsImageLoading(false)}
                />
                {isImageLoading && (
                  <View style={styles.fullscreenLoaderContainer}>
                    <ActivityIndicator 
                      style={styles.fullscreenImageLoader} 
                      size="large" 
                      color={COLORS.WHITE} 
                    />
                    <Text style={styles.loadingText}>Loading image...</Text>
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          )}
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  imageViewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imageViewerHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  imageViewerCloseButton: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  imageViewerCloseText: {
    color: COLORS.PRIMARY,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 24,
  },
  imageViewerContent: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  imageViewerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  fullscreenLoaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  fullscreenImageLoader: {
    marginBottom: 8,
  },
  loadingText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});
