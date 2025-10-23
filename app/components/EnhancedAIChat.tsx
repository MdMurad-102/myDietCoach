import React, { useState, useContext, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { UserContext } from '@/context/UserContext';
import { generateRecipeFromText } from '@/service/AiModel';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
}

const initialMessage: Message = {
    id: '1',
    text: "Hello! I'm your AI Nutritionist 🥗\n\nI can help you analyze food, estimate calories, and provide diet advice. What's on your mind?",
    isUser: false,
};

const promptSuggestions = [
    "Is rice healthy for me?",
    "How many calories in a paratha?",
    "Suggest a healthy breakfast.",
];

const ChatHeader = () => (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <Text style={styles.headerTitle}>AI Nutritionist</Text>
        <Text style={styles.headerSubtitle}>Your personal diet assistant</Text>
    </LinearGradient>
);

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => (
    <View
        style={[
            styles.messageContainer,
            message.isUser ? styles.userMessageContainer : styles.aiMessageContainer,
        ]}
    >
        <LinearGradient
            colors={message.isUser ? ['#667eea', '#764ba2'] : ['#f1f1f1', '#e0e0e0']}
            style={styles.messageBubble}
        >
            <Text style={message.isUser ? styles.userMessageText : styles.aiMessageText}>
                {message.text}
            </Text>
        </LinearGradient>
    </View>
);

const PromptSuggestions: React.FC<{ onSend: (text: string) => void }> = ({ onSend }) => (
    <View style={styles.suggestionsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {promptSuggestions.map((prompt, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.suggestionChip}
                    onPress={() => onSend(prompt)}
                >
                    <Text style={styles.suggestionText}>{prompt}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    </View>
);

const ChatInput: React.FC<{
    onSend: (text: string) => void;
    isLoading: boolean;
}> = ({ onSend, isLoading }) => {
    const [inputText, setInputText] = useState('');

    const handleSend = () => {
        if (inputText.trim() && !isLoading) {
            onSend(inputText.trim());
            setInputText('');
        }
    };

    return (
        <View style={styles.inputContainer}>
            <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask about your diet..."
                placeholderTextColor="#999"
                editable={!isLoading}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={isLoading}>
                {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Ionicons name="send" size={22} color="#fff" />
                )}
            </TouchableOpacity>
        </View>
    );
};

export default function EnhancedAIChat() {
    const [messages, setMessages] = useState<Message[]>([initialMessage]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const context = useContext(UserContext);

    const { user } = context || {};

    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [messages]);

    const generateAIResponse = useCallback(async (userMessage: string): Promise<string> => {
        try {
            const userInfo = user ? {
                goal: user.goal,
                calories: user.calories,
                weight: user.weight,
                height: user.height,
                age: user.age,
                diet_type: user.diet_type,
            } : null;

            const prompt = `
        You are an expert nutrition advisor for a diet app.
        User Question: "${userMessage}"
        User Profile: ${JSON.stringify(userInfo, null, 2)}
        
        Please provide a concise, helpful, and supportive response (max 150 words).
        Focus on being practical and culturally relevant for a general audience.
      `;

            const aiResponse = await generateRecipeFromText(prompt);
            return aiResponse || "I'm not sure how to answer that. Could you ask in a different way?";
        } catch (error) {
            console.error('AI Response Error:', error);
            return "I'm having trouble connecting right now. Please try again in a moment! 🙏";
        }
    }, [user]);

    const sendMessage = useCallback(async (text: string) => {
        const userMessage: Message = {
            id: Date.now().toString(),
            text,
            isUser: true,
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);

        const aiResponseText = await generateAIResponse(text);

        const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: aiResponseText,
            isUser: false,
        };

        setMessages((prev) => [...prev, aiMessage]);
        setIsLoading(false);
    }, [generateAIResponse]);

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <ChatHeader />
            <ScrollView
                ref={scrollViewRef}
                style={styles.chatContainer}
                contentContainerStyle={styles.chatContent}
                showsVerticalScrollIndicator={false}
            >
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
                {isLoading && messages[messages.length - 1].isUser && (
                    <View style={styles.typingIndicatorContainer}>
                        <ActivityIndicator size="small" color="#667eea" />
                        <Text style={styles.typingText}>AI is thinking...</Text>
                    </View>
                )}
            </ScrollView>
            <View style={styles.footer}>
                {!isLoading && messages.length <= 1 && (
                    <PromptSuggestions onSend={sendMessage} />
                )}
                <ChatInput onSend={sendMessage} isLoading={isLoading} />
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
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        marginTop: 4,
    },
    chatContainer: {
        flex: 1,
    },
    chatContent: {
        padding: 10,
    },
    messageContainer: {
        marginVertical: 5,
        maxWidth: '85%',
    },
    userMessageContainer: {
        alignSelf: 'flex-end',
    },
    aiMessageContainer: {
        alignSelf: 'flex-start',
    },
    messageBubble: {
        padding: 15,
        borderRadius: 20,
    },
    userMessageText: {
        color: '#fff',
        fontSize: 16,
    },
    aiMessageText: {
        color: '#333',
        fontSize: 16,
    },
    typingIndicatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        padding: 10,
    },
    typingText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
    footer: {
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        backgroundColor: '#fff',
    },
    suggestionsContainer: {
        marginBottom: 10,
    },
    suggestionChip: {
        backgroundColor: '#eef2ff',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#c7d2fe',
    },
    suggestionText: {
        color: '#4338ca',
        fontSize: 14,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 30,
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    input: {
        flex: 1,
        paddingHorizontal: 12,
        fontSize: 16,
        height: 45,
    },
    sendButton: {
        backgroundColor: '#667eea',
        borderRadius: 25,
        width: 45,
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
