import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as ExpoImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import theme from '../../constants/theme';

// Max allowed image size before compression kicks in (2 MB)
const MAX_SIZE_BYTES = 2 * 1024 * 1024;
// Target dimension for compression
const MAX_DIMENSION = 1024;

/**
 * Compress image if it exceeds the max size threshold.
 * Returns the (possibly new) URI and final file size.
 */
const compressIfNeeded = async (uri, fileSize) => {
  if (fileSize && fileSize <= MAX_SIZE_BYTES) {
    return { uri, compressed: false };
  }
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: MAX_DIMENSION } }],
    { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG }
  );
  return { uri: result.uri, compressed: true };
};

/**
 * ImagePickerWidget
 *
 * Props:
 *  onImageSelected(imageAsset) — called with { uri, width, height, fileSize, fileName }
 *  image — currently selected image asset (or null)
 *  disabled — disable interactions while parent is loading
 */
const ImagePickerWidget = ({ onImageSelected, image, disabled = false }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const requestPermission = async (type) => {
    if (Platform.OS === 'web') return true;

    const permFn =
      type === 'camera'
        ? ExpoImagePicker.requestCameraPermissionsAsync
        : ExpoImagePicker.requestMediaLibraryPermissionsAsync;

    const { status } = await permFn();

    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        `Please allow ${type === 'camera' ? 'Camera' : 'Gallery'} access in your device Settings to use this feature.`,
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const processAndReturn = async (asset) => {
    setIsProcessing(true);
    try {
      const { uri, compressed } = await compressIfNeeded(asset.uri, asset.fileSize);
      if (compressed) {
        Alert.alert(
          'Image Optimised',
          'Your image was compressed for faster analysis.',
          [{ text: 'OK' }]
        );
      }
      onImageSelected({ ...asset, uri });
    } catch {
      Alert.alert('Processing Error', 'Failed to process the image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const pickFromCamera = async () => {
    const granted = await requestPermission('camera');
    if (!granted) return;

    const result = await ExpoImagePicker.launchCameraAsync({
      mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets?.[0]) {
      await processAndReturn(result.assets[0]);
    }
  };

  const pickFromGallery = async () => {
    const granted = await requestPermission('gallery');
    if (!granted) return;

    const result = await ExpoImagePicker.launchImageLibraryAsync({
      mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets?.[0]) {
      await processAndReturn(result.assets[0]);
    }
  };

  const showOptions = () => {
    Alert.alert(
      'Select Image Source',
      'Choose how you want to add the crop photo.',
      [
        { text: 'Take Photo',       onPress: pickFromCamera  },
        { text: 'Choose from Gallery', onPress: pickFromGallery },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // ── Render: empty state ────────────────────────────────────────────────────
  if (!image) {
    return (
      <TouchableOpacity
        style={[styles.emptyBox, disabled && styles.disabledBox]}
        onPress={showOptions}
        disabled={disabled || isProcessing}
        activeOpacity={0.7}
      >
        {isProcessing ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <>
            <View style={styles.emptyIconRing}>
              <Ionicons name="camera" size={36} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Add Crop Photo</Text>
            <Text style={styles.emptySubtitle}>Take a photo or choose from gallery</Text>
            <View style={styles.emptyBadgeRow}>
              <View style={styles.badge}>
                <Ionicons name="camera-outline" size={12} color={colors.primary} />
                <Text style={styles.badgeText}>Camera</Text>
              </View>
              <View style={styles.badge}>
                <Ionicons name="images-outline" size={12} color={colors.primary} />
                <Text style={styles.badgeText}>Gallery</Text>
              </View>
            </View>
          </>
        )}
      </TouchableOpacity>
    );
  }

  // ── Render: image preview ──────────────────────────────────────────────────
  return (
    <View style={styles.previewContainer}>
      <Image source={{ uri: image.uri }} style={styles.previewImage} resizeMode="cover" />

      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.processingText}>Optimising image…</Text>
        </View>
      )}

      {/* Action strip */}
      <View style={styles.previewActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={showOptions} disabled={disabled || isProcessing}>
          <Ionicons name="refresh-outline" size={16} color={colors.white} />
          <Text style={styles.actionBtnText}>Retake</Text>
        </TouchableOpacity>

        {image.fileSize && (
          <View style={styles.sizeChip}>
            <Ionicons name="document-outline" size={12} color={colors.textMuted} />
            <Text style={styles.sizeChipText}>
              {(image.fileSize / 1024).toFixed(0)} KB
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Empty state
  emptyBox: {
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.xl,
    paddingVertical: theme.spacing.xxl,
    alignItems: 'center',
    backgroundColor: colors.offWhite,
    gap: 8,
  },
  disabledBox: { opacity: 0.5 },
  emptyIconRing: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: colors.background,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: colors.primaryLighter,
    marginBottom: theme.spacing.xs,
  },
  emptyTitle: { fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.semiBold, color: colors.textDark },
  emptySubtitle: { fontSize: theme.typography.fontSize.sm, color: colors.textMuted },
  emptyBadgeRow: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.sm },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.background,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: theme.borderRadius.round,
    borderWidth: 1, borderColor: colors.border,
  },
  badgeText: { fontSize: theme.typography.fontSize.xs, color: colors.primary, fontWeight: theme.typography.fontWeight.medium },

  // Preview state
  previewContainer: { borderRadius: theme.borderRadius.xl, overflow: 'hidden', ...theme.shadows.md },
  previewImage: { width: '100%', height: 240 },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  processingText: { color: colors.white, fontSize: theme.typography.fontSize.sm },
  previewActions: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    position: 'absolute', bottom: 0, left: 0, right: 0,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionBtnText: { color: colors.white, fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium },
  sizeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: theme.borderRadius.round,
  },
  sizeChipText: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
});

export default ImagePickerWidget;