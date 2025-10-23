import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert,
    ActivityIndicator,
    ScrollView,
    Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { generateRecipeFromImage } from '@/service/AiModel';
import { LinearGradient } from 'expo-linear-gradient';
import Button from './Button';

export default function ImageRecipeGenerator() {
    const [image, setImage] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [recipe, setRecipe] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need camera roll access to pick an image.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
            base64: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImage(result.assets[0].uri);
            if (result.assets[0].base64) {
                setImageBase64(result.assets[0].base64);
            }
            setRecipe(null); // Reset recipe when new image is picked
        }
    };

    const handleGenerateRecipe = async () => {
        if (!imageBase64) {
            Alert.alert('No Image Data', 'Could not read image data. Please try selecting the image again.');
            return;
        }

        console.log('Generating recipe with base64 image data (first 100 chars):', imageBase64.substring(0, 100));
        setLoading(true);
        setRecipe(null);

        try {
            const generatedRecipe = await generateRecipeFromImage(imageBase64);
            setRecipe(generatedRecipe);
        } catch (error) {
            Alert.alert('Error', 'Failed to generate recipe. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
                <Text style={styles.headerTitle}>Snap & Cook</Text>
                <Text style={styles.headerSubtitle}>Generate recipes from your food photos</Text>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.image} />
                    ) : (
                        <View style={styles.placeholder}>
                            <Ionicons name="camera-outline" size={50} color="#667eea" />
                            <Text style={styles.placeholderText}>Tap to select an image</Text>
                        </View>
                    )}
                    <View style={styles.editIcon}>
                        <Ionicons name="pencil" size={20} color="#fff" />
                    </View>
                </TouchableOpacity>

                <Button
                    title={loading ? 'Generating...' : 'Generate Recipe'}
                    onPress={handleGenerateRecipe}
                    variant="primary"
                    icon="sparkles-outline"
                    disabled={!image || loading}
                    style={{ marginVertical: 20 }}
                />

                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#667eea" />
                        <Text style={styles.loadingText}>Our AI chef is at work...</Text>
                    </View>
                )}

                {recipe && (
                    <View style={styles.recipeContainer}>
                        <Text style={styles.recipeTitle}>AI Generated Recipe</Text>
                        <Text style={styles.recipeText}>{recipe}</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 5,
    },
    content: {
        padding: 20,
    },
    imagePicker: {
        width: '100%',
        height: 250,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderStyle: 'dashed',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 18,
    },
    placeholder: {
        alignItems: 'center',
    },
    placeholderText: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: '600',
        color: '#667eea',
    },
    editIcon: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: '#667eea',
        padding: 8,
        borderRadius: 20,
    },
    loadingContainer: {
        alignItems: 'center',
        marginVertical: 30,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    recipeContainer: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        marginTop: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    recipeTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        textAlign: 'center',
    },
    recipeText: {
        fontSize: 16,
        lineHeight: 26,
        color: '#555',
    },
});
