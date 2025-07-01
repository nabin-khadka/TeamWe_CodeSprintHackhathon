import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActionSheetIOS, Alert, Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, SafeAreaView } from "react-native";

export default function RegisterPage() {
    const [photo, setPhoto] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("+977");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const router = useRouter();

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

    const handleRegister = () => {
        // Add your registration logic here
        alert("Registered!");
        router.push("/login");
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
                        source={require('../../assets/images/logo.png')} 
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.appName}>AgroLink</Text>
                </View>
            </View>
            
            {/* Yaha ma mero naya account banauchu, jastai mero drawing book ma naya drawing! */}
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
                <TouchableOpacity style={styles.button} onPress={handleRegister} activeOpacity={0.85}>
                    <Text style={styles.buttonText}>Register</Text>
                </TouchableOpacity>
                <Text style={styles.footerText}>
                    Already have an account?{" "}
                    <Text style={styles.signup} onPress={handleLogin}>Login</Text>
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
});
