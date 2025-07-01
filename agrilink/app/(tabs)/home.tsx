import React, { useState } from "react";
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
    description: "Fresh organic tomatoes grown without pesticides"
  },
  {
    id: 2,
    productName: "Premium Rice Grain",
    price: 45.50,
    sellerName: "Golden Harvest Co.",
    distance: "5.1 km",
    image: "https://via.placeholder.com/300x200/22c55e/ffffff?text=Rice",
    description: "High quality basmati rice, freshly harvested"
  },
  {
    id: 3,
    productName: "Free Range Eggs",
    price: 18.00,
    sellerName: "Happy Hen Farm",
    distance: "1.8 km",
    image: "https://via.placeholder.com/300x200/22c55e/ffffff?text=Eggs",
    description: "Farm fresh eggs from free-range chickens"
  }
];

export default function HomePage() {
  const router = useRouter();
  // Always set to buyer since this is the main home page
  const [userType] = useState<'buyer'>('buyer'); // Yo page ma buyer mode ma chu, jastai ma doll kheldaa doctor baneko!
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleViewProduct = (productId: number) => {
    Alert.alert("View Product", `Viewing product ${productId}`); // When button dabai then show one popup like "dekhi rahi chu!"
  };

  const handleOrderProduct = (product: Product) => {
    // Set selected product and show modal
    setSelectedProduct(product);
    setModalVisible(true);
    // Ye modal dekhaucha, jastai mummy le sodhchin "sure ho sabji kinne?" 
  };
  
  const confirmOrder = () => {
    if (selectedProduct) {
      // Add order to orders (in a real app, this would save to a database)
      console.log(`Order confirmed for ${selectedProduct.productName}`);
      
      // Close the modal
      setModalVisible(false);
      
      // Navigate to orders tab to see the placed order
      router.push("/(tabs)/orders");
      // Mero kineko sabji dekhauna lai orders page ma janchu!
    }
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
            onPress={() => handleViewProduct(item.id)}
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
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/images/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>AgroLink</Text>
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
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
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
                onPress={() => setModalVisible(false)}
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
});
