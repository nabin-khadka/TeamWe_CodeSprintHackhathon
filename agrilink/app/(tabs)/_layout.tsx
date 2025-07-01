// @ts-nocheck
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Slot, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../contexts/AuthContext";

export default function MainLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, loading } = useAuth();
  // Get the current route (e.g., "home", "profile", etc.)
  const current = segments[segments.length - 1];

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated]);

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
  const showLayout = ["home", "profile", "favourite", "history"].includes(current);

  if (!showLayout) {
    // Render only the child page (no top/bottom bar)
    return <Slot />;
  }

  return (
    <View style={styles.container}>
      {/* Top Green Band */}
      <View style={styles.topBar}>
        <Text style={styles.appName}>AgroLink</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Slot />
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/home")}>
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
    paddingTop: 48,
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