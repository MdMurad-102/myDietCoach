import React, { useState, useContext, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { UserContext } from '@/context/UserContext';
import { useRouter } from 'expo-router';
import { GenerateRecipeAi } from '@/service/AiModel';
import { searchFoods, getFoodByName } from '@/utils/foodDatabase';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
    foodAnalysis?: FoodAnalysisResult;
}

interface FoodAnalysisResult {
    foodName: string;
    calories: number;
    isHealthy: boolean;
    recommendation: string;
    alternatives?: string[];
}

export default function EnhancedAIChat() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hello! I'm your AI Nutritionist 🥗 I can help you with:\n\n• Food analysis ('Is rice healthy for me?')\n• Calorie estimation ('How many calories in paratha?')\n• Diet advice tailored to your goals\n• Healthier alternatives\n• Meal suggestions\n\nWhat would you like to know?",
            isUser: false,
            timestamp: new Date(),
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const context = useContext(UserContext);
    const router = useRouter();

    if (!context) {
        throw new Error('UserContext must be used within a UserProvider');
    }

    const { user } = context;

    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [messages]);

    const analyzeFoodInput = (message: string): string | null => {
        const foodKeywords = [
            'rice', 'chicken', 'fish', 'egg', 'paratha', 'roti', 'dal', 'daal',
            'biriyani', 'khichuri', 'vegetables', 'fruit', 'banana',
            'beef', 'mutton', 'hilsa', 'ilish', 'bread', 'pitha', 'pithas',
            'curry', 'vorta', 'bhaji', 'torkari', 'begun', 'alu', 'potato',
            'shorshe', 'mustard', 'coconut', 'narikel', 'doi', 'yogurt',
            'chingri', 'prawn', 'shutki', 'dried fish', 'macher', 'mangsho',
            'polao', 'khichdi', 'panta bhat', 'puri', 'luchi', 'singara',
            'samosa', 'jilapi', 'sandesh', 'rasogolla', 'mishti', 'sweet',
        ];

        const lowerMessage = message.toLowerCase();

        for (const keyword of foodKeywords) {
            if (lowerMessage.includes(keyword)) {
                return keyword;
            }
        }

        return null;
    };

    const isQuestionAboutFood = (message: string): boolean => {
        const patterns = [
            'is .* healthy',
            'is .* good for',
            'can i eat',
            'should i eat',
            'is .* okay',
            'how many calories',
            'calories in',
        ];

        const lowerMessage = message.toLowerCase();
        return patterns.some(pattern => new RegExp(pattern).test(lowerMessage));
    };

    const generateAIResponse = async (userMessage: string): Promise<string> => {
        try {
            const foodDetected = analyzeFoodInput(userMessage);
            const userInfo = user ? {
                goal: user.goal,
                calories: user.calories,
                weight: user.weight,
                height: user.height,
                age: user.age,
                diet_type: user.diet_type,
            } : null;

            // Check if it's a food-related question
            if (isQuestionAboutFood(userMessage) || foodDetected) {
                const prompt = `
You are an expert nutrition advisor for a Bangladeshi diet app called "My Diet Coach".

USER QUESTION: "${userMessage}"

USER PROFILE:
- Health Goal: ${userInfo?.goal || 'General wellness'}
- Current Weight: ${userInfo?.weight || 'Not specified'} kg
- Diet Preference: ${userInfo?.diet_type || 'No restrictions'}
- Daily Calorie Target: ${userInfo?.calories || '2000'} kcal
- Age: ${userInfo?.age || 'Adult'}

BANGLADESHI FOOD DATABASE CONTEXT:
You have access to knowledge about traditional Bangladeshi foods including:
- Rice dishes: Plain rice, Polao, Khichuri, Biriyani, Tehari
- Bread: Roti, Paratha, Naan, Luchi, Puri
- Protein: Fish (Hilsa, Rui, Katla), Chicken, Beef, Eggs, Dal
- Vegetables: Begun Bhaji, Alu Vorta, Shak Bhaji
- Snacks: Singara, Samosa, Pitha varieties, Chotpoti
- Sweets: Rasgulla, Sandesh, Mishti Doi

RESPONSE FORMAT:
1. **Direct Answer** to their question (2-3 sentences)
2. **Nutritional Info**: Calories, protein, carbs if relevant
3. **For Their Goal**: How this fits their ${userInfo?.goal || 'goals'} (weight loss/gain/maintain)
4. **Healthier Alternatives**: 2-3 better options with brief explanation
5. **Portion Advice**: Recommended serving size for Bangladeshi context

IMPORTANT:
- Be culturally sensitive and understand Bangladeshi food culture
- Acknowledge that rice is a staple and suggest balance, not elimination
- Recommend local, accessible alternatives
- Keep response conversational and supportive (max 150 words)
- Use emojis sparingly for emphasis 🥗💪

Answer their question now:`;

                const aiResponse = await GenerateRecipeAi(prompt);
                return aiResponse || 'I understand you\'re asking about food. Could you rephrase your question? For example: "Is rice healthy for weight loss?" or "How many calories in paratha?"';
            }

            // General nutrition questions
            const prompt = `
You are a friendly, knowledgeable nutrition coach for "My Diet Coach" - a Bangladeshi diet tracking app.

USER QUESTION: "${userMessage}"

USER PROFILE:
- Goal: ${userInfo?.goal || 'General wellness'}
- Diet Type: ${userInfo?.diet_type || 'No restrictions'}
- Calorie Target: ${userInfo?.calories || '2000'} kcal/day

CONTEXT:
- This is a Bangladeshi user
- Be culturally aware (rice, fish, spices are dietary staples)  
- Understand local meal patterns (breakfast, lunch, dinner)
- Ramadan fasting may be relevant

PROVIDE:
- Clear, actionable advice (3-4 sentences)
- Culturally appropriate suggestions
- Encourage healthy habits without extreme restrictions
- Be supportive and motivating

Keep response under 120 words. Use simple language.`;

            const aiResponse = await GenerateRecipeAi(prompt);
            return aiResponse || 'I can help with nutrition questions, food analysis, meal planning, and health tips. What would you like to know?';

        } catch (error) {
            console.error('AI Response Error:', error);
            return "I'm having trouble connecting right now. Please try again in a moment! 🙏";
        }
    };

    const sendMessage = async () => {
        if (!inputText.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText.trim(),
            isUser: true,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            const aiResponse = await generateAIResponse(userMessage.text);

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: aiResponse,
                isUser: false,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            Alert.alert('Error', 'Failed to get response. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const quickQuestions = [
        { icon: 'fast-food', text: 'Is biriyani okay for my diet?' },
        { icon: 'calculator', text: 'How many calories in paratha?' },
        { icon: 'restaurant', text: 'Suggest healthy breakfast' },
        { icon: 'water', text: 'How much water should I drink?' },
        { icon: 'fitness', text: 'Best foods for weight loss' },
    ];

    const handleQuickQuestion = (question: string) => {
        setInputText(question);
    };

    if (!user) {
        return (
            <View style={styles.container}>
                <LinearGradient colors={['#667eea', '#764ba2']} style={styles.loginPrompt}>
                    <Ionicons name="chatbubbles" size={80} color="#fff" />
                    <Text style={styles.loginTitle}>AI Nutritionist Chat</Text>
                    <Text style={styles.loginSubtitle}>
                        Please login to access personalized nutrition advice
                    </Text>
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => router.push('/Sign/SignIn')}
                    >
                        <Text style={styles.loginButtonText}>Login</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Header */}
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>AI Nutritionist</Text>
                    <View style={styles.statusContainer}>
                        <View style={styles.onlineDot} />
                        <Text style={styles.headerSubtitle}>Online • Ready to help</Text>
                    </View>
                </View>
                <Ionicons name="nutrition" size={28} color="#fff" />
            </LinearGradient>

            {/* Quick Questions */}
            {messages.length <= 1 && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.quickQuestionsContainer}
                    contentContainerStyle={styles.quickQuestionsContent}
                >
                    {quickQuestions.map((q, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.quickQuestionButton}
                            onPress={() => handleQuickQuestion(q.text)}
                        >
                            <Ionicons name={q.icon as any} size={20} color="#667eea" />
                            <Text style={styles.quickQuestionText}>{q.text}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            {/* Messages */}
            <ScrollView
                ref={scrollViewRef}
                style={styles.messagesContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.messagesContent}
            >
                {messages.map((message) => (
                    <View
                        key={message.id}
                        style={[
                            styles.messageContainer,
                            message.isUser ? styles.userMessageContainer : styles.aiMessageContainer,
                        ]}
                    >
                        {!message.isUser && (
                            <View style={styles.aiAvatar}>
                                <Ionicons name="nutrition" size={18} color="#fff" />
                            </View>
                        )}
                        <View
                            style={[
                                styles.messageBubble,
                                message.isUser ? styles.userBubble : styles.aiBubble,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.messageText,
                                    message.isUser && styles.userText,
                                ]}
                            >
                                {message.text}
                            </Text>
                            <Text
                                style={[
                                    styles.timestamp,
                                    message.isUser && styles.userTimestamp,
                                ]}
                            >
                                {message.timestamp.toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </Text>
                        </View>
                        {message.isUser && (
                            <View style={styles.userAvatar}>
                                <Ionicons name="person" size={18} color="#fff" />
                            </View>
                        )}
                    </View>
                ))}

                {isLoading && (
                    <View style={[styles.messageContainer, styles.aiMessageContainer]}>
                        <View style={styles.aiAvatar}>
                            <Ionicons name="nutrition" size={18} color="#fff" />
                        </View>
                        <View style={[styles.messageBubble, styles.aiBubble, styles.loadingBubble]}>
                            <View style={styles.loadingDots}>
                                <View style={[styles.dot, styles.dot1]} />
                                <View style={[styles.dot, styles.dot2]} />
                                <View style={[styles.dot, styles.dot3]} />
                            </View>
                        </View>
                    </View>
                )}

                <View style={{ height: 20 }} />
            </ScrollView>

            {/* Input Area */}
            <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="Ask about any food..."
                        placeholderTextColor="#999"
                        value={inputText}
                        onChangeText={setInputText}
                        onSubmitEditing={sendMessage}
                        multiline
                        maxLength={500}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                        onPress={sendMessage}
                        disabled={!inputText.trim() || isLoading}
                    >
                        <LinearGradient
                            colors={inputText.trim() ? ['#667eea', '#764ba2'] : ['#ccc', '#aaa']}
                            style={styles.sendGradient}
                        >
                            <Ionicons name="send" size={20} color="#fff" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        gap: 15,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerInfo: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    onlineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4CAF50',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
    },
    quickQuestionsContainer: {
        maxHeight: 70,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    quickQuestionsContent: {
        padding: 15,
        gap: 10,
    },
    quickQuestionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f4ff',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 8,
        borderWidth: 1,
        borderColor: '#667eea',
    },
    quickQuestionText: {
        fontSize: 14,
        color: '#667eea',
        fontWeight: '500',
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        padding: 20,
    },
    messageContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 10,
    },
    userMessageContainer: {
        justifyContent: 'flex-end',
    },
    aiMessageContainer: {
        justifyContent: 'flex-start',
    },
    aiAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#667eea',
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageBubble: {
        maxWidth: '70%',
        borderRadius: 16,
        padding: 12,
    },
    userBubble: {
        backgroundColor: '#667eea',
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        backgroundColor: '#fff',
        borderBottomLeftRadius: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
        color: '#212121',
    },
    userText: {
        color: '#fff',
    },
    timestamp: {
        fontSize: 11,
        color: '#999',
        marginTop: 6,
    },
    userTimestamp: {
        color: 'rgba(255,255,255,0.8)',
    },
    loadingBubble: {
        paddingVertical: 16,
    },
    loadingDots: {
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#667eea',
    },
    dot1: {
        opacity: 0.4,
    },
    dot2: {
        opacity: 0.7,
    },
    dot3: {
        opacity: 1,
    },
    inputContainer: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingHorizontal: 15,
        paddingVertical: 10,
        paddingBottom: Platform.OS === 'ios' ? 30 : 10,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
    },
    input: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        maxHeight: 100,
        color: '#212121',
    },
    sendButton: {
        borderRadius: 24,
        overflow: 'hidden',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    sendGradient: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginPrompt: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    loginTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 20,
        marginBottom: 10,
    },
    loginSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        marginBottom: 30,
    },
    loginButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 40,
        paddingVertical: 14,
        borderRadius: 24,
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#667eea',
    },
});
