import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Define User type locally to avoid import issues
interface User {
    id: number;
    name: string;
    email: string;
    picture?: string;
    [key: string]: any;
}

interface ProfileHeaderProps {
    user: User;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
    return (
        <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.profileImageContainer}>
                {user.picture ? (
                    <Image source={{ uri: user.picture }} style={styles.profileImage} />
                ) : (
                    <Ionicons name="person-circle" size={90} color="#fff" />
                )}
            </View>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 30,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    profileImageContainer: {
        marginBottom: 15,
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileImage: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 3,
        borderColor: '#fff',
    },
    userName: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    userEmail: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
    },
});

export default ProfileHeader;
