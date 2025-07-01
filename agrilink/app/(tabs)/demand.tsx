import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';

export default function DemandPage() {
    const router = useRouter();
    const [productType, setProductType] = useState('');
    const [productName, setProductName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [deliveryDate, setDeliveryDate] = useState('');
    const [deliveryLocation, setDeliveryLocation] = useState('');
    const [selectedCoordinate, setSelectedCoordinate] = useState(null);

    // Modal states
    const [showProductTypeModal, setShowProductTypeModal] = useState(false);
    const [showMapModal, setShowMapModal] = useState(false);

    const productTypes = ['Fruits', 'Vegetables'];

    const handleSubmitDemand = () => {
        // Validate required fields
        if (!productType || !productName || !quantity || !deliveryDate || !deliveryLocation) {
            Alert.alert('Missing Information', 'Please fill in all required fields');
            return;
        }

        // Here you would typically send the data to your backend
        console.log('Demand submitted:', {
            productType,
            productName,
            quantity,
            deliveryDate,
            deliveryLocation,
        });

        Alert.alert(
            'Demand Posted!',
            'Your demand has been posted successfully. Sellers will contact you soon.',
            [
                {
                    text: 'OK',
                    onPress: () => router.back(),
                },
            ]
        );
    };

    const handleProductTypeSelect = (type: string) => {
        setProductType(type);
        setShowProductTypeModal(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Post Your Demand</Text>

            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.form}>
                        {/* Product Type Dropdown */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Product Type *</Text>
                            <TouchableOpacity
                                style={[styles.input, styles.dropdown]}
                                onPress={() => setShowProductTypeModal(true)}
                            >
                                <Text style={[styles.dropdownText, !productType && styles.placeholderText]}>
                                    {productType || 'Select product type'}
                                </Text>
                                <Text style={styles.dropdownArrow}>▼</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Product Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Product Name *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., Fresh Tomatoes, Apples, Carrots"
                                value={productName}
                                onChangeText={setProductName}
                            />
                        </View>

                        {/* Quantity */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Quantity *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., 5 kg, 10 pieces, 2 bags"
                                value={quantity}
                                onChangeText={setQuantity}
                            />
                        </View>

                        {/* Delivery Date */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Delivery Date *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., Tomorrow, This weekend, DD/MM/YYYY"
                                value={deliveryDate}
                                onChangeText={setDeliveryDate}
                            />
                        </View>

                        {/* Delivery Location */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Delivery Location *</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Enter your full delivery address"
                                value={deliveryLocation}
                                onChangeText={setDeliveryLocation}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Post Button */}
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmitDemand}
                        >
                            <Text style={styles.submitButtonText}>Post Demand</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Product Type Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showProductTypeModal}
                onRequestClose={() => setShowProductTypeModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Product Type</Text>
                        {productTypes.map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={styles.modalOption}
                                onPress={() => handleProductTypeSelect(type)}
                            >
                                <Text style={styles.modalOptionText}>{type}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={styles.modalCancelButton}
                            onPress={() => setShowProductTypeModal(false)}
                        >
                            <Text style={styles.modalCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        backgroundColor: '#ffffff',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        padding: 5,
    },
    backButtonText: {
        fontSize: 24,
        color: '#22c55e',
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    placeholderText: {
        color: '#9ca3af',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    form: {
        paddingVertical: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#ffffff',
    },
    textArea: {
        height: 80,
        paddingTop: 12,
    },
    submitButton: {
        backgroundColor: '#22c55e',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    submitButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dropdownText: {
        fontSize: 16,
        color: '#1f2937',
    },
    dropdownArrow: {
        fontSize: 12,
        color: '#6b7280',
    },

    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 20,
        width: '80%',
        maxWidth: 300,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalOption: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    modalOptionText: {
        fontSize: 16,
        color: '#1f2937',
        textAlign: 'center',
    },
    modalCancelButton: {
        marginTop: 15,
        paddingVertical: 12,
    },
    modalCancelText: {
        fontSize: 16,
        color: '#ef4444',
        textAlign: 'center',
        fontWeight: '600',
    },
});
