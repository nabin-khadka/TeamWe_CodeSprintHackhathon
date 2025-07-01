import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Image, SafeAreaView, ScrollView, FlatList } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SellerOrder {
  id: number;
  productName: string;
  quantity: string;
  buyerName: string;
  buyerAddress: string;
  image: string;
  orderDate: string;
  status: 'pending' | 'confirmed' | 'delivered';
}

// Add mock serve and delivery orders for demonstration
const mockServeOrders: SellerOrder[] = [
  {
    id: 201,
    productName: "Fresh Tomatoes",
    quantity: "10 kg",
    buyerName: "Aarav Sharma",
    buyerAddress: "123 Mountain View, Kathmandu",
    image: "https://via.placeholder.com/300x200/22c55e/ffffff?text=Tomatoes",
    orderDate: "2025-06-29",
    status: 'pending',
  },
  {
    id: 202,
    productName: "Premium Rice Grain",
    quantity: "25 kg",
    buyerName: "Priya Gurung",
    buyerAddress: "45 Valley Road, Pokhara",
    image: "https://via.placeholder.com/300x200/22c55e/ffffff?text=Rice",
    orderDate: "2025-06-28",
    status: 'confirmed',
  },
  {
    id: 203,
    productName: "Organic Potatoes",
    quantity: "5 kg",
    buyerName: "Rajan Thapa",
    buyerAddress: "78 Lake View, Chitwan",
    image: "https://via.placeholder.com/300x200/22c55e/ffffff?text=Potatoes",
    orderDate: "2025-06-25",
    status: 'delivered',
  },
];

export default function SellerHistoryPage() {
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [serveOrders, setServeOrders] = useState<SellerOrder[]>([]);
  const [deliveryOrders, setDeliveryOrders] = useState<SellerOrder[]>([]);

  useEffect(() => {
    loadSellerOrders();
  }, []);

  // Load seller orders from AsyncStorage and add mock serve/delivery orders
  const loadSellerOrders = async () => {
    try {
      const storedOrders = await AsyncStorage.getItem('sellerOrders');
      let parsedOrders: SellerOrder[] = [];
      if (storedOrders) {
        parsedOrders = JSON.parse(storedOrders);
      }
      // Separate serve and delivery orders by status
      setServeOrders([
        ...parsedOrders.filter(o => o.status === 'pending' || o.status === 'confirmed'),
        ...mockServeOrders.filter(o => o.status === 'pending' || o.status === 'confirmed')
      ]);
      setDeliveryOrders([
        ...parsedOrders.filter(o => o.status === 'delivered'),
        ...mockServeOrders.filter(o => o.status === 'delivered')
      ]);
      setOrders(parsedOrders);
    } catch (error) {
      console.error('Error loading seller orders:', error);
    }
  };

  const getStatusColor = (status: SellerOrder['status']) => {
    switch (status) {
      case 'pending': return "#f59e0b";
      case 'confirmed': return "#3b82f6";
      case 'delivered': return "#22c55e";
      default: return "#6b7280";
    }
  };

  const OrderCard = ({ item }: { item: SellerOrder }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}> 
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.orderContent}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        <View style={styles.orderDetails}>
          <Text style={styles.productName}>{item.productName}</Text>
          <Text style={styles.quantity}>Qty: {item.quantity}</Text>
          <Text style={styles.buyerName}>Buyer: {item.buyerName}</Text>
          <Text style={styles.buyerAddress}>📍 {item.buyerAddress}</Text>
          <Text style={styles.orderDate}>Ordered: {item.orderDate}</Text>
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
        <Text style={styles.pageTitle}>Served Order Requests</Text>
        {serveOrders.length > 0 ? (
          <FlatList
            data={serveOrders}
            renderItem={({ item }) => <OrderCard item={item} />}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No served order requests yet</Text>
            <Text style={styles.emptySubtext}>Order requests from buyers will appear here</Text>
          </View>
        )}
        <Text style={styles.pageTitle}>Delivered Orders</Text>
        {deliveryOrders.length > 0 ? (
          <FlatList
            data={deliveryOrders}
            renderItem={({ item }) => <OrderCard item={item} />}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No delivered orders yet</Text>
            <Text style={styles.emptySubtext}>Delivered orders will appear here</Text>
          </View>
        )}
      </ScrollView>
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
  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1f2937",
    marginTop: 20,
    marginBottom: 15,
  },
  orderCard: {
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
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderId: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4b5563",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "white",
    textTransform: "capitalize",
  },
  orderContent: {
    flexDirection: "row",
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  orderDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  quantity: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  buyerName: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  buyerAddress: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: "#6b7280",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
    paddingBottom: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4b5563",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6b7280",
  }
});
