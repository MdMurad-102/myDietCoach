import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Progress from 'react-native-progress';
import { useMealContext } from '@/context/UnifiedMealContext';

const DailyTasks = () => {
    const { currentDayPlan, toggleDailyTask } = useMealContext();
    const tasks = currentDayPlan?.tasks || [];

    const completedCount = tasks.filter(task => task.completed).length;
    const progress = tasks.length > 0 ? completedCount / tasks.length : 0;

    const renderTaskItem = ({ item }: { item: { id: string; text: string; completed: boolean; icon?: keyof typeof Ionicons.glyphMap } }) => (
        <TouchableOpacity
            style={styles.taskItem}
            onPress={() => toggleDailyTask(item.id)}
            activeOpacity={0.7}
        >
            <View style={styles.taskContent}>
                <View style={[styles.checkbox, item.completed && styles.checkboxCompleted]}>
                    {item.completed && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
                <Ionicons
                    name={item.icon as any || 'list-outline'}
                    size={24}
                    color={item.completed ? '#999' : '#555'}
                    style={styles.taskIcon}
                />
                <Text style={[styles.taskTitle, item.completed && styles.taskTitleCompleted]}>
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

            <FlatList
                data={tasks}
                renderItem={renderTaskItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.taskList}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="file-tray-outline" size={40} color="#ccc" />
                        <Text style={styles.emptyText}>No tasks for today.</Text>
                    </View>
                )}
            />
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
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        marginTop: 10,
        fontSize: 16,
        color: '#999',
    },
});

export default DailyTasks;
