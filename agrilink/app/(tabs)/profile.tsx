import React, { useState } from "react";
import { StyleSheet, Text, View, Image, SafeAreaView, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { authAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, logout: authLogout, token } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              if (token) {
                await authAPI.logout(token);
              }
              await authLogout();
              router.push("/login");
            } catch (error: any) {
              console.error('Logout error:', error);
              // Clear local storage even if API call fails
              await authLogout();
              router.push("/login");
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };
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

      {/* Yaha mero photo ra details cha, jastai mero school ID card ma! */}
      <ScrollView style={styles.content}>
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>U</Text>
            </View>
          </View>
          
          <Text style={styles.userName}>{user?.name || "Guest User"}</Text>
          <Text style={styles.userInfo}>{user?.phone || "No phone"}</Text>
          <Text style={styles.userInfo}>{user?.address || "No address"}</Text>
          <Text style={styles.userType}>
            {user?.userType === 'seller' ? '🏪 Seller' : '🛒 Buyer'}
          </Text>
          
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Settings</Text>
            
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>Personal Information</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>Notifications</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>Security</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>Help & Support</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.menuItem, styles.logoutButton]}
              onPress={handleLogout}
              disabled={isLoading}
            >
              <Text style={styles.logoutText}>
                {isLoading ? "Logging out..." : "Logout"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
  profileContainer: {
    alignItems: "center",
    padding: 20,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 40,
    color: "white",
    fontWeight: "bold",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  userInfo: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  userType: {
    fontSize: 14,
    color: "#22c55e",
    fontWeight: "600",
    marginTop: 5,
    marginBottom: 4,
  },
  editButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: "#22c55e",
    borderRadius: 30,
  },
  editButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  section: {
    width: "100%",
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  menuItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  menuText: {
    fontSize: 16,
    color: "#333",
  },
  logoutButton: {
    marginTop: 20,
    borderBottomWidth: 0,
  },
  logoutText: {
    color: "#e53e3e",
    fontSize: 16,
    fontWeight: "500",
  },
});
