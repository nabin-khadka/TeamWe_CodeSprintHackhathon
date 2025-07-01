import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Alert,
    RefreshControl,
    Modal,
    TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { demandAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface Demand {
    _id: string;
    productType: string;
    productName: string;
    quantity: string;
    deliveryDate: string;
    deliveryLocation: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    status: 'active' | 'fulfilled' | 'cancelled';
    buyerId: {
        name: string;
        phone: string;
    };
    responses: any[];
    createdAt: string;
}

export default function DemandListPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const [demands, setDemands] = useState<Demand[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedDemand, setSelectedDemand] = useState<Demand | null>(null);
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    const [responsePrice, setResponsePrice] = useState('');
    const [responseContact, setResponseContact] = useState('');
    const [filterType, setFilterType] = useState<string>('');

    useEffect(() => {
        if (!isAuthenticated) {
            Alert.alert(
                'Authentication Required',
                'Please login to view demands.',
                [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/login'),
                    },
                ]
            );
            return;
        }
        fetchDemands();
    }, [isAuthenticated, filterType]);

    const fetchDemands = async () => {
        try {
            setLoading(true);
            const filters: any = {};
            if (filterType) {
                filters.productType = filterType;
            }
            const response = await demandAPI.getDemands(filters);
            setDemands(response);
        } catch (error) {
            console.error('Error fetching demands:', error);
            Alert.alert('Error', 'Failed to fetch demands. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchDemands();
        setRefreshing(false);
    };

    const handleRespondToDemand = (demand: Demand) => {
        setSelectedDemand(demand);
        setResponseMessage('');
        setResponsePrice('');
        setResponseContact(user?.sellerProfile?.contactInfo || user?.phone || '');
        setShowResponseModal(true);
    };

    const submitResponse = async () => {
        if (!selectedDemand || !responseMessage.trim()) {
            Alert.alert('Missing Information', 'Please provide a response message.');
            return;
        }

        try {
            const responseData: any = {
                message: responseMessage.trim(),
            };

            if (responsePrice.trim()) {
                const price = parseFloat(responsePrice);
                if (!isNaN(price)) {
                    responseData.price = price;
                }
            }

            if (responseContact.trim()) {
                responseData.contactInfo = responseContact.trim();
            }

            await demandAPI.respondToDemand(selectedDemand._id, responseData);

            Alert.alert('Success', 'Your response has been sent to the buyer!');
            setShowResponseModal(false);
            setSelectedDemand(null);
            await fetchDemands(); // Refresh the list
        } catch (error) {
            console.error('Error responding to demand:', error);
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to send response. Please try again.');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return '#22c55e';
            case 'fulfilled': return '#3b82f6';
            case 'cancelled': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const filterButtons = [
        { label: 'All', value: '' },
        { label: 'Fruits', value: 'Fruits' },
        { label: 'Vegetables', value: 'Vegetables' },
    ];

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
                <Text style={styles.headerTitle}>Available Demands</Text>
            </View>

            {/* Filter Buttons */}
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {filterButtons.map((filter) => (
                        <TouchableOpacity
                            key={filter.value}
                            style={[
                                styles.filterButton,
                                filterType === filter.value && styles.filterButtonActive
                            ]}
                            onPress={() => setFilterType(filter.value)}
                        >
                            <Text style={[
                                styles.filterButtonText,
                                filterType === filter.value && styles.filterButtonTextActive
                            ]}>
                                {filter.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Content */}
            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Loading demands...</Text>
                    </View>
                ) : demands.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No demands found</Text>
                        <Text style={styles.emptySubtext}>
                            {filterType ? `No ${filterType.toLowerCase()} demands available` : 'No demands are currently posted'}
                        </Text>
                    </View>
                ) : (
                    demands.map((demand) => (
                        <View key={demand._id} style={styles.demandCard}>
                            <View style={styles.demandHeader}>
                                <View style={styles.demandInfo}>
                                    <Text style={styles.productName}>{demand.productName}</Text>
                                    <Text style={styles.productType}>{demand.productType}</Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(demand.status) }]}>
                                    <Text style={styles.statusText}>{demand.status.toUpperCase()}</Text>
                                </View>
                            </View>

                            <View style={styles.demandDetails}>
                                <Text style={styles.detailText}>
                                    <Text style={styles.detailLabel}>Quantity: </Text>
                                    {demand.quantity}
                                </Text>
                                <Text style={styles.detailText}>
                                    <Text style={styles.detailLabel}>Delivery Date: </Text>
                                    {demand.deliveryDate}
                                </Text>
                                <Text style={styles.detailText}>
                                    <Text style={styles.detailLabel}>Location: </Text>
                                    {demand.deliveryLocation}
                                </Text>
                                <Text style={styles.detailText}>
                                    <Text style={styles.detailLabel}>Buyer: </Text>
                                    {demand.buyerId.name}
                                </Text>
                                <Text style={styles.detailText}>
                                    <Text style={styles.detailLabel}>Posted: </Text>
                                    {formatDate(demand.createdAt)}
                                </Text>
                                {demand.responses.length > 0 && (
                                    <Text style={styles.detailText}>
                                        <Text style={styles.detailLabel}>Responses: </Text>
                                        {demand.responses.length}
                                    </Text>
                                )}
                            </View>

                            {demand.status === 'active' && user?.userType === 'seller' && (
                                <TouchableOpacity
                                    style={styles.respondButton}
                                    onPress={() => handleRespondToDemand(demand)}
                                >
                                    <Text style={styles.respondButtonText}>Respond to Demand</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Response Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showResponseModal}
                onRequestClose={() => setShowResponseModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Respond to Demand</Text>

                        <Text style={styles.inputLabel}>Message *</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Enter your response message..."
                            value={responseMessage}
                            onChangeText={setResponseMessage}
                            multiline={true}
                            numberOfLines={4}
                        />

                        <Text style={styles.inputLabel}>Price (Optional)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your price..."
                            value={responsePrice}
                            onChangeText={setResponsePrice}
                            keyboardType="numeric"
                        />

                        <Text style={styles.inputLabel}>Contact Info</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your contact information..."
                            value={responseContact}
                            onChangeText={setResponseContact}
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setShowResponseModal(false)}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalSubmitButton}
                                onPress={submitResponse}
                            >
                                <Text style={styles.modalSubmitText}>Send Response</Text>
                            </TouchableOpacity>
                        </View>
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
    },
    backButton: {
        padding: 5,
        marginRight: 15,
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
    filterContainer: {
        backgroundColor: '#ffffff',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 10,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    filterButtonActive: {
        backgroundColor: '#22c55e',
        borderColor: '#22c55e',
    },
    filterButtonText: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
    },
    filterButtonTextActive: {
        color: '#ffffff',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    loadingText: {
        fontSize: 16,
        color: '#6b7280',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 5,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
    },
    demandCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    demandHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    demandInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    productType: {
        fontSize: 14,
        color: '#6b7280',
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        color: '#ffffff',
        fontWeight: 'bold',
    },
    demandDetails: {
        marginBottom: 16,
    },
    detailText: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 4,
    },
    detailLabel: {
        fontWeight: '600',
        color: '#1f2937',
    },
    respondButton: {
        backgroundColor: '#22c55e',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    respondButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
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
        width: '90%',
        maxWidth: 400,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 8,
        marginTop: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#ffffff',
        marginBottom: 10,
    },
    textArea: {
        height: 80,
        paddingTop: 12,
        textAlignVertical: 'top',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 10,
    },
    modalCancelButton: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    modalCancelText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '600',
    },
    modalSubmitButton: {
        flex: 1,
        backgroundColor: '#22c55e',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    modalSubmitText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
