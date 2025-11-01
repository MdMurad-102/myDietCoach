import { useTheme } from '@/context/ThemeContext';
import { useMealContext } from '@/context/UnifiedMealContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Progress from 'react-native-progress';

// Default daily tasks to help users achieve their goals
const DEFAULT_DAILY_TASKS = [
    {
        id: 'drink-water',
        text: 'Drink 8 glasses of water',
        icon: 'water-outline' as keyof typeof Ionicons.glyphMap,
        completed: false
    },
    {
        id: 'eat-breakfast',
        text: 'Eat a healthy breakfast',
        icon: 'sunny-outline' as keyof typeof Ionicons.glyphMap,
        completed: false
    },
    {
        id: 'log-meals',
        text: 'Log all meals for today',
        icon: 'restaurant-outline' as keyof typeof Ionicons.glyphMap,
        completed: false
    },
    {
        id: 'exercise',
        text: 'Exercise for 30 minutes',
        icon: 'fitness-outline' as keyof typeof Ionicons.glyphMap,
        completed: false
    },
    {
        id: 'avoid-junk',
        text: 'Avoid junk food',
        icon: 'fast-food-outline' as keyof typeof Ionicons.glyphMap,
        completed: false
    },
    {
        id: 'sleep-early',
        text: 'Get 7-8 hours of sleep',
        icon: 'moon-outline' as keyof typeof Ionicons.glyphMap,
        completed: false
    },
    {
        id: 'track-weight',
        text: 'Track your weight/progress',
        icon: 'trending-up-outline' as keyof typeof Ionicons.glyphMap,
        completed: false
    },
    {
        id: 'meal-prep',
        text: 'Prepare healthy meals',
        icon: 'nutrition-outline' as keyof typeof Ionicons.glyphMap,
        completed: false
    }
];

const DailyTasks = () => {
    const { currentDayPlan, toggleDailyTask } = useMealContext();
    const { colors } = useTheme();

    // Local state for default tasks
    const [localTasks, setLocalTasks] = useState(DEFAULT_DAILY_TASKS);

    // Use context tasks if available, otherwise use local state tasks
    const tasks = useMemo(() => {
        const contextTasks = currentDayPlan?.tasks || [];
        return contextTasks.length > 0 ? contextTasks : localTasks;
    }, [currentDayPlan?.tasks, localTasks]);

    const completedCount = tasks.filter(task => task.completed).length;
    const progress = tasks.length > 0 ? completedCount / tasks.length : 0;

    // Handle task toggle
    const handleToggleTask = (taskId: string) => {
        const contextTasks = currentDayPlan?.tasks || [];

        if (contextTasks.length > 0) {
            // If using context tasks, use the context toggle function
            toggleDailyTask(taskId);
        } else {
            // If using local default tasks, update local state
            setLocalTasks(prevTasks =>
                prevTasks.map(task =>
                    task.id === taskId ? { ...task, completed: !task.completed } : task
                )
            );
        }
    };

    const renderTaskItem = (item: { id: string; text: string; completed: boolean; icon?: keyof typeof Ionicons.glyphMap }) => (
        <TouchableOpacity
            key={item.id}
            style={[styles.taskItem, { backgroundColor: colors.card }]}
            onPress={() => handleToggleTask(item.id)}
            activeOpacity={0.7}
        >
            <View style={styles.taskContent}>
                <View style={[styles.checkbox, item.completed && styles.checkboxCompleted]}>
                    {item.completed && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
                <Ionicons
                    name={item.icon as any || 'list-outline'}
                    size={24}
                    color={item.completed ? '#999' : colors.text}
                    style={styles.taskIcon}
                />
                <Text style={[styles.taskTitle, { color: colors.text }, item.completed && styles.taskTitleCompleted]}>
                    {item.text}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <LinearGradient colors={['#f5f7fa', '#e9f0f7']} style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Your Daily Goals</Text>
                <Text style={styles.headerSubtitle}>
                    {completedCount} of {tasks.length} tasks completed
                </Text>
            </View>

            <View style={styles.progressContainer}>
                <Progress.Bar
                    progress={progress}
                    width={null}
                    height={8}
                    color={'#4CAF50'}
                    unfilledColor={'#e0e0e0'}
                    borderWidth={0}
                    borderRadius={10}
                />
            </View>

            <View style={styles.taskList}>
                {tasks.map(task => renderTaskItem(task))}
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        padding: 20,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    header: {
        marginBottom: 15,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    progressContainer: {
        marginBottom: 20,
    },
    taskList: {
        paddingBottom: 20,
    },
    taskItem: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    taskContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    checkboxCompleted: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    taskIcon: {
        marginRight: 12,
    },
    taskTitle: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    taskTitleCompleted: {
        textDecorationLine: 'line-through',
        color: '#999',
    },
});

export default DailyTasks;
