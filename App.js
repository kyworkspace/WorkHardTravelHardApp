import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet, Text, View,
  TouchableOpacity
  , TouchableHighlight
  , TouchableWithoutFeedback
  , Pressable
  , TextInput
  , ScrollView,
  Alert
} from 'react-native';
import { theme } from './colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';


export default function App() {

  const [working, setWorking] = useState(true);
  const [todo, setTodo] = useState("");
  const [todoList, setTodoList] = useState({});
  const [editTodo, setEditTodo] = useState('');

  const STORAGE_KEY = '@toDos';
  const TAB_KEY = '@tab';
  const saveToDos = async (toSave) => {
    try {
      const s = JSON.stringify(toSave);
      await AsyncStorage.setItem(STORAGE_KEY, s);
    } catch (error) {
      alert(error)
    }

  }
  const loadToDos = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      setTodoList(JSON.parse(s));
    } catch (e) {
      console.log(e);
    }
  }
  const loadTab = async () => {
    try {
      const s = await AsyncStorage.getItem(TAB_KEY);
      // console.log(s)
      setWorking(JSON.parse(s))
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(async () => {
    await loadToDos()
    await loadTab()
  }, [])

  const TabSet = async (flag) => {
    try {
      setWorking(flag);
      await AsyncStorage.setItem(TAB_KEY, JSON.stringify(flag));
    } catch (error) {
      console.log(error)
    }
  }

  const travel = () => {
    TabSet(false)
  }
  const work = async () => {
    TabSet(true)
  }
  const onChangeText = (e) => {
    setTodo(e)
  }
  const addToDo = async () => {
    if (todo === "") return;
    else {

    }
    const newTodoList = Object.assign(
      {}
      , todoList
      , { [Date.now()]: { todo, working } }
    )
    setTodoList(newTodoList);
    await saveToDos(newTodoList);
    setTodo("");
  }

  const deleteTodo = (id) => {
    Alert.alert("Delete To Do", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "I'm Sure", onPress: async () => {
          const newToDos = { ...todoList };
          delete newToDos[id];
          setTodoList(newToDos);
          await saveToDos(newToDos);
        }
      }
    ]); return
  }
  const onCompleteToDo = async (key) => {
    const newToDos = { ...todoList }
    newToDos[key].complete = !newToDos[key].complete;
    setTodoList(newToDos);
    await saveToDos(newToDos);
  }
  const onSaveEdit = async (key,newTodo)=>{
    const newToDos = { ...todoList }
    newToDos[key].todo = newTodo;
    setTodoList(newToDos);
    await saveToDos(newToDos);
  }


  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work} >
          <Text style={{ ...styles.btnText, color: working ? 'white' : theme.gray }}>Work</Text>
        </TouchableOpacity>
        <Pressable onPress={travel}>
          <Text style={{ ...styles.btnText, color: !working ? 'white' : theme.gray }}>Travel</Text>
        </Pressable>
      </View>
      <TextInput
        autoCapitalize={'words'}
        placeholder={working ? "Add a To Do" : "Where do you want to go?"} style={styles.input}
        value={todo}
        onChangeText={onChangeText}
        onSubmitEditing={addToDo}
        returnKeyType='done'
      />
      <ScrollView>
        {Object.keys(todoList).map(key => (
          todoList[key].working === working ?
          <TabItem key={key} id={key} item={todoList[key]} onCompleteToDo={onCompleteToDo} deleteTodo={deleteTodo} onSaveEdit={onSaveEdit}/>
            :
            null
        )
        )}
      </ScrollView>
    </View>
  );
}



const TabItem=({item,onCompleteToDo,deleteTodo,id,onSaveEdit})=>{

  const [toDo, setToDo] = useState(item.todo);
  const [editing, setEditing] = useState(false);

  const onCancelEdit = ()=>{
    setToDo(item.todo)
    setEditing(false);
  }
  const onEditChange=()=>{
    setEditing(true);
  }
  const onEditConfirm=()=>{
    setEditing(false);
    onSaveEdit(id,toDo)
  }
  return (
    <View style={styles.toDo}>
      {
        editing ?
          <TextInput style={styles.toDoText} value={toDo} onChangeText={(e) => setToDo(e)} autoFocus />
          :
          <Text style={styles.toDoText}>{toDo}</Text>
      }

      <View style={styles.btnBox}>
        {editing ?
          <>
            <TouchableOpacity onPress={onEditConfirm}>
              <FontAwesome name="save" size={24} color="cornflowerblue" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onCancelEdit}>
              <MaterialCommunityIcons name="cancel" size={24} color="red" />
            </TouchableOpacity>
          </>
          :
          <>
            <TouchableOpacity onPress={onEditChange}>
              <AntDesign name="edit" size={18} color="crimson" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onCompleteToDo(id)}>
              {item.complete ?
                <AntDesign name="checksquare" size={18} color="cornflowerblue" />
                :
                <Feather name="square" size={18} color="cornflowerblue" />
              }
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteTodo(id)}>
              <Feather name="trash-2" size={18} color={theme.gray} />
            </TouchableOpacity>
          </>
        }
      </View>
    </View>
  )
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 10
  },
  header: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 5,
  },
  btnText: {
    fontSize: 44,
    fontWeight: "600",
  },
  input: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 30,
    marginTop: 20,
    fontSize: 18,
    marginVertical: 20,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between'

  },
  toDoText: {
    color: 'white',
    fontSize: 18,
    fontWeight: "500",
    flex: 3
  },
  btnBox: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flex: 1
  }
});