import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View, SafeAreaView } from "react-native";

export default function LoginPage() {
    const [phone, setPhone] = useState("+977");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleLogin = () => {
        // Determine if user is a buyer or seller (in a real app, this would come from authentication)
        const userType = 'buyer'; // Default to buyer for now
        
        if (userType === 'buyer') {
            router.push("/(tabs)/home-buyer");
        } else {
            router.push("/(tabs)/home");
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
                        source={require('../../assets/images/logo.png')} 
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.appName}>AgroLink</Text>
                </View>
            </View>

            {/* Yaha ma mero phone number ra password lekhchu, jastai mero secret diary ma! */}
            <View style={styles.content}>
                <Image
                    source={require("../../assets/images/icon.png")}
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
                <TouchableOpacity style={styles.button} onPress={handleLogin} activeOpacity={0.85}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
                <Text style={styles.footerText}>
                    Don't have an account?{" "}
                    <Text style={styles.signup} onPress={handleSignUp}>Sign Up</Text>
                </Text>
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