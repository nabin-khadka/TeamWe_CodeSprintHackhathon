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
    Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { postingAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface Posting {
    _id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    images: string[];
    active: boolean;
    sellerId: {
        _id: string;
        name: string;
        sellerProfile?: {
            businessName?: string;
            rating?: number;
        };
    };
    createdAt: string;
}

export default function MyProductsPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const [postings, setPostings] = useState<Posting[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            Alert.alert(
                'Authentication Required',
                'Please login to view your products.',
                [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/login'),
                    },
                ]
            );
            return;
        }

        if (user?.userType !== 'seller') {
            Alert.alert(
                'Access Denied',
                'Only sellers can view products.',
                [
                    {
                        text: 'OK',
                        onPress: () => router.back(),
                    },
                ]
            );
            return;
        }

        fetchMyPostings();
    }, [isAuthenticated, user]);

    const fetchMyPostings = async () => {
        try {
            setLoading(true);
            const response = await postingAPI.getMyPostings();
            setPostings(response);
        } catch (error) {
            console.error('Error fetching my postings:', error);
            Alert.alert('Error', 'Failed to fetch your products. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchMyPostings();
        setRefreshing(false);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const formatPrice = (price: number) => {
        return `₹${price.toFixed(2)}`;
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
                <Text style={styles.headerTitle}>My Products</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => router.push('/post-product')}
                >
                    <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
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
                        <Text style={styles.loadingText}>Loading your products...</Text>
                    </View>
                ) : postings.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No products posted yet</Text>
                        <Text style={styles.emptySubtext}>
                            Start posting products to reach more buyers
                        </Text>
                        <TouchableOpacity
                            style={styles.postButton}
                            onPress={() => router.push('/post-product')}
                        >
                            <Text style={styles.postButtonText}>Post Your First Product</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    postings.map((posting) => (
                        <View key={posting._id} style={styles.productCard}>
                            <View style={styles.productHeader}>
                                <View style={styles.productInfo}>
                                    <Text style={styles.productTitle}>{posting.title}</Text>
                                    <Text style={styles.productCategory}>{posting.category}</Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: posting.active ? '#22c55e' : '#ef4444' }]}>
                                    <Text style={styles.statusText}>{posting.active ? 'ACTIVE' : 'INACTIVE'}</Text>
                                </View>
                            </View>

                            {posting.images.length > 0 && (
                                <Image
                                    source={{ uri: posting.images[0] }}
                                    style={styles.productImage}
                                    resizeMode="cover"
                                />
                            )}

                            <View style={styles.productDetails}>
                                <Text style={styles.productPrice}>{formatPrice(posting.price)} per kg</Text>
                                <Text style={styles.productDescription} numberOfLines={2}>
                                    {posting.description}
                                </Text>
                                <Text style={styles.postedDate}>
                                    Posted: {formatDate(posting.createdAt)}
                                </Text>
                            </View>

                            <View style={styles.actionButtons}>
                                <TouchableOpacity
                                    style={styles.viewButton}
                                    onPress={() => {
                                        // Navigate to product details or edit page
                                        Alert.alert('View Product', 'Product details view coming soon!');
                                    }}
                                >
                                    <Text style={styles.viewButtonText}>View Details</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.editButton}
                                    onPress={() => {
                                        // Navigate to edit product page
                                        Alert.alert('Edit Product', 'Product editing coming soon!');
                                    }}
                                >
                                    <Text style={styles.editButtonText}>Edit</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
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
    addButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#22c55e',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonText: {
        fontSize: 24,
        color: '#ffffff',
        fontWeight: 'bold',
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
    productCard: {
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
    productHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    productInfo: {
        flex: 1,
    },
    productTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    productCategory: {
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
    productImage: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginBottom: 12,
    },
    productDetails: {
        marginBottom: 16,
    },
    productPrice: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#22c55e',
        marginBottom: 8,
    },
    productDescription: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
        marginBottom: 8,
    },
    postedDate: {
        fontSize: 12,
        color: '#9ca3af',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    viewButton: {
        flex: 1,
        backgroundColor: '#3b82f6',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    viewButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    editButton: {
        flex: 1,
        backgroundColor: '#f59e0b',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    editButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
