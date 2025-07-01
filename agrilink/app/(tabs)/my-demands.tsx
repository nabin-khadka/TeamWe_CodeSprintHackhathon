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
} from 'react-native';
import { useRouter } from 'expo-router';
import { demandAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface DemandResponse {
    sellerId: {
        _id: string;
        name: string;
        phone: string;
        sellerProfile?: {
            businessName?: string;
            contactInfo?: string;
            rating?: number;
        };
    };
    message: string;
    price?: number;
    contactInfo?: string;
    createdAt: string;
}

interface MyDemand {
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
    responses: DemandResponse[];
    createdAt: string;
}

export default function MyDemandsPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const [demands, setDemands] = useState<MyDemand[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedDemand, setSelectedDemand] = useState<MyDemand | null>(null);
    const [showResponsesModal, setShowResponsesModal] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            Alert.alert(
                'Authentication Required',
                'Please login to view your demands.',
                [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/login'),
                    },
                ]
            );
            return;
        }

        if (user?.userType !== 'buyer') {
            Alert.alert(
                'Access Denied',
                'Only buyers can view demands.',
                [
                    {
                        text: 'OK',
                        onPress: () => router.back(),
                    },
                ]
            );
            return;
        }

        fetchMyDemands();
    }, [isAuthenticated, user]);

    const fetchMyDemands = async () => {
        try {
            setLoading(true);
            const response = await demandAPI.getMyDemands();
            setDemands(response);
        } catch (error) {
            console.error('Error fetching my demands:', error);
            Alert.alert('Error', 'Failed to fetch your demands. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchMyDemands();
        setRefreshing(false);
    };

    const handleViewResponses = (demand: MyDemand) => {
        setSelectedDemand(demand);
        setShowResponsesModal(true);
    };

    const handleUpdateStatus = async (demandId: string, newStatus: 'active' | 'fulfilled' | 'cancelled') => {
        try {
            await demandAPI.updateDemandStatus(demandId, newStatus);
            Alert.alert('Success', `Demand marked as ${newStatus}`);
            await fetchMyDemands(); // Refresh the list
        } catch (error) {
            console.error('Error updating demand status:', error);
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update demand status.');
        }
    };

    const showStatusOptions = (demand: MyDemand) => {
        Alert.alert(
            'Update Demand Status',
            'Choose the new status for this demand:',
            [
                {
                    text: 'Mark as Fulfilled',
                    onPress: () => handleUpdateStatus(demand._id, 'fulfilled'),
                    style: 'default',
                },
                {
                    text: 'Cancel Demand',
                    onPress: () => handleUpdateStatus(demand._id, 'cancelled'),
                    style: 'destructive',
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ]
        );
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
                <Text style={styles.headerTitle}>My Demands</Text>
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
                        <Text style={styles.loadingText}>Loading your demands...</Text>
                    </View>
                ) : demands.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No demands posted yet</Text>
                        <Text style={styles.emptySubtext}>
                            Start posting demands to connect with sellers
                        </Text>
                        <TouchableOpacity
                            style={styles.postButton}
                            onPress={() => router.push('/demand')}
                        >
                            <Text style={styles.postButtonText}>Post Your First Demand</Text>
                        </TouchableOpacity>
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
                                    <Text style={styles.detailLabel}>Posted: </Text>
                                    {formatDate(demand.createdAt)}
                                </Text>
                                <Text style={styles.detailText}>
                                    <Text style={styles.detailLabel}>Responses: </Text>
                                    {demand.responses.length}
                                </Text>
                            </View>

                            <View style={styles.actionButtons}>
                                {demand.responses.length > 0 && (
                                    <TouchableOpacity
                                        style={styles.viewResponsesButton}
                                        onPress={() => handleViewResponses(demand)}
                                    >
                                        <Text style={styles.viewResponsesButtonText}>
                                            View Responses ({demand.responses.length})
                                        </Text>
                                    </TouchableOpacity>
                                )}

                                {demand.status === 'active' && (
                                    <TouchableOpacity
                                        style={styles.statusButton}
                                        onPress={() => showStatusOptions(demand)}
                                    >
                                        <Text style={styles.statusButtonText}>Update Status</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Responses Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showResponsesModal}
                onRequestClose={() => setShowResponsesModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Seller Responses</Text>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setShowResponsesModal(false)}
                            >
                                <Text style={styles.modalCloseText}>×</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.responsesContainer}>
                            {selectedDemand?.responses.map((response, index) => (
                                <View key={index} style={styles.responseCard}>
                                    <View style={styles.responseHeader}>
                                        <Text style={styles.sellerName}>
                                            {response.sellerId.sellerProfile?.businessName || response.sellerId.name}
                                        </Text>
                                        {response.sellerId.sellerProfile?.rating && (
                                            <Text style={styles.sellerRating}>
                                                ⭐ {response.sellerId.sellerProfile.rating.toFixed(1)}
                                            </Text>
                                        )}
                                    </View>

                                    <Text style={styles.responseMessage}>{response.message}</Text>

                                    {response.price && (
                                        <Text style={styles.responsePrice}>
                                            Price: ${response.price}
                                        </Text>
                                    )}

                                    <Text style={styles.contactInfo}>
                                        Contact: {response.contactInfo || response.sellerId.phone}
                                    </Text>

                                    <Text style={styles.responseDate}>
                                        {formatDate(response.createdAt)}
                                    </Text>
                                </View>
                            )) || (
                                    <Text style={styles.noResponsesText}>No responses yet</Text>
                                )}
                        </ScrollView>
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
        marginBottom: 20,
    },
    postButton: {
        backgroundColor: '#22c55e',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    postButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
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
    actionButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    viewResponsesButton: {
        flex: 1,
        backgroundColor: '#3b82f6',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    viewResponsesButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    statusButton: {
        flex: 1,
        backgroundColor: '#6b7280',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    statusButtonText: {
        color: '#ffffff',
        fontSize: 14,
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
        width: '90%',
        maxWidth: 400,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    modalCloseButton: {
        padding: 5,
    },
    modalCloseText: {
        fontSize: 24,
        color: '#6b7280',
    },
    responsesContainer: {
        padding: 20,
    },
    responseCard: {
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    responseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    sellerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    sellerRating: {
        fontSize: 14,
        color: '#6b7280',
    },
    responseMessage: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 8,
        lineHeight: 20,
    },
    responsePrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#22c55e',
        marginBottom: 4,
    },
    contactInfo: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 4,
    },
    responseDate: {
        fontSize: 12,
        color: '#9ca3af',
    },
    noResponsesText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#6b7280',
        marginTop: 20,
    },
});
