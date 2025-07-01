import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Image, SafeAreaView, TouchableOpacity, FlatList } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

// Seller's favorite buyers
interface FavoriteBuyer {
  id: number;
  name: string;
  address: string;
}

export default function FavouriteBuyersPage() {
  const [favoriteBuyers, setFavoriteBuyers] = useState<FavoriteBuyer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavoriteBuyers();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadFavoriteBuyers();
    }, [])
  );

  const loadFavoriteBuyers = async () => {
    try {
      setIsLoading(true);
      const storedFavoriteBuyers = await AsyncStorage.getItem('favoriteBuyers');
      if (storedFavoriteBuyers) {
        setFavoriteBuyers(JSON.parse(storedFavoriteBuyers));
      } else {
        setFavoriteBuyers([]);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading favorite buyers:', error);
      setIsLoading(false);
    }
  };

  const removeFavoriteBuyer = async (buyerId: number) => {
    try {
      const updatedFavorites = favoriteBuyers.filter(buyer => buyer.id !== buyerId);
      await AsyncStorage.setItem('favoriteBuyers', JSON.stringify(updatedFavorites));
      setFavoriteBuyers(updatedFavorites);
    } catch (error) {
      console.error('Error removing favorite buyer:', error);
    }
  };

  const renderFavoriteItem = ({ item }: { item: FavoriteBuyer }) => (
    <View style={styles.favoriteCard}>
      <View style={styles.favoriteInfo}>
        <View style={styles.buyerAvatar}>
          <Text style={styles.buyerInitial}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.buyerDetails}>
          <Text style={styles.buyerName}>{item.name}</Text>
          <Text style={styles.buyerAddress}>📍 {item.address}</Text>
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
        <Text style={styles.title}>Your Favourite Buyers</Text>
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
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.subtitle}>No favourite buyers yet!</Text>
            <Text style={styles.helperText}>View buyer details and add them to your favorites.</Text>
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
});
