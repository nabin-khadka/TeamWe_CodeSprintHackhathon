import React from "react";
import { StyleSheet, Text, View, Image, SafeAreaView, ScrollView, FlatList } from "react-native";

interface Order {
  id: number;
  productName: string;
  price: number;
  sellerName: string;
  image: string;
  orderDate: string;
  status: 'pending' | 'confirmed' | 'delivered';
}

// Yaha dummy orders cha, jastai mero khel khel ma banayeko list!
const mockOrders: Order[] = [
  {
    id: 101,
    productName: "Fresh Organic Tomatoes",
    price: 25.99,
    sellerName: "Green Valley Farm",
    image: "https://via.placeholder.com/300x200/22c55e/ffffff?text=Tomatoes",
    orderDate: "2025-06-29",
    status: 'pending'
  },
  {
    id: 102,
    productName: "Premium Rice Grain",
    price: 45.50,
    sellerName: "Golden Harvest Co.",
    image: "https://via.placeholder.com/300x200/22c55e/ffffff?text=Rice",
    orderDate: "2025-06-28",
    status: 'confirmed'
  },
  {
    id: 103,
    productName: "Free Range Eggs",
    price: 18.00,
    sellerName: "Happy Hen Farm",
    image: "https://via.placeholder.com/300x200/22c55e/ffffff?text=Eggs",
    orderDate: "2025-06-25",
    status: 'delivered'
  }
];

export default function OrdersPage() {
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return "#f59e0b"; // Amber
      case 'confirmed': return "#3b82f6"; // Blue
      case 'delivered': return "#22c55e"; // Green
      default: return "#6b7280"; // Gray
    }
  };

  const OrderCard = ({ item }: { item: Order }) => (
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
          <Text style={styles.sellerName}>from {item.sellerName}</Text>
          <Text style={styles.price}>₹{item.price}</Text>
          <Text style={styles.orderDate}>Ordered: {item.orderDate}</Text>
        </View>
      </View>
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

      {/* Yaha sabai kineko sabji ko list cha, jastai ama ko shopping bag ma! */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Your Orders</Text>
        
        {mockOrders.length > 0 ? (
          <FlatList
            data={mockOrders}
            renderItem={({ item }) => <OrderCard item={item} />}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No orders yet</Text>
            <Text style={styles.emptySubtext}>Your orders will appear here</Text>
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
  sellerName: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 6,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#22c55e",
    marginBottom: 6,
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
