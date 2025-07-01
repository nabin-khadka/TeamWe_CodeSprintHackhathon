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
import { demandAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

// Demand interface (same as in home.tsx)
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
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
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
    image: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80",
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
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
    postedDate: "2025-06-30"
  },
  {
    id: 4,
    productName: "Fresh Spinach",
    quantity: "8 kg",
    buyerName: "Sunita Karki",
    buyerId: 204,
    buyerAddress: "56 Green Road, Lalitpur",
    distance: "1.2 km",
    description: "Need fresh spinach for home delivery.",
    image: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=400&q=80",
    postedDate: "2025-07-01"
  }
];

export default function SellerHomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [demands, setDemands] = useState<Demand[]>([]);
  const [viewBuyerModalVisible, setViewBuyerModalVisible] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState<Demand | null>(null);
  const [favoriteBuyers, setFavoriteBuyers] = useState<{ id: number, name: string, address: string }[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert(
        'Authentication Required',
        'Please login to view demands.',
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
        'Only sellers can view demands.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/home'),
          },
        ]
      );
      return;
    }

    loadFavoriteBuyers();
    fetchDemands();
  }, [isAuthenticated, user]);

  const fetchDemands = async () => {
    try {
      const response = await demandAPI.getDemands();
      console.log('Fetched demands:', response); // Debug log

      // Convert backend demand format to frontend format if needed
      const formattedDemands = response.map((demand: any, index: number) => ({
        id: index + 1, // Temporary ID for frontend
        productName: demand.productName,
        quantity: demand.quantity,
        buyerName: demand.buyerId?.name || 'Unknown Buyer',
        buyerId: demand.buyerId?._id || demand.buyerId,
        buyerAddress: demand.deliveryLocation,
        distance: '2.5 km', // Calculate from coordinates if needed
        description: `Need ${demand.productName} for ${demand.deliveryDate}`,
        image: demand.images?.[0] || `https://via.placeholder.com/300x200/22c55e/ffffff?text=${encodeURIComponent(demand.productName)}`,
        postedDate: new Date(demand.createdAt).toISOString().split('T')[0]
      }));

      setDemands(formattedDemands);
    } catch (error) {
      console.error('Error fetching demands:', error);
      Alert.alert('Error', 'Could not load buyer demands. Please try again.');
    }
  };

  const loadFavoriteBuyers = async () => {
    try {
      const storedFavoriteBuyers = await AsyncStorage.getItem('favoriteBuyers');
      if (storedFavoriteBuyers) {
        setFavoriteBuyers(JSON.parse(storedFavoriteBuyers));
      }
    } catch (error) {
      console.error('Error loading favorite buyers:', error);
    }
  };

  const saveFavoriteBuyers = async (newFavorites: { id: number, name: string, address: string }[]) => {
    try {
      await AsyncStorage.setItem('favoriteBuyers', JSON.stringify(newFavorites));
      setFavoriteBuyers(newFavorites);
    } catch (error) {
      console.error('Error saving favorite buyers:', error);
    }
  };

  const handleViewDemand = (demand: Demand) => {
    setSelectedDemand(demand);
    setViewBuyerModalVisible(true);
  };

  const addBuyerToFavorites = async (demand: Demand) => {
    const newFavorite = {
      id: demand.buyerId,
      name: demand.buyerName,
      address: demand.buyerAddress
    };
    // Check if already in favorites
    const alreadyFavorite = favoriteBuyers.some(fav => fav.id === newFavorite.id);
    if (!alreadyFavorite) {
      const newFavorites = [...favoriteBuyers, newFavorite];
      try {
        await AsyncStorage.setItem('favoriteBuyers', JSON.stringify(newFavorites));
        setFavoriteBuyers(newFavorites);
        Alert.alert("Added to Favorites", `${demand.buyerName} has been added to your favorites!`);
        setViewBuyerModalVisible(false);
      } catch (error) {
        console.error('Error saving favorite buyers:', error);
        Alert.alert('Error', 'Could not save to favorites.');
      }
    } else {
      Alert.alert("Already in Favorites", `${demand.buyerName} is already in your favorites!`);
    }
  };

  // Serve a demand (add to seller's order history)
  const handleServeDemand = async (demand: Demand) => {
    try {
      // Create a new order object for seller's history
      const newOrder = {
        id: Math.floor(Math.random() * 10000) + 1000,
        productName: demand.productName,
        quantity: demand.quantity,
        buyerName: demand.buyerName,
        buyerAddress: demand.buyerAddress,
        image: demand.image,
        orderDate: new Date().toISOString().split('T')[0],
        status: 'pending' as const
      };
      // Get existing seller orders
      const existingOrdersString = await AsyncStorage.getItem('sellerOrders');
      const existingOrders = existingOrdersString ? JSON.parse(existingOrdersString) : [];
      // Check if this demand is already served (by productName, buyerName, and status 'pending')
      const alreadyServed = existingOrders.some((order: any) =>
        order.productName === newOrder.productName &&
        order.buyerName === newOrder.buyerName &&
        order.status === 'pending'
      );
      if (alreadyServed) {
        Alert.alert('Already Served', 'You have already served this demand.');
        return;
      }
      // Add new order to the list
      const updatedOrders = [newOrder, ...existingOrders];
      // Save updated orders back to AsyncStorage
      await AsyncStorage.setItem('sellerOrders', JSON.stringify(updatedOrders));
      Alert.alert('Success', 'You have chosen to serve this demand. It is now in your order history.', [
        { text: 'OK', onPress: () => router.push('/(tabs)/history1') }
      ]);
    } catch (error) {
      console.error('Error serving demand:', error);
      Alert.alert('Error', 'Could not update your order history.');
    }
  };

  const handlePostProduct = () => {
    router.push("/(tabs)/post-product");
  };

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
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => handleViewDemand(item)}
          >
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewButton, { borderColor: '#3b82f6' }]}
            onPress={() => handleServeDemand(item)}
          >
            <Text style={[styles.viewButtonText, { color: '#3b82f6' }]}>Serve</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

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
        <View style={styles.feedContainer}>
          <Text style={styles.feedTitle}>Buyer Demands Near You</Text>
          <FlatList
            data={demands}
            renderItem={({ item }) => <DemandCard item={item} />}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>
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
      {/* Floating Action Button for posting product */}
      <TouchableOpacity
        style={styles.fabButton}
        onPress={handlePostProduct}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ...copy styles from home.tsx for consistency...
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
  date: {
    fontSize: 14,
    color: "#6b7280",
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
  modalSellerName: {
    fontSize: 14,
    color: "#6b7280",
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
    bottom: 100,
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
