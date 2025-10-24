import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'icon';

type ButtonProps = {
  onPress: () => void;
  title?: string;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: object;
  children?: React.ReactNode;
};

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
  children,
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          gradient: ['#667eea', '#764ba2'],
          container: styles.primaryContainer,
          text: styles.primaryText,
          iconColor: '#fff',
        };
      case 'secondary':
        return {
          gradient: ['#f2f2f2', '#e6e6e6'],
          container: styles.secondaryContainer,
          text: styles.secondaryText,
          iconColor: '#333',
        };
      case 'danger':
        return {
          gradient: ['#ff6b6b', '#ee5253'],
          container: styles.dangerContainer,
          text: styles.dangerText,
          iconColor: '#fff',
        };
      case 'outline':
        return {
          gradient: ['transparent', 'transparent'],
          container: styles.outlineContainer,
          text: styles.outlineText,
          iconColor: '#667eea',
        };
      case 'icon':
        return {
          gradient: ['transparent', 'transparent'],
          container: styles.iconContainer,
          text: {},
          iconColor: '#667eea',
        };
      default:
        return {
          gradient: ['#667eea', '#764ba2'],
          container: styles.primaryContainer,
          text: styles.primaryText,
          iconColor: '#fff',
        };
    }
  };

  const { gradient, container, text, iconColor } = getVariantStyle();
  const isDisabled = loading || disabled;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, container, isDisabled && styles.disabled, style]}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={gradient as any}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'primary' ? '#fff' : '#333'} size="small" />
        ) : (
          <>
            {children ? (
              typeof children === 'string' ? (
                <Text style={[styles.text, text]}>{children}</Text>
              ) : (
                children
              )
            ) : (
              <View style={styles.content}>
                {icon && <Ionicons name={icon} size={20} color={iconColor} style={styles.icon} />}
                {title && <Text style={[styles.text, text]}>{title}</Text>}
              </View>
            )}
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  gradient: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  icon: {
    marginRight: 8,
  },
  disabled: {
    opacity: 0.6,
    elevation: 0,
  },
  // Primary styles
  primaryContainer: {},
  primaryText: {
    color: '#fff',
  },
  // Secondary styles
  secondaryContainer: {
    backgroundColor: '#f2f2f2',
  },
  secondaryText: {
    color: '#333',
  },
  // Danger styles
  dangerContainer: {},
  dangerText: {
    color: '#fff',
  },
  // Outline styles
  outlineContainer: {
    borderWidth: 2,
    borderColor: '#667eea',
    backgroundColor: 'transparent',
    elevation: 0,
  },
  outlineText: {
    color: '#667eea',
  },
  iconContainer: {
    backgroundColor: 'transparent',
    elevation: 0,
    padding: 8,
    borderRadius: 50,
  },
});

export default Button;
