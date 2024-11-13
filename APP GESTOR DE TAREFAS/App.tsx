import React, { useState, useEffect } from "react";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Alert, Modal, StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList } from "react-native";
import { Calendar, LocaleConfig } from 'react-native-calendars';


LocaleConfig.locales['pt'] = {
  monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  dayNames: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt';


function TaskScreen({ tasks, addTask, removeTask, editTask }) {
  const [newTask, setNewTask] = useState("");
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    if (editingTask) {
      setNewTask(editingTask.text);
    } else {
      setNewTask("");
    }
  }, [editingTask]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestor de Tarefas</Text>
      <FlatList
        data={tasks}
        keyExtractor={(_, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        style={styles.FlatList}
        renderItem={({ item }) => (
          <View style={styles.ContainerView}>
            <Text style={styles.Texto}>{item.date ? `${item.date} - ` : ""}{item.text}</Text>
            <View style={styles.iconsContainer}>
              <TouchableOpacity onPress={() => removeTask(item)} style={styles.iconButton}>
                <MaterialIcons name="delete-forever" size={25} color="#f64c75" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditingTask(item)} style={styles.iconButton}>
                <Ionicons name="pencil" size={25} color="#f64c75" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <View style={styles.Form}>
        <TextInput
          style={styles.Input}
          placeholderTextColor="#999"
          autoCorrect={true}
          value={newTask}
          placeholder="Adicione uma tarefa"
          maxLength={25}
          onChangeText={text => setNewTask(text)}
        />
        <TouchableOpacity
          style={styles.Button}
          onPress={() => {
            if (editingTask) {
              editTask(editingTask, newTask);
              setEditingTask(null);
            } else {
              addTask(newTask);
            }
            setNewTask("");
          }}
        >
          <Ionicons name={editingTask ? "checkmark" : "add"} size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}


function CalendarScreen({ addTask }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [taskText, setTaskText] = useState("");

  function openModal(date) {
    setSelectedDate(date);
    setModalVisible(true);
  }

  function handleAddTask() {
    if (taskText.trim()) {
      addTask(taskText, selectedDate);  
      setTaskText("");
      setModalVisible(false);
    } else {
      Alert.alert("Atenção", "Por favor, insira uma tarefa.");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendário</Text>
      <Calendar
        style={styles.calendar}
        theme={{
          selectedDayBackgroundColor: '#1c6cce',
          todayTextColor: '#1c6cce',
          arrowColor: '#1c6cce',
        }}
        onDayPress={(day) => openModal(day.dateString)} 
      />

      
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Adicionar Tarefa</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Digite a tarefa"
              value={taskText}
              onChangeText={setTaskText}
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleAddTask}>
              <Text style={styles.modalButtonText}>Adicionar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}


function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Início</Text>
      <Text style={styles.Textoo}>Seja Bem-Vindo ao Gestor de Tarefas.</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();

export default function App() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    async function loadTasks() {
      const savedTasks = await AsyncStorage.getItem("tasks");
      if (savedTasks) setTasks(JSON.parse(savedTasks));
    }
    loadTasks();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("tasks", JSON.stringify(tasks));  
  }, [tasks]);

  function addTask(text, date = null) {
    const newTask = { text, date };
    setTasks(prevTasks => [...prevTasks, newTask]);  
  }

  function removeTask(taskToRemove) {
    setTasks(prevTasks => prevTasks.filter(task => task !== taskToRemove));  
  }

  function editTask(taskToEdit, newText) {
    setTasks(prevTasks => prevTasks.map(task => 
      task === taskToEdit ? { ...task, text: newText } : task
    ));
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === 'Tarefas') {
              iconName = 'list';
            } else if (route.name === 'Inicio') {
              iconName = 'home';
            } else if (route.name === 'Calendário') {
              iconName = 'calendar';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#1c6cce',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Inicio" component={SettingsScreen} />
        <Tab.Screen name="Tarefas">
          {() => <TaskScreen tasks={tasks} addTask={addTask} removeTask={removeTask} editTask={editTask} />}
        </Tab.Screen>
        <Tab.Screen name="Calendário">
          {() => <CalendarScreen addTask={addTask} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#E0E0E0"
  },
  header: {
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#1c6cce'
  },
  Form: {
    flexDirection: "row",
    marginVertical: 20,
    alignItems: "center"
  },
  Input: {
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginRight: 10,
    flex: 1
  },
  Button: {
    height: 50,
    width: 50,
    backgroundColor: "#1c6cce",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  FlatList: {
    flex: 1,
    marginTop: 20
  },
  ContainerView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    justifyContent: "space-between"
  },
  Texto: {
    fontSize: 16,
    color: '#333'
  },
  Textoo: {
    fontSize: 14,
    color: '#333'
  },
  Textoo:{
    fontSize: 50,
    color: "#333",
    fontWeight: "bold",
    marginTop: 200,
    textAlign: "center",
    fontFamily: "Rockwell",
  },

  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  iconButton: {
    marginLeft: 10,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  modalButton: {
    backgroundColor: '#1c6cce',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
  },
  calendar: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  }
});
