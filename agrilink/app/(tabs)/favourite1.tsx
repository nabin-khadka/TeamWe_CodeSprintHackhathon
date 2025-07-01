import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Image, SafeAreaView, TouchableOpacity, FlatList, Alert, RefreshControl } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { favoritesAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

// API Favorite User interface
interface APIFavoriteUser {
  _id: string;
  name: string;
  phone: string;
  userType: 'buyer' | 'seller';
  sellerProfile?: {
    businessName?: string;
    contactInfo?: string;
  };
}

// Seller's favorite buyers (legacy interface for compatibility)
interface FavoriteBuyer {
  id: number;
  name: string;
  address: string;
}

export default function FavouriteBuyersPage() {
  const { user, isAuthenticated } = useAuth();
  const [favoriteBuyers, setFavoriteBuyers] = useState<FavoriteBuyer[]>([]);
  const [apiFavorites, setApiFavorites] = useState<APIFavoriteUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    }
  }, [isAuthenticated]);

  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated) {
        loadFavorites();
      }
    }, [isAuthenticated])
  );

  // Load favorites from both API and AsyncStorage
  const loadFavorites = async () => {
    try {
      setIsLoading(true);

      // Try to fetch from API first
      try {
        const apiFavs = await favoritesAPI.getFavorites();
        console.log('API favorites response:', apiFavs);
        if (Array.isArray(apiFavs)) {
          setApiFavorites(apiFavs);
          // Convert API favorites to legacy format for display
          const convertedFavorites = apiFavs.map((fav, index) => ({
            id: parseInt(fav._id.substring(fav._id.length - 6), 16) || index,
            name: fav.userType === 'seller' ?
              (fav.sellerProfile?.businessName || fav.name) : fav.name,
            address: fav.sellerProfile?.contactInfo || fav.phone || 'Contact for address'
          }));
          setFavoriteBuyers(convertedFavorites);
        }
      } catch (apiError) {
        console.error('API favorites error:', apiError);
        // Fallback to AsyncStorage
        await loadFavoriteBuyersFromStorage();
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading favorites:', error);
      setIsLoading(false);
    }
  };

  // Fallback method to load from AsyncStorage
  const loadFavoriteBuyersFromStorage = async () => {
    try {
      const storedFavoriteBuyers = await AsyncStorage.getItem('favoriteBuyers');
      if (storedFavoriteBuyers) {
        setFavoriteBuyers(JSON.parse(storedFavoriteBuyers));
      } else {
        setFavoriteBuyers([]);
      }
    } catch (error) {
      console.error('Error loading favorite buyers from storage:', error);
      setFavoriteBuyers([]);
    }
  };

  // Refresh favorites
  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  const removeFavoriteBuyer = async (buyerId: number) => {
    try {
      // Find the API favorite user by converted ID
      const apiFavorite = apiFavorites.find((fav, index) => {
        const convertedId = parseInt(fav._id.substring(fav._id.length - 6), 16) || index;
        return convertedId === buyerId;
      });

      if (apiFavorite) {
        // Remove from API
        await favoritesAPI.removeFromFavorites(apiFavorite._id);
        Alert.alert('Success', 'Removed from favorites');
        await loadFavorites(); // Refresh the list
      } else {
        // Fallback to AsyncStorage removal
        const updatedFavorites = favoriteBuyers.filter(buyer => buyer.id !== buyerId);
        await AsyncStorage.setItem('favoriteBuyers', JSON.stringify(updatedFavorites));
        setFavoriteBuyers(updatedFavorites);
      }
    } catch (error) {
      console.error('Error removing favorite buyer:', error);
      Alert.alert('Error', 'Failed to remove from favorites. Please try again.');
    }
  };

  const renderFavoriteItem = ({ item }: { item: FavoriteBuyer }) => (
    <View style={styles.favoriteCard}>
      <View style={styles.favoriteInfo}>
        <View style={styles.buyerAvatar}>
          <Text style={styles.buyerInitial}>
            {(item.name || 'U').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.buyerDetails}>
          <Text style={styles.buyerName}>{item.name || 'Unknown User'}</Text>
          <Text style={styles.buyerAddress}>📍 {item.address || 'No address'}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFavoriteBuyer(item.id)}
      >
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
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
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Your Favourite Buyers</Text>
          {apiFavorites.length > 0 && (
            <Text style={styles.dataSourceIndicator}>📡 Live data</Text>
          )}
        </View>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading favorites...</Text>
          </View>
        ) : favoriteBuyers.length > 0 ? (
          <FlatList
            data={favoriteBuyers}
            renderItem={renderFavoriteItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.favoritesList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.subtitle}>No favourite buyers yet!</Text>
            <Text style={styles.helperText}>
              {isAuthenticated ?
                'View buyer details and add them to your favorites.' :
                'Please log in to see your favorites.'
              }
            </Text>
            {isAuthenticated && (
              <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Refresh</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
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
    padding: 15,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#22c55e",
    marginBottom: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 10,
  },
  helperText: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    paddingHorizontal: 30,
  },
  favoriteCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  favoriteInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  buyerAvatar: {
    width: 50,
    height: 50,
    backgroundColor: "#22c55e",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  buyerInitial: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
  },
  buyerDetails: {
    flex: 1,
  },
  buyerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 5,
  },
  buyerAddress: {
    fontSize: 14,
    color: "#6b7280",
  },
  removeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#ef4444",
    borderRadius: 6,
  },
  removeButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  favoritesList: {
    paddingTop: 10,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dataSourceIndicator: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '600',
    marginTop: 4,
  },
  retryButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
