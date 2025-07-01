import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";

// Haii! I am telling about one sabji ko detail, like when I keep my toys in box and write what is inside!
interface Product {
  id: number;
  productName: string;
  price: number;
  sellerName: string;
  distance: string;
  image: string;
  description: string;
  sellerId: number;
  sellerAddress: string;
}

// This is for keeping track of our favorite sellers, like my favorite toys list!
interface FavoriteSeller {
  id: number;
  name: string;
  address: string;
}

// Interface for buyer demands that sellers can see
interface Demand {
  id: number;
  productName: string;
  quantity: string;
  buyerName: string;
  buyerId: number;
  buyerAddress: string;
  distance: string;
  description: string;
  image: string;
  postedDate: string;
}

// These all are fake sabji ko data, like when I make pretend khana for my dolls to eat!
const mockProducts: Product[] = [
  {
    id: 101,
    productName: "Fresh Tomatoes",
    price: 28,
    sellerName: "Green Valley Farm",
    distance: "2.3 km",
    image: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80",
    description: "Locally grown, juicy and organic tomatoes. Perfect for salads and cooking!",
    sellerId: 1,
    sellerAddress: "12 Riverside, Kathmandu"
  },
  {
    id: 102,
    productName: "Organic Potatoes",
    price: 22,
    sellerName: "Mountain Roots",
    distance: "3.1 km",
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    description: "Freshly harvested organic potatoes, chemical-free.",
    sellerId: 2,
    sellerAddress: "34 Hilltop, Pokhara"
  },
  {
    id: 103,
    productName: "Basmati Rice",
    price: 50,
    sellerName: "RiceLand",
    distance: "4.5 km",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
    description: "Premium quality basmati rice, aromatic and long grain.",
    sellerId: 3,
    sellerAddress: "78 Lake View, Chitwan"
  },
  {
    id: 104,
    productName: "Fresh Spinach",
    price: 18,
    sellerName: "Leafy Greens",
    distance: "1.2 km",
    image: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=400&q=80",
    description: "Crisp and healthy spinach, perfect for salads and cooking.",
    sellerId: 4,
    sellerAddress: "56 Green Road, Lalitpur"
  }
];

// Mock data for buyer demands that sellers will see
const mockDemands: Demand[] = [
  {
    id: 1,
    productName: "Organic Potatoes",
    quantity: "10 kg",
    buyerName: "Aarav Sharma",
    buyerId: 201,
    buyerAddress: "123 Mountain View, Kathmandu",
    distance: "3.1 km",
    description: "Looking for fresh organic potatoes for restaurant use",
    image: "https://via.placeholder.com/300x200/22c55e/ffffff?text=Potatoes",
    postedDate: "2025-06-28"
  },
  {
    id: 2,
    productName: "Fresh Tomatoes",
    quantity: "5 kg",
    buyerName: "Priya Gurung",
    buyerId: 202,
    buyerAddress: "45 Valley Road, Pokhara",
    distance: "1.8 km",
    description: "Need fresh tomatoes for weekly use, prefer locally grown",
    image: "https://via.placeholder.com/300x200/22c55e/ffffff?text=Tomatoes",
    postedDate: "2025-06-29"
  },
  {
    id: 3,
    productName: "Basmati Rice",
    quantity: "25 kg",
    buyerName: "Rajan Thapa",
    buyerId: 203,
    buyerAddress: "78 Lake View, Chitwan",
    distance: "4.5 km",
    description: "Looking for premium quality basmati rice for restaurant",
    image: "https://via.placeholder.com/300x200/22c55e/ffffff?text=Rice",
    postedDate: "2025-06-30"
  }
];

export default function HomePage() {
  const router = useRouter();
  // Check user type from AsyncStorage
  const [userType, setUserType] = useState<'buyer' | 'seller'>('buyer'); // Default to buyer
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [demands, setDemands] = useState<Demand[]>(mockDemands);
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewBuyerModalVisible, setViewBuyerModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedDemand, setSelectedDemand] = useState<Demand | null>(null);
  const [favorites, setFavorites] = useState<FavoriteSeller[]>([]);
  const [favoriteBuyers, setFavoriteBuyers] = useState<{ id: number, name: string, address: string }[]>([]);

  // Image picker states
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [classificationResult, setClassificationResult] = useState<string | null>(null);
  const [suggestedPrice, setSuggestedPrice] = useState<string | null>(null);

  // Product information states
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  // Load user type and favorites when the component mounts
  useEffect(() => {
    loadUserType();
    loadFavorites();
  }, []);

  // Load user type from AsyncStorage
  const loadUserType = async () => {
    try {
      const storedUserType = await AsyncStorage.getItem('userType');
      if (storedUserType) {
        setUserType(storedUserType as 'buyer' | 'seller');
      }
    } catch (error) {
      console.error('Error loading user type:', error);
    }
  };

  // Load favorites from AsyncStorage
  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }

      // Load favorite buyers if user is a seller
      const storedFavoriteBuyers = await AsyncStorage.getItem('favoriteBuyers');
      if (storedFavoriteBuyers) {
        setFavoriteBuyers(JSON.parse(storedFavoriteBuyers));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  // Save favorites to AsyncStorage
  const saveFavorites = async (newFavorites: FavoriteSeller[]) => {
    try {
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  // Save favorite buyers to AsyncStorage
  const saveFavoriteBuyers = async (newFavorites: { id: number, name: string, address: string }[]) => {
    try {
      await AsyncStorage.setItem('favoriteBuyers', JSON.stringify(newFavorites));
      setFavoriteBuyers(newFavorites);
    } catch (error) {
      console.error('Error saving favorite buyers:', error);
    }
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setViewModalVisible(true);
    // Yo popup ma sabji ko sabai details dekhaucha, jastai mero school diary ma sabai kura lekheko huncha!
  };

  const handleViewDemand = (demand: Demand) => {
    setSelectedDemand(demand);
    setViewBuyerModalVisible(true);
    // Yo popup ma buyer ko sabai details dekhaucha!
  };

  const handleOrderProduct = (product: Product) => {
    // Set selected product and show modal
    setSelectedProduct(product);
    setOrderModalVisible(true);
    // Ye modal dekhaucha, jastai mummy le sodhchin "sure ho sabji kinne?" 
  };

  // Add a seller to favorites
  const addToFavorites = (product: Product) => {
    const newFavorite = {
      id: product.sellerId,
      name: product.sellerName,
      address: product.sellerAddress
    };

    // Check if already in favorites
    const alreadyFavorite = favorites.some(fav => fav.id === newFavorite.id);

    if (!alreadyFavorite) {
      const newFavorites = [...favorites, newFavorite];
      saveFavorites(newFavorites);
      Alert.alert("Added to Favorites", `${product.sellerName} has been added to your favorites!`);
      setViewModalVisible(false);
    } else {
      Alert.alert("Already in Favorites", `${product.sellerName} is already in your favorites!`);
    }
  };

  // Add a buyer to favorites (for sellers)
  const addBuyerToFavorites = (demand: Demand) => {
    const newFavorite = {
      id: demand.buyerId,
      name: demand.buyerName,
      address: demand.buyerAddress
    };

    // Check if already in favorites
    const alreadyFavorite = favoriteBuyers.some(fav => fav.id === newFavorite.id);

    if (!alreadyFavorite) {
      const newFavorites = [...favoriteBuyers, newFavorite];
      saveFavoriteBuyers(newFavorites);
      Alert.alert("Added to Favorites", `${demand.buyerName} has been added to your favorites!`);
      setViewBuyerModalVisible(false);
    } else {
      Alert.alert("Already in Favorites", `${demand.buyerName} is already in your favorites!`);
    }
  };

  const confirmOrder = async () => {
    if (selectedProduct) {
      try {
        // Create a new order object
        const newOrder = {
          id: Math.floor(Math.random() * 10000) + 1000, // Generate a random ID
          productName: selectedProduct.productName,
          price: selectedProduct.price,
          sellerName: selectedProduct.sellerName,
          image: selectedProduct.image,
          orderDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
          status: 'pending' as const
        };

        // Get existing orders
        const existingOrdersString = await AsyncStorage.getItem('orders');
        const existingOrders = existingOrdersString ? JSON.parse(existingOrdersString) : [];

        // Add new order to the list
        const updatedOrders = [newOrder, ...existingOrders];

        // Save updated orders back to AsyncStorage
        await AsyncStorage.setItem('orders', JSON.stringify(updatedOrders));

        console.log(`Order confirmed for ${selectedProduct.productName}`);

        // Close the modal
        setOrderModalVisible(false);

        // Navigate to history tab to see the placed order
        router.push("/(tabs)/history");
        // Mero kineko sabji dekhauna lai history page ma janchu!
      } catch (error) {
        console.error('Error saving order:', error);
        Alert.alert("Error", "Failed to place order. Please try again.");
      }
    }
  };

  const handleCreateDemand = () => {
    router.push("/(tabs)/demand");
  };

  const handlePostProduct = () => {
    router.push("/(tabs)/post-product");
  };

  // PICKER FUNCTIONS

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
      setImage(result.assets[0].uri);
      // Process the image with PyTorch
      await processImageWithPyTorch(result.assets[0].uri);
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
      setImage(result.assets[0].uri);
      // Process the image with PyTorch
      await processImageWithPyTorch(result.assets[0].uri);
    }
  };

  // Process image with PyTorch AI model
  const processImageWithPyTorch = async (imageUri: string) => {
    setIsLoading(true);

    try {
      // Simulating AI processing since we can't actually run PyTorch here
      // In a real app, this would send the image to a server or process locally with PyTorch
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time

      // Mockup AI classification results
      const classifications = [
        'Tomato', 'Potato', 'Rice', 'Onion', 'Garlic', 'Spinach'
      ];
      const randomIndex = Math.floor(Math.random() * classifications.length);
      const result = classifications[randomIndex];

      // Set the classification result
      setClassificationResult(result);

      // Auto-fill the product name with the classification
      setProductName(result);

      // Generate a suggested price based on the classification
      const priceSuggestions: { [key: string]: string } = {
        'Tomato': '25-30',
        'Potato': '20-25',
        'Rice': '45-55',
        'Onion': '15-20',
        'Garlic': '40-45',
        'Spinach': '15-20'
      };

      setSuggestedPrice(priceSuggestions[result] || '20-30');

    } catch (error) {
      console.error('Error processing image:', error);
      Alert.alert('Error', 'Failed to process image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit the new product
  const handleSubmit = async () => {
    if (!productName || !description || !price || !quantity || !image) {
      Alert.alert('Missing Information', 'Please fill all fields and upload an image');
      return;
    }

    setIsLoading(true);

    try {
      // Create the new product object
      const newProduct = {
        id: Math.floor(Math.random() * 10000) + 1000,
        productName,
        description,
        price: parseFloat(price),
        quantity,
        image,
        sellerName: 'Your Farm Name', // This would come from user profile
        sellerId: 123, // This would come from user authentication
        sellerAddress: 'Your Address', // This would come from user profile
        distance: 'Local',
        postedDate: new Date().toISOString().split('T')[0]
      };

      // Get existing products
      const existingProductsString = await AsyncStorage.getItem('myProducts');
      const existingProducts = existingProductsString ? JSON.parse(existingProductsString) : [];

      // Add new product to the list
      const updatedProducts = [newProduct, ...existingProducts];

      // Save updated products back to AsyncStorage
      await AsyncStorage.setItem('myProducts', JSON.stringify(updatedProducts));

      Alert.alert(
        'Success!',
        'Your product has been posted',
        [{ text: 'OK', onPress: () => router.push('/(tabs)/home') }]
      );

    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert('Error', 'Failed to post product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit a new demand (for buyers)
  const handleSubmitDemand = async (demandData: {
    productName: string;
    quantity: string;
    description: string;
    image: string;
    buyerName: string;
    buyerId: number;
    buyerAddress: string;
    distance: string;
    postedDate: string;
  }) => {
    try {
      // Replace with your backend endpoint
      const response = await fetch('http://agrilink.tech/api/demands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(demandData),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Demand post error:', response.status, errorText);
        throw new Error('Failed to post demand');
      }
      // Optionally, refresh local demand list or show success
      Alert.alert('Success', 'Your demand has been posted!');
      // You may want to navigate or update state here
    } catch (error) {
      console.error('Error posting demand:', error);
      Alert.alert('Error', 'Could not post your demand.');
    }
  };

  // BUYER INTERFACE COMPONENTS

  const ProductCard = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <View style={styles.sellerInfo}>
        <View style={styles.sellerAvatar}>
          <Text style={styles.sellerInitial}>{item.sellerName.charAt(0)}</Text>
        </View>
        <View style={styles.sellerDetails}>
          <Text style={styles.sellerName}>{item.sellerName}</Text>
          <Text style={styles.distance}>📍 {item.distance} away</Text>
        </View>
      </View>

      <Text style={styles.productName}>{item.productName}</Text>
      <Text style={styles.productDescription}>{item.description}</Text>

      <Image source={{ uri: item.image }} style={styles.productImage} />

      <View style={styles.productFooter}>
        <Text style={styles.price}>₹{item.price}</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => handleViewProduct(item)}
          >
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.orderButton}
            onPress={() => handleOrderProduct(item)}
          >
            <Text style={styles.orderButtonText}>Order</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // SELLER INTERFACE COMPONENTS

  const DemandCard = ({ item }: { item: Demand }) => (
    <View style={styles.productCard}>
      <View style={styles.sellerInfo}>
        <View style={styles.sellerAvatar}>
          <Text style={styles.sellerInitial}>{item.buyerName.charAt(0)}</Text>
        </View>
        <View style={styles.sellerDetails}>
          <Text style={styles.sellerName}>{item.buyerName}</Text>
          <Text style={styles.distance}>📍 {item.distance} away</Text>
        </View>
      </View>

      <Text style={styles.productName}>{item.productName}</Text>
      <Text style={styles.productQuantity}>Quantity: {item.quantity}</Text>
      <Text style={styles.productDescription}>{item.description}</Text>

      {item.image && <Image source={{ uri: item.image }} style={styles.productImage} />}

      <View style={styles.productFooter}>
        <Text style={styles.date}>Posted: {item.postedDate}</Text>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => handleViewDemand(item)}
        >
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // RENDER BASED ON USER TYPE
  return (
    <SafeAreaView style={styles.container}>
      {/* Yaha mathi app ko naam cha, jastai mero naam tag lagaunu parcha school ma! */}
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

      {/* Content based on user type */}
      {userType === 'buyer' ? (
        // BUYER VIEW
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Quick Actions for Buyers */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.quickActionsTitle}>Quick Actions</Text>
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/demand')}
              >
                <Text style={styles.actionButtonIcon}>📝</Text>
                <Text style={styles.actionButtonText}>Post Demand</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/my-demands')}
              >
                <Text style={styles.actionButtonIcon}>📋</Text>
                <Text style={styles.actionButtonText}>My Demands</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.feedContainer}>
            <Text style={styles.feedTitle}>Fresh Products Near You</Text>
            {/* Yaha sabai sabji ko list cha, jastai ama ko market list! */}
            <FlatList
              data={products}
              renderItem={({ item }) => <ProductCard item={item} />}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </ScrollView>
      ) : (
        // SELLER VIEW
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Quick Actions for Sellers */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.quickActionsTitle}>Quick Actions</Text>
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/view-demands')}
              >
                <Text style={styles.actionButtonIcon}>👀</Text>
                <Text style={styles.actionButtonText}>View Demands</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/post-product')}
              >
                <Text style={styles.actionButtonIcon}>📦</Text>
                <Text style={styles.actionButtonText}>Post Product</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/my-products')}
              >
                <Text style={styles.actionButtonIcon}>📋</Text>
                <Text style={styles.actionButtonText}>My Products</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/history1')}
              >
                <Text style={styles.actionButtonIcon}>📊</Text>
                <Text style={styles.actionButtonText}>Orders</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.feedContainer}>
            <Text style={styles.feedTitle}>Buyer Demands Near You</Text>
            {/* Yaha sabai buyers ko demand cha, jastai customers ko order list! */}
            <FlatList
              data={demands}
              renderItem={({ item }) => <DemandCard item={item} />}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </ScrollView>
      )}

      {/* Order Confirmation Modal for Buyers */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={orderModalVisible}
        onRequestClose={() => setOrderModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setOrderModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Confirm Order</Text>

            {selectedProduct && (
              <View style={styles.modalContent}>
                <Image
                  source={{ uri: selectedProduct.image }}
                  style={styles.modalImage}
                />
                <Text style={styles.modalProductName}>{selectedProduct.productName}</Text>
                <Text style={styles.modalPrice}>₹{selectedProduct.price}</Text>
                <Text style={styles.modalSellerName}>From: {selectedProduct.sellerName}</Text>
              </View>
            )}

            <Text style={styles.confirmText}>Are you sure you want to place this order?</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonNo]}
                onPress={() => setOrderModalVisible(false)}
              >
                <Text style={styles.buttonNoText}>No</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.buttonYes]}
                onPress={confirmOrder}
              >
                <Text style={styles.buttonYesText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Seller Details Modal for Buyers */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={viewModalVisible}
        onRequestClose={() => setViewModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setViewModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Seller Details</Text>

            {selectedProduct && (
              <View style={styles.modalContent}>
                <View style={[styles.sellerAvatar, styles.largeAvatar]}>
                  <Text style={styles.largeSellerInitial}>{selectedProduct.sellerName.charAt(0)}</Text>
                </View>
                <Text style={styles.modalSellerName}>{selectedProduct.sellerName}</Text>
                <Text style={styles.modalSellerAddress}>📍 {selectedProduct.sellerAddress}</Text>
                <Text style={styles.modalDistance}>Distance: {selectedProduct.distance}</Text>

                <TouchableOpacity
                  style={styles.addToFavoritesButton}
                  onPress={() => addToFavorites(selectedProduct)}
                >
                  <Text style={styles.addToFavoritesText}>Add to Favorites</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Buyer Details Modal for Sellers */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={viewBuyerModalVisible}
        onRequestClose={() => setViewBuyerModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setViewBuyerModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Buyer Details</Text>

            {selectedDemand && (
              <View style={styles.modalContent}>
                <View style={[styles.sellerAvatar, styles.largeAvatar]}>
                  <Text style={styles.largeSellerInitial}>{selectedDemand.buyerName.charAt(0)}</Text>
                </View>
                <Text style={styles.modalSellerName}>{selectedDemand.buyerName}</Text>
                <Text style={styles.modalSellerAddress}>📍 {selectedDemand.buyerAddress}</Text>
                <Text style={styles.modalDistance}>Distance: {selectedDemand.distance}</Text>
                <Text style={styles.demandDetail}>Product: {selectedDemand.productName}</Text>
                <Text style={styles.demandDetail}>Quantity: {selectedDemand.quantity}</Text>
                <Text style={styles.demandDetailLast}>Posted: {selectedDemand.postedDate}</Text>

                <TouchableOpacity
                  style={styles.addToFavoritesButton}
                  onPress={() => addBuyerToFavorites(selectedDemand)}
                >
                  <Text style={styles.addToFavoritesText}>Add to Favorites</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Floating Action Button for creating demand (buyer) or posting product (seller) */}
      <TouchableOpacity
        style={styles.fabButton}
        onPress={userType === 'buyer' ? handleCreateDemand : handlePostProduct}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
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
    justifyContent: "center", // This centers the logo and app name
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
  feedContainer: {
    paddingTop: 20,
  },
  feedTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 15,
  },
  productCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sellerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sellerAvatar: {
    width: 40,
    height: 40,
    backgroundColor: "#22c55e",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  sellerInitial: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  distance: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 5,
  },
  productQuantity: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4b5563",
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 10,
    lineHeight: 20,
  },
  productImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#22c55e",
  },
  date: {
    fontSize: 14,
    color: "#6b7280",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
  },
  viewButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#22c55e",
    backgroundColor: "transparent",
  },
  viewButtonText: {
    color: "#22c55e",
    fontSize: 14,
    fontWeight: "600",
  },
  orderButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#22c55e",
  },
  orderButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  sellerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#22c55e",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#6b7280",
    textAlign: "center",
  },
  // Modal styles - Yo popup ko style cha, jastai mero drawing ko color!
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 15,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 20,
    color: "#6b7280",
    fontWeight: "bold",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#22c55e",
    marginBottom: 20,
    marginTop: 10,
  },
  modalContent: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  modalImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 15,
  },
  modalProductName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 5,
    textAlign: "center",
  },
  modalPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#22c55e",
    marginBottom: 5,
  },
  modalSellerName: {
    fontSize: 14,
    color: "#6b7280",
  },
  confirmText: {
    fontSize: 16,
    color: "#4b5563",
    marginBottom: 25,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 25,
    elevation: 2,
    minWidth: "40%",
    alignItems: "center",
  },
  buttonYes: {
    backgroundColor: "#22c55e",
  },
  buttonNo: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  buttonYesText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonNoText: {
    color: "#6b7280",
    fontWeight: "bold",
    fontSize: 16,
  },
  largeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
  },
  largeSellerInitial: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "bold",
  },
  modalSellerAddress: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 5,
    textAlign: "center",
  },
  modalDistance: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 20,
    textAlign: "center",
  },
  demandDetail: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 5,
    textAlign: "center",
  },
  demandDetailLast: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 20,
    textAlign: "center",
  },
  addToFavoritesButton: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  addToFavoritesText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  fabButton: {
    position: 'absolute',
    bottom: 100, // Above the tab bar
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 1000,
  },
  fabIcon: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  quickActionsContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionButtonIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
});
