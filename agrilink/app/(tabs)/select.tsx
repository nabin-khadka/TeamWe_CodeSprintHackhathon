import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View, SafeAreaView } from "react-native";

export default function SelectPage() {
    const router = useRouter();

    const handleSelect = () => {
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
            
            {/* Yaha ma khelaunchu ki buyer bannu ya seller, jastai game ma character choose! */}
            <View style={styles.content}>
                <Image
                    source={require("../../assets/images/logo.png")}
                    style={styles.icon}
                    resizeMode="contain"
                />
                <Text style={styles.title}>Select Your Role</Text>
                <View style={styles.optionsContainer}>
                    <TouchableOpacity style={[styles.option, styles.buyer]} onPress={handleSelect}>
                        <Text style={styles.optionText}>Buyer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.option, styles.seller]} onPress={handleSelect}>
                        <Text style={styles.optionText}>Seller</Text>
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
        color: "#222",
        marginBottom: 40,
        letterSpacing: 1,
    },
    optionsContainer: {
        width: "90%",
        alignItems: "center",
    },
    option: {
        width: "100%",
        paddingVertical: 22,
        marginVertical: 12,
        borderRadius: 30, // Match index page button
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.13,
        shadowRadius: 6,
        elevation: 3,
    },
    buyer: {
        backgroundColor: "#22c55e", // Match index page green
    },
    seller: {
        backgroundColor: "#16a34a", // A darker green for contrast
    },
    optionText: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "bold",
        letterSpacing: 1,
    },
});