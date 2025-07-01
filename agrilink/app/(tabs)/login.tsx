import { useRouter } from "expo-router"; // add this import
import React, { useState } from "react";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function LoginPage() {
    const [phone, setPhone] = useState("+977");
    const [password, setPassword] = useState("");
    const router = useRouter(); // add this line

    const handleLogin = () => {
        router.push("/home");
    };

    const handleSignUp = () => {
        router.push("/register");
    };

    // Ensure +977 stays at the start
    const handlePhoneChange = (text: string) => {
        if (!text.startsWith("+977")) {
            setPhone("+977");
        } else {
            setPhone(text);
        }
    };

    return (
        <View style={styles.container}>
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
                    maxLength={13} // +977 + 10 digits
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
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        paddingTop: 60,
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