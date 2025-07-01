// @ts-nocheck
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Slot, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../contexts/AuthContext";

export default function MainLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, loading, user } = useAuth();
  // Get the current route (e.g., "home", "profile", etc.)
  const current = segments[segments.length - 1];

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated]);

  // Redirect to correct home tab on initial load if on /home or /home1
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      // If on /home and user is seller, redirect to /home1
      if ((current === 'home' && user.userType === 'seller')) {
        router.replace('/home1');
      }
      // If on /home1 and user is buyer, redirect to /home
      if ((current === 'home1' && user.userType === 'buyer')) {
        router.replace('/home');
      }
    }
  }, [loading, isAuthenticated, user, current]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Only show layout for these pages
  const showLayout = ["home", "home1", "profile", "favourite", "history", "history1"].includes(current);

  if (!showLayout) {
    // Render only the child page (no top/bottom bar)
    return <Slot />;
  }

  // Determine which home tab to show based on userType
  const homeRoute = user?.userType === 'seller' ? '/home1' : '/home';

  return (
    <View style={styles.container}>
      {/* Top Green Band */}
      <View style={styles.topBar}>
        <Text style={styles.appName}></Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Slot />
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push(homeRoute)}>
          <Ionicons name="home" size={28} color="#22c55e" />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/favourite")}>
          <MaterialIcons name="favorite" size={28} color="#22c55e" />
          <Text style={styles.navLabel}>Favourites</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/history")}>
          <MaterialIcons name="history" size={28} color="#22c55e" />
          <Text style={styles.navLabel}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/profile")}>
          <FontAwesome name="user" size={28} color="#22c55e" />
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topBar: {
    width: "100%",
    backgroundColor: "#22c55e",
    paddingTop: 1,
    paddingBottom: 18,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  appName: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  content: {
    flex: 1,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    elevation: 8,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  navLabel: {
    color: "#22c55e",
    fontSize: 13,
    marginTop: 2,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    fontSize: 18,
    color: "#666",
  },
});