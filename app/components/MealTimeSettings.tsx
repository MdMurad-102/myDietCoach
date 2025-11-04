// Meal Time Settings Component - UI to set meal times and toggle notifications
import { MealTimings, useMealTiming } from '@/context/MealTimingContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

const MealTimeSettings: React.FC = () => {
    const { mealTimings, setMealTime, toggleMealNotification, requestNotificationPermissions } =
        useMealTiming();
    const [showPicker, setShowPicker] = useState<{ meal: keyof MealTimings; show: boolean } | null>(
        null
    );
    const [selectedHour, setSelectedHour] = useState(8);
    const [selectedMinute, setSelectedMinute] = useState(0);
    const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM');

    const handleTimeChange = async (meal: keyof MealTimings, hour: number, minute: number) => {
        await setMealTime(meal, hour, minute);
        setShowPicker(null);
    };

    const openPicker = (meal: keyof MealTimings) => {
        const mealTime = mealTimings[meal];
        if (!mealTime) return;

        let hour12 = mealTime.hour % 12;
        if (hour12 === 0) hour12 = 12;
        const period = mealTime.hour >= 12 ? 'PM' : 'AM';

        setSelectedHour(hour12);
        setSelectedMinute(mealTime.minute);
        setSelectedPeriod(period);
        setShowPicker({ meal, show: true });
    };

    const confirmTimeChange = () => {
        if (!showPicker) return;

        let hour24 = selectedHour === 12 ? 0 : selectedHour;
        if (selectedPeriod === 'PM') {
            hour24 += 12;
        }

        handleTimeChange(showPicker.meal, hour24, selectedMinute);
    };

    const handleToggle = async (meal: keyof MealTimings, value: boolean) => {
        if (value) {
            const hasPermission = await requestNotificationPermissions();
            if (!hasPermission) {
                alert('Please enable notifications in your device settings to receive meal reminders.');
                return;
            }
        }
        await toggleMealNotification(meal, value);
    };

    const formatTime = (hour: number, minute: number): string => {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const displayMinute = minute.toString().padStart(2, '0');
        return `${displayHour}:${displayMinute} ${period}`;
    };

    const getMealIcon = (meal: string): keyof typeof Ionicons.glyphMap => {
        switch (meal) {
            case 'breakfast':
                return 'sunny';
            case 'lunch':
                return 'restaurant';
            case 'dinner':
                return 'moon';
            case 'snack':
                return 'fast-food';
            default:
                return 'time';
        }
    };

    const renderMealTimeSetting = (
        meal: keyof MealTimings,
        label: string,
        icon: keyof typeof Ionicons.glyphMap
    ) => {
        const mealTime = mealTimings[meal];
        if (!mealTime) return null;

        return (
            <View style={styles.mealCard} key={meal}>
                <View style={styles.mealHeader}>
                    <View style={styles.mealTitleContainer}>
                        <View style={styles.iconWrapper}>
                            <Ionicons name={icon} size={24} color="#667eea" />
                        </View>
                        <View>
                            <Text style={styles.mealLabel}>{label}</Text>
                            <Text style={styles.mealTime}>{formatTime(mealTime.hour, mealTime.minute)}</Text>
                        </View>
                    </View>
                    <Switch
                        value={mealTime.enabled}
                        onValueChange={(value) => handleToggle(meal, value)}
                        trackColor={{ false: '#ddd', true: '#667eea' }}
                        thumbColor={mealTime.enabled ? '#fff' : '#f4f3f4'}
                    />
                </View>

                <TouchableOpacity
                    style={styles.changeTimeButton}
                    onPress={() => openPicker(meal)}
                >
                    <Ionicons name="time-outline" size={18} color="#667eea" />
                    <Text style={styles.changeTimeText}>Change Time</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="notifications-outline" size={24} color="#667eea" />
                <Text style={styles.headerTitle}>Meal Reminders</Text>
            </View>
            <Text style={styles.headerSubtitle}>
                Set times for your meals and receive notifications
            </Text>

            {renderMealTimeSetting('breakfast', 'Breakfast', 'sunny')}
            {renderMealTimeSetting('lunch', 'Lunch', 'restaurant')}
            {renderMealTimeSetting('dinner', 'Dinner', 'moon')}
            {renderMealTimeSetting('snack', 'Snack (Optional)', 'fast-food')}

            <View style={styles.infoCard}>
                <Ionicons name="information-circle-outline" size={20} color="#FF9800" />
                <Text style={styles.infoText}>
                    Enable notifications to receive meal time reminders and stay on track with your nutrition
                    goals.
                </Text>
            </View>

            <Modal
                visible={showPicker?.show || false}
                transparent
                animationType="slide"
                onRequestClose={() => setShowPicker(null)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowPicker(null)}
                >
                    <TouchableOpacity activeOpacity={1} style={styles.pickerModal}>
                        <Text style={styles.pickerTitle}>
                            Set {showPicker?.meal ? showPicker.meal.charAt(0).toUpperCase() + showPicker.meal.slice(1) : ''} Time
                        </Text>

                        <View style={styles.timePickerRow}>
                            <ScrollView style={styles.timePicker} showsVerticalScrollIndicator={false}>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                                    <TouchableOpacity
                                        key={hour}
                                        style={[
                                            styles.timeOption,
                                            selectedHour === hour && styles.selectedTimeOption
                                        ]}
                                        onPress={() => setSelectedHour(hour)}
                                    >
                                        <Text style={[
                                            styles.timeText,
                                            selectedHour === hour && styles.selectedTimeText
                                        ]}>
                                            {hour}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Text style={styles.timeSeparator}>:</Text>

                            <ScrollView style={styles.timePicker} showsVerticalScrollIndicator={false}>
                                {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                                    <TouchableOpacity
                                        key={minute}
                                        style={[
                                            styles.timeOption,
                                            selectedMinute === minute && styles.selectedTimeOption
                                        ]}
                                        onPress={() => setSelectedMinute(minute)}
                                    >
                                        <Text style={[
                                            styles.timeText,
                                            selectedMinute === minute && styles.selectedTimeText
                                        ]}>
                                            {minute.toString().padStart(2, '0')}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <View style={styles.periodPicker}>
                                <TouchableOpacity
                                    style={[
                                        styles.periodButton,
                                        selectedPeriod === 'AM' && styles.selectedPeriodButton
                                    ]}
                                    onPress={() => setSelectedPeriod('AM')}
                                >
                                    <Text style={[
                                        styles.periodText,
                                        selectedPeriod === 'AM' && styles.selectedPeriodText
                                    ]}>
                                        AM
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.periodButton,
                                        selectedPeriod === 'PM' && styles.selectedPeriodButton
                                    ]}
                                    onPress={() => setSelectedPeriod('PM')}
                                >
                                    <Text style={[
                                        styles.periodText,
                                        selectedPeriod === 'PM' && styles.selectedPeriodText
                                    ]}>
                                        PM
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.pickerButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowPicker(null)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={confirmTimeChange}
                            >
                                <Text style={styles.confirmButtonText}>Set Time</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 10,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    mealCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    mealHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    mealTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f0f0ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    mealLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    mealTime: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#667eea',
        marginTop: 2,
    },
    changeTimeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f0ff',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    changeTimeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#667eea',
        marginLeft: 6,
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#fff8e1',
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#666',
        marginLeft: 10,
        lineHeight: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    pickerModal: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        width: '100%',
        maxWidth: 400,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    pickerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
    },
    timePickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    timePicker: {
        height: 150,
        width: 60,
    },
    timeSeparator: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#667eea',
        marginHorizontal: 10,
    },
    timeOption: {
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedTimeOption: {
        backgroundColor: '#f0f0ff',
        borderRadius: 8,
    },
    timeText: {
        fontSize: 20,
        color: '#666',
    },
    selectedTimeText: {
        color: '#667eea',
        fontWeight: 'bold',
    },
    periodPicker: {
        marginLeft: 10,
    },
    periodButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginVertical: 4,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    selectedPeriodButton: {
        backgroundColor: '#667eea',
        borderColor: '#667eea',
    },
    periodText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
    selectedPeriodText: {
        color: '#fff',
    },
    pickerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    confirmButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#667eea',
        alignItems: 'center',
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});

export default MealTimeSettings;
