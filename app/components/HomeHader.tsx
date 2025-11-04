import { UserContext } from '@/context/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useContext } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeHeader() {
  const context = useContext(UserContext);
  const router = useRouter();

  if (!context) {
    throw new Error('UserContext must be used within a UserProvider');
  }

  const { user } = context;

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.profileContainer}>
        <Image
          source={require('../../assets/images/image1.png')}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.greeting}>Hello, 👋</Text>
          <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.notificationButton}
        onPress={() => {
          console.log('Notification button pressed');
          // For now, show alert since we don't have a notifications page yet
          alert('Notifications feature coming soon!');
        }}
      >
        <Ionicons name="notifications-outline" size={26} color="white" />
        <View style={styles.notificationBadge}>
          <Text style={styles.notificationText}>3</Text>
        </View>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    borderWidth: 2,
    borderColor: 'white',
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
  },
  notificationText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
