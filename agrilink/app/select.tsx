import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View, SafeAreaView } from "react-native";

export default function SelectPage() {
    const router = useRouter();
    const [selectedRole, setSelectedRole] = useState<'buyer' | 'seller' | null>(null);

    const handleSelect = (role: 'buyer' | 'seller') => {
        setSelectedRole(role);
        // Store the selected role for use in registration
        router.push({
            pathname: "/login",
            params: { userType: role }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* App header */}
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

            {/* Role selection content */}
            <View style={styles.content}>
                <Image
                    source={require("../assets/images/logo.png")}
                    style={styles.icon}
                    resizeMode="contain"
                />
                <Text style={styles.title}>Select Your Role</Text>
                <Text style={styles.subtitle}>Choose how you want to use AgroLink</Text>

                <View style={styles.optionsContainer}>
                    <TouchableOpacity
                        style={[styles.option, styles.buyer]}
                        onPress={() => handleSelect('buyer')}
                    >
                        <Text style={styles.optionIcon}>🛒</Text>
                        <Text style={styles.optionText}>Buyer</Text>
                        <Text style={styles.optionDescription}>Purchase fresh produce</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.option, styles.seller]}
                        onPress={() => handleSelect('seller')}
                    >
                        <Text style={styles.optionIcon}>🚜</Text>
                        <Text style={styles.optionText}>Seller</Text>
                        <Text style={styles.optionDescription}>Sell your products</Text>
                    </TouchableOpacity>
                </View>
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
        width: 120,
        height: 120,
        marginBottom: 32,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: "#22c55e",
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#22c55e",
        marginBottom: 8,
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 16,
        color: "#6b7280",
        textAlign: "center",
        marginBottom: 36,
        paddingHorizontal: 20,
    },
    optionsContainer: {
        width: "90%",
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 16,
    },
    option: {
        width: "45%",
        paddingVertical: 24,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    buyer: {
        backgroundColor: "#22c55e",
    },
    seller: {
        backgroundColor: "#3b82f6",
    },
    optionIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    optionText: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
        letterSpacing: 1,
        marginBottom: 4,
    },
    optionDescription: {
        color: "#fff",
        fontSize: 12,
        opacity: 0.9,
        textAlign: "center",
    },
});
