import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Modal
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { postingAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function PostProductPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Form fields matching backend schema
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState<string[]>([]);

  // UI state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [classificationResult, setClassificationResult] = useState<string | null>(null);
  const [suggestedPrice, setSuggestedPrice] = useState<string | null>(null);

  const categories = ['Fruits', 'Vegetables', 'Grains', 'Dairy', 'Meat', 'Other'];

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert(
        'Authentication Required',
        'Please login to post a product.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/login'),
          },
        ]
      );
      return;
    }

    if (user?.userType !== 'seller') {
      Alert.alert(
        'Access Denied',
        'Only sellers can post products.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
      return;
    }
  }, [isAuthenticated, user]);

  // Pick an image from library
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to upload a photo');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      setImages([imageUri]);
      await processImageWithPyTorch(imageUri);
    }
  };

  // Take a photo
  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Please grant camera permissions to take a photo');
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      setImages([imageUri]);
      await processImageWithPyTorch(imageUri);
    }
  };

  // Process image with real Fruit Freshness AI API
  const processImageWithPyTorch = async (imageUri: string) => {
    setIsLoading(true);
    try {
      // Convert image to base64
      const base64Image = await convertImageToBase64(imageUri);
      
      // Call the real AI API
      const response = await fetch('http://api.agrilink.tech/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_base64: base64Image
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const apiResult = await response.json();
      const { result, confidence } = apiResult;
      
      // Process the API result
      const freshnessStatus = result === 'fresh' ? 'Fresh' : 'Rotten';
      const confidencePercentage = Math.round(confidence * 100);
      
      // Set classification result based on freshness
      const classificationText = `${freshnessStatus} Fruit/Vegetable (${confidencePercentage}% confidence)`;
      setClassificationResult(classificationText);
      
      // Only suggest posting if the produce is fresh
      if (result === 'fresh') {
        setTitle('Fresh Produce');
        setCategory('Fruits'); // Default to fruits, user can change
        setSuggestedPrice('25-35'); // Default price range
      } else {
        // If rotten, show warning and don't auto-fill
        Alert.alert(
          'Quality Warning',
          `The AI detected this produce as ${result} with ${confidencePercentage}% confidence. Consider using fresher produce for better sales.`,
          [{ text: 'OK' }]
        );
        setTitle('');
        setCategory('');
        setSuggestedPrice(null);
      }
      
    } catch (error) {
      console.error('Error processing image with AI:', error);
      Alert.alert(
        'AI Processing Error', 
        'Failed to analyze image quality. You can still post manually.',
        [{ text: 'OK' }]
      );
      // Set default values on error
      setClassificationResult('AI Analysis Failed');
      setTitle('');
      setCategory('');
      setSuggestedPrice(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert image URI to base64 string
  const convertImageToBase64 = async (imageUri: string): Promise<string> => {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          // Remove the data:image/...;base64, prefix
          const base64Data = base64String.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      throw new Error('Failed to convert image to base64');
    }
  };

  const handleCategorySelect = (selectedCategory: string) => {
    setCategory(selectedCategory);
    setShowCategoryModal(false);
  };

  // Submit the new product
  const handleSubmit = async () => {
    // Validate required fields (backend schema)
    if (!title || !description || !price || !category) {
      Alert.alert('Missing Information', 'Please fill all required fields');
      return;
    }

    // Validate price
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price');
      return;
    }

    setIsLoading(true);
    try {
      const postingData = {
        title: title.trim(),
        description: description.trim(),
        price: priceNum,
        category: category,
        images: images
      };

      const response = await postingAPI.createPosting(postingData);

      Alert.alert(
        'Success!',
        'Your product has been posted successfully',
        [{
          text: 'OK',
          onPress: () => {
            // Reset form
            setTitle('');
            setDescription('');
            setPrice('');
            setCategory('');
            setImages([]);
            setClassificationResult(null);
            setSuggestedPrice(null);
            router.push('/(tabs)/home1');
          }
        }]
      );
    } catch (error) {
      console.error('Error posting product:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to post product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>AgroLink</Text>
        </View>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Post New Product</Text>
          <View style={styles.imageSection}>
            <Text style={styles.sectionLabel}>Product Image</Text>
            <View style={styles.imageButtons}>
              <TouchableOpacity
                style={styles.imageButton}
                onPress={takePhoto}
                disabled={isLoading}
              >
                <Text style={styles.imageButtonText}>📷 Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.imageButton}
                onPress={pickImage}
                disabled={isLoading}
              >
                <Text style={styles.imageButtonText}>🖼️ Choose Photo</Text>
              </TouchableOpacity>
            </View>
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#22c55e" />
                <Text style={styles.loadingText}>Analyzing freshness with AI...</Text>
              </View>
            )}
            {images.length > 0 && (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: images[0] }} style={styles.imagePreview} />
                {classificationResult && (
                  <View style={styles.aiResultContainer}>
                    <Text style={styles.aiResultTitle}>AI Freshness Analysis:</Text>
                    <Text style={styles.aiResultText}>{classificationResult}</Text>
                    {suggestedPrice && (
                      <Text style={styles.aiSuggestedPrice}>
                        Suggested Price Range: ₹{suggestedPrice} per kg
                      </Text>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>
          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>Product Information</Text>

            {/* Product Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Product Title</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Fresh Organic Tomatoes"
                placeholderTextColor="#888"
              />
            </View>

            {/* Category Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category *</Text>
              <TouchableOpacity
                style={[styles.input, styles.dropdown]}
                onPress={() => setShowCategoryModal(true)}
              >
                <Text style={[styles.dropdownText, !category && styles.placeholderText]}>
                  {category || 'Select category'}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe your product, quality, freshness, etc..."
                placeholderTextColor="#888"
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Price */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Price (₹ per kg)</Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                placeholder="e.g. 25.00"
                placeholderTextColor="#888"
                keyboardType="numeric"
              />
            </View>
          </View>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Posting...' : 'Post Product'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Category Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCategoryModal}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={styles.modalOption}
                onPress={() => handleCategorySelect(cat)}
              >
                <Text style={styles.modalOptionText}>{cat}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowCategoryModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#ffffff",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 10,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#22c55e",
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  formContainer: {
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 20,
    textAlign: "center",
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  imageSection: {
    marginBottom: 20,
  },
  imageButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  imageButton: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  imageButtonText: {
    color: "#4b5563",
    fontSize: 16,
    fontWeight: "500",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#4b5563",
  },
  imagePreviewContainer: {
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 15,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  aiResultContainer: {
    backgroundColor: "#f0fdf4",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#86efac",
  },
  aiResultTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#15803d",
    marginBottom: 5,
  },
  aiResultText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#22c55e",
    marginBottom: 5,
  },
  aiSuggestedPrice: {
    fontSize: 14,
    color: "#4b5563",
    marginTop: 5,
  },
  formSection: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4b5563",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    fontSize: 16,
    color: "#1f2937",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  rowInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  submitButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 16,
    color: '#1f2937',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#6b7280',
  },
  placeholderText: {
    color: '#9ca3af',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#1f2937',
    textAlign: 'center',
  },
  modalCancelButton: {
    marginTop: 15,
    paddingVertical: 12,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    fontWeight: '600',
  },
});
