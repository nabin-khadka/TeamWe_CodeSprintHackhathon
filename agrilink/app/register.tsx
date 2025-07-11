// @ts-nocheck
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActionSheetIOS, Alert, Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, SafeAreaView, ScrollView, KeyboardAvoidingView } from "react-native";
import { authAPI, storage } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function RegisterPage() {
    const [photo, setPhoto] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("+977");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [userType, setUserType] = useState<'buyer' | 'seller'>('buyer');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { setUser } = useAuth();

    // Ensure +977 stays at the start and exactly 10 digits after
    const handlePhoneChange = (text: string) => {
        if (text.startsWith("+977")) {
            // Only allow exactly 10 digits after +977
            const digits = text.slice(4).replace(/\D/g, "").slice(0, 13);
            setPhone("+977" + digits);
        } else {
            // Remove non-digit characters and ensure +977 at start with max 10 digits
            const digits = text.replace(/\D/g, "").slice(0, 13);
            setPhone("+977" + digits);
        }
    };

    // Dummy image picker for camera/gallery
    const handlePickPhoto = async () => {
        if (Platform.OS === "ios") {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ["Cancel", "Take Photo", "Choose from Library"],
                    cancelButtonIndex: 0,
                },
                async (buttonIndex) => {
                    if (buttonIndex === 1) {
                        // Take Photo
                        const result = await ImagePicker.launchCameraAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsEditing: true,
                            aspect: [1, 1],
                            quality: 0.5,
                        });
                        if (!result.canceled && result.assets && result.assets.length > 0) {
                            setPhoto(result.assets[0].uri);
                        }
                    } else if (buttonIndex === 2) {
                        // Choose from Library
                        const result = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsEditing: true,
                            aspect: [1, 1],
                            quality: 0.5,
                        });
                        if (!result.canceled && result.assets && result.assets.length > 0) {
                            setPhoto(result.assets[0].uri);
                        }
                    }
                }
            );
        } else {
            Alert.alert(
                "Select Photo",
                "",
                [
                    {
                        text: "Take Photo",
                        onPress: async () => {
                            const result = await ImagePicker.launchCameraAsync({
                                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                allowsEditing: true,
                                aspect: [1, 1],
                                quality: 0.5,
                            });
                            if (!result.canceled && result.assets && result.assets.length > 0) {
                                setPhoto(result.assets[0].uri);
                            }
                        }
                    },
                    {
                        text: "Choose from Library",
                        onPress: async () => {
                            const result = await ImagePicker.launchImageLibraryAsync({
                                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                allowsEditing: true,
                                aspect: [1, 1],
                                quality: 0.5,
                            });
                            if (!result.canceled && result.assets && result.assets.length > 0) {
                                setPhoto(result.assets[0].uri);
                            }
                        }
                    },
                    { text: "Cancel", style: "cancel" }
                ]
            );
        }
    };

    const handleRegister = async () => {
        if (isLoading) return;

        // Basic validation
        if (!name.trim()) {
            Alert.alert("Error", "Please enter your name");
            return;
        }

        if (!phone || phone.length !== 14) {
            Alert.alert("Error", "Please enter a valid phone number");
            return;
        }

        if (!password) {
            Alert.alert("Error", "Please enter a password");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            const userData = {
                name: name.trim(),
                phone,
                password,
                confirmPassword,
                address: address.trim(),
                profileImage: photo || undefined,
                userType: userType // Use selected user type
            };

            const response = await authAPI.register(userData);
            
            // Save user data to storage and update AuthContext
            await setUser(response);

            Alert.alert(
                "Success", 
                "Registration successful!", 
                [
                    {
                        text: "OK", 
                        onPress: () => {
                            router.push("/(tabs)/home");
                        }
                    }
                ]
            );

        } catch (error: any) {
            Alert.alert("Registration Failed", error.message || "An error occurred during registration");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = () => {
        router.push("/login");
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
            
            {/* Yaha ma mero naya account banauchu, jastai mero drawing book ma naya drawing! */}
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.contentContainer}>
                        <TouchableOpacity onPress={handlePickPhoto} style={styles.photoPicker}>
                            {photo ? (
                                <Image source={{ uri: photo }} style={styles.photo} />
                            ) : (
                                <View style={styles.photoPlaceholder}>
                                    <Text style={{ color: "#aaa" }}>Add Photo</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                <Text style={styles.title}>Create Account</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Full Name"
                        placeholderTextColor="#888"
                        value={name}
                        onChangeText={setName}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Address"
                        placeholderTextColor="#888"
                        value={address}
                        onChangeText={setAddress}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Phone Number"
                        placeholderTextColor="#888"
                        value={phone}
                        onChangeText={handlePhoneChange}
                        keyboardType="phone-pad"
                        autoCapitalize="none"
                        maxLength={14}
                    />
                    
                    {/* User Type Selector */}
                    <View style={styles.userTypeContainer}>
                        <Text style={styles.userTypeLabel}>Account Type:</Text>
                        <View style={styles.userTypeOptions}>
                            <TouchableOpacity
                                style={[styles.userTypeOption, userType === 'buyer' && styles.userTypeOptionSelected]}
                                onPress={() => setUserType('buyer')}
                            >
                                <Text style={[styles.userTypeText, userType === 'buyer' && styles.userTypeTextSelected]}>
                                    🛒 Buyer
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.userTypeOption, userType === 'seller' && styles.userTypeOptionSelected]}
                                onPress={() => setUserType('seller')}
                            >
                                <Text style={[styles.userTypeText, userType === 'seller' && styles.userTypeTextSelected]}>
                                    🏪 Seller
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#888"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Confirm Password"
                        placeholderTextColor="#888"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                    />
                </View>
                <TouchableOpacity 
                    style={[styles.button, isLoading && styles.buttonDisabled]} 
                    onPress={handleRegister} 
                    activeOpacity={0.85}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>
                        {isLoading ? "Registering..." : "Register"}
                    </Text>
                </TouchableOpacity>
                <Text style={styles.footerText}>
                    Already have an account?{" "}
                    <Text style={styles.signup} onPress={handleLogin}>Login</Text>
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
    contentContainer: {
        flex: 1,
        alignItems: "center",
        paddingTop: 20,
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
    photoPicker: {
        marginBottom: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    photo: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: "#22c55e",
    },
    photoPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: "#e5e7eb",
        backgroundColor: "#f3f4f6",
        alignItems: "center",
        justifyContent: "center",
    },
    userTypeContainer: {
        marginBottom: 16,
    },
    userTypeLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 12,
    },
    userTypeOptions: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },
    userTypeOption: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#e5e7eb",
        backgroundColor: "#f9fafb",
        alignItems: "center",
    },
    userTypeOptionSelected: {
        borderColor: "#22c55e",
        backgroundColor: "#f0fdf4",
    },
    userTypeText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6b7280",
    },
    userTypeTextSelected: {
        color: "#22c55e",
    },
});
