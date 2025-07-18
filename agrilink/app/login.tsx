// @ts-nocheck
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View, SafeAreaView, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { authAPI, storage } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
    const [phone, setPhone] = useState("+977");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { setUser } = useAuth();

    const handleLogin = async () => {
        if (isLoading) return;

        // Basic validation
        if (!phone || phone.length !== 14) {
            Alert.alert("Error", "Please enter a valid phone number");
            return;
        }

        if (!password) {
            Alert.alert("Error", "Please enter your password");
            return;
        }

        setIsLoading(true);

        try {
            const response = await authAPI.login({ phone, password });

            // Save user data to storage and update AuthContext
            await setUser(response);

            // Navigate based on user type
            if (response?.role === "buyer") {
                router.push("/(tabs)/home");
            } else if (response?.role === "seller") {
                router.push("/(tabs)/home1");
            } else {
                Alert.alert("Login Failed", "Unknown user role.");
            }

        } catch (error: any) {
            Alert.alert("Login Failed", error.message || "An error occurred during login");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUp = () => {
        router.push("/register");
    };

    // Ensure +977 stays at the start and exactly 10 digits after
    const handlePhoneChange = (text: string) => {
        if (!text.startsWith("+977")) {
            setPhone("+977");
        } else {
            // Only allow exactly 10 digits after +977
            const digits = text.slice(4).replace(/\D/g, "").slice(0, 10);
            setPhone("+977" + digits);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Yaha mathi app ko naam cha, jastai mero naam tag lagaunu parcha school ma! */}
            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../assets/images/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.appName}>AgroLink</Text>
                </View>
            </View>

            {/* Yaha ma mero phone number ra password lekhchu, jastai mero secret diary ma! */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.content}>
                        <Image
                            source={require("../assets/images/logo.png")}
                            style={styles.icon}
                            resizeMode="contain"
                        />
                        <Text style={styles.title}>Welcome Back!</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Phone Number"
                                placeholderTextColor="#888"
                                value={phone}
                                onChangeText={handlePhoneChange}
                                keyboardType="phone-pad"
                                autoCapitalize="none"
                                maxLength={14} // +977 + 10 digits
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor="#888"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>
                        <TouchableOpacity
                            style={[styles.button, isLoading && styles.buttonDisabled]}
                            onPress={handleLogin}
                            activeOpacity={0.85}
                            disabled={isLoading}
                        >
                            <Text style={styles.buttonText}>
                                {isLoading ? "Logging in..." : "Login"}
                            </Text>
                        </TouchableOpacity>
                        <Text style={styles.footerText}>
                            Don't have an account?{" "}
                            <Text style={styles.signup} onPress={handleSignUp}>Sign Up</Text>
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 30, // Extra padding at the bottom for better scrolling
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
        alignItems: "center",
        paddingTop: 40,
    },
    icon: {
        width: 100,
        height: 100,
        marginBottom: 24,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: "#22c55e",
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 6,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#22c55e",
        marginBottom: 32,
        letterSpacing: 1,
    },
    inputContainer: {
        width: "85%",
        marginBottom: 24,
    },
    input: {
        backgroundColor: "#f3f4f6",
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 20,
        fontSize: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        color: "#222",
        shadowColor: "#22c55e",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    button: {
        backgroundColor: "#22c55e",
        paddingVertical: 16,
        paddingHorizontal: 80,
        borderRadius: 30,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
        marginBottom: 18,
    },
    buttonDisabled: {
        backgroundColor: "#9ca3af",
        elevation: 0,
        shadowOpacity: 0,
    },
    buttonText: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "bold",
        letterSpacing: 1,
    },
    footerText: {
        color: "#888",
        fontSize: 16,
        marginTop: 10,
    },
    signup: {
        color: "#22c55e",
        fontWeight: "bold",
    },
});
