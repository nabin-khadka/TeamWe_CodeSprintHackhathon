import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Page() {
    const [showButton, setShowButton] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => setShowButton(true), 3000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (showButton) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }).start();
        }
    }, [showButton]);

    const handleGetStarted = () => {
        router.push("/select");
    };

    return (
        <View style={styles.container}>
            <View style={styles.main}>
                <Image
                    source={require("../assets/images/logo.png")}
                    style={styles.icon}
                    resizeMode="contain"
                />
                {showButton && (
                    <Animated.View style={{ opacity: fadeAnim, width: "100%", alignItems: "center" }}>
                        <TouchableOpacity style={styles.button} onPress={handleGetStarted} activeOpacity={0.85}>
                            <Text style={styles.buttonText}>Get Started</Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        padding: 24,
        backgroundColor: "#fff",
    },
    main: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        maxWidth: 960,
        marginHorizontal: "auto",
        width: "100%",
    },
    icon: {
        width: 150,
        height: 150,
        marginBottom: 32,
    },
    button: {
        backgroundColor: "#22c55e",
        paddingVertical: 16,
        paddingHorizontal: 48,
        borderRadius: 30,
        elevation: 4, // Android shadow
        shadowColor: "#000", // iOS shadow
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    buttonText: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "bold",
        letterSpacing: 1,
    },
});