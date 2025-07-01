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
  Modal
} from "react-native";
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

// These all are fake sabji ko data, like when I make pretend khana for my dolls to eat!
const mockProducts: Product[] = [
  {
    id: 1,
    productName: "Fresh Organic Tomatoes",
    price: 25.99,
    sellerName: "Green Valley Farm",
    distance: "2.3 km",
    image: "https://via.placeholder.com/300x200/22c55e/ffffff?text=Tomatoes",
    description: "Fresh organic tomatoes grown without pesticides",
    sellerId: 101,
    sellerAddress: "123 Valley Road, Green District"
  },
  {
    id: 2,
    productName: "Premium Rice Grain",
    price: 45.50,
    sellerName: "Golden Harvest Co.",
    distance: "5.1 km",
    image: "https://via.placeholder.com/300x200/22c55e/ffffff?text=Rice",
    description: "High quality basmati rice, freshly harvested",
    sellerId: 102,
    sellerAddress: "45 Harvest Lane, Golden Hills"
  },
  {
    id: 3,
    productName: "Free Range Eggs",
    price: 18.00,
    sellerName: "Happy Hen Farm",
    distance: "1.8 km",
    image: "https://via.placeholder.com/300x200/22c55e/ffffff?text=Eggs",
    description: "Farm fresh eggs from free-range chickens",
    sellerId: 103,
    sellerAddress: "78 Hen Street, Happy Village"
  },
  {
    id: 4,
    productName: "Organic Fresh Potatoes",
    price: 30.50,
    sellerName: "Earthly Delights",
    distance: "3.2 km",
    image: "https://via.placeholder.com/300x200/22c55e/ffffff?text=Potatoes",
    description: "Freshly harvested organic potatoes, great for any dish",
    sellerId: 104,
    sellerAddress: "25 Soil Avenue, Earth Gardens"
  },
  {
    id: 5,
    productName: "Fresh Green Spinach",
    price: 15.75,
    sellerName: "Leafy Greens Co.",
    distance: "1.5 km",
    image: "https://via.placeholder.com/300x200/22c55e/ffffff?text=Spinach",
    description: "Nutrient-rich green spinach leaves, locally grown",
    sellerId: 105,
    sellerAddress: "54 Green Road, Leafy Meadows"
  },
  {
    id: 6,
    productName: "Grass-Fed Milk",
    price: 35.00,
    sellerName: "Pure Dairy Farm",
    distance: "4.7 km",
    image: "https://via.placeholder.com/300x200/22c55e/ffffff?text=Milk",
    description: "Pure, fresh milk from grass-fed cows with no additives",
    sellerId: 106,
    sellerAddress: "120 Meadow Lane, Dairy Valley"
  }
];

export default function HomePage() {
  const router = useRouter();
  // Always set to buyer since this is the main home page
  const [userType] = useState<'buyer'>('buyer');
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [favorites, setFavorites] = useState<FavoriteSeller[]>([]);

  // Load favorites when the component mounts
  useEffect(() => {
    loadFavorites();
  }, []);

  // Load favorites from AsyncStorage
  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
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

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setViewModalVisible(true);
    // Yo popup ma sabji ko sabai details dekhaucha, jastai mero school diary ma sabai kura lekheko huncha!
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Yaha mathi app ko naam cha, jastai mero naam tag lagaunu parcha school ma! */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.demandButton}
            onPress={handleCreateDemand}
          >
            <Text style={styles.demandButtonText}>+</Text>
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>AgroLink</Text>
          </View>
          
          {/* Empty view for symmetrical layout */}
          <View style={styles.demandButton}></View>
        </View>
      </View>

      {/* Yaha sabai sabji haru cha, jastai mero toys ka collection! */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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

      {/* Yo popup cha confirm garna lai, jastai mummy le sodhchin "pakka ho?" */}
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

      {/* Yo popup ma seller ko details dekhaucha, jastai mero teacher ko contact info school diary ma! */}
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

      {/* Floating Action Button for creating demand */}
      <TouchableOpacity
        style={styles.fabButton}
        onPress={handleCreateDemand}
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
});
