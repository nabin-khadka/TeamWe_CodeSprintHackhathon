import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Image, SafeAreaView, ScrollView, TouchableOpacity, FlatList } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';

// Seller ko details for favorites, jastai mero favorite friends ko list ma info huncha!
interface FavoriteSeller {
  id: number;
  name: string;
  address: string;
}

export default function FavouritePage() {
  const [favorites, setFavorites] = useState<FavoriteSeller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadFavorites();
  }, []);

  // Reload favorites when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      loadFavorites();
    }, [])
  );

  // Load favorites from AsyncStorage (for buyers: favorite sellers)
  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      } else {
        setFavorites([]);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading favorites:', error);
      setIsLoading(false);
    }
  };

  // Remove a seller from favorites
  const removeFavorite = async (sellerId: number) => {
    try {
      const updatedFavorites = favorites.filter(seller => seller.id !== sellerId);
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      setFavorites(updatedFavorites);
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  // Render each favorite seller card
  const renderFavoriteItem = ({ item }: { item: FavoriteSeller }) => (
    <View style={styles.favoriteCard}>
      <View style={styles.favoriteInfo}>
        <View style={styles.sellerAvatar}>
          <Text style={styles.sellerInitial}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.sellerDetails}>
          <Text style={styles.sellerName}>{item.name}</Text>
          <Text style={styles.sellerAddress}>📍 {item.address}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFavorite(item.id)}
      >
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

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

      {/* Yaha mero sabai man parne sabji sellers haru cha, jastai mero dolls ko collection! */}
      <View style={styles.content}>
        <Text style={styles.title}>Your Favourites</Text>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading favorites...</Text>
          </View>
        ) : favorites.length > 0 ? (
          <FlatList
            data={favorites}
            renderItem={renderFavoriteItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.favoritesList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.subtitle}>No favourites yet!</Text>
            <Text style={styles.helperText}>View seller details and add them to your favorites.</Text>
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
  sellerAvatar: {
    width: 50,
    height: 50,
    backgroundColor: "#22c55e",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  sellerInitial: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 5,
  },
  sellerAddress: {
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
});
