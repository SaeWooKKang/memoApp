import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { Fontisto, AntDesign, Entypo  } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "./colors";

export default function App() {
  const STORAGE_KEY = "@toDos";
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [fixing, setFixing] = useState(false);
  const [fixKey, setFixKey] = useState('');

  useEffect(() => {
    loadToDos();
    loadWorkingState();
  }, []);

  const travel =  () => {
    setWorking(false);
    saveWorkingState('false');
    setFixing(false);
    setText('');
  };
  const work =  () => {
    setWorking(true);
    saveWorkingState('true');
    setFixing(false);
    setText('');
  };
  const onChangeText = (payload) => setText(payload);
  const addToDo = async () => {
    if (text === "") {
      return;
    }
    const newToDos = {
      [Date.now()]: { text, working,  done : false, edit:false },
      ...toDos,
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText('');
  };
  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };
  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_KEY);
    if(s){
      setToDos(JSON.parse(s));
    }
  };
  const saveWorkingState = async (toSave) => {
    await AsyncStorage.setItem('workingState', toSave);
  };
  const loadWorkingState = async ()=> {
    const s = await AsyncStorage.getItem('workingState');
    if(s){
      setWorking(JSON.parse(s));
    }
  };
  const deleteToDo = (key) => {
    if(Platform.OS === 'web'){
      const ok = confirm("Do You want to delete this To Do?")
      if(ok) {
        const newToDos = { ...toDos };
        delete newToDos[key];
        setToDos(newToDos);
        saveToDos(newToDos);
      }
    } else {
      Alert.alert("Delete To Do", "Are you sure?", [
        { text: "Cancel" },
        {
          text: "I'm Sure",
          style: "destructive",
          onPress: () => {
            const newToDos = { ...toDos };
            delete newToDos[key];
            setToDos(newToDos);
            saveToDos(newToDos);
          },
        },
      ]);
    }
  };
  const checkDone = async (key) => {
    let newToDos = {...toDos};
    let newToDos2 = {};
    newToDos[key].done === true ? (newToDos[key].done=false): (newToDos[key].done=true);
    
    if (newToDos[key].done) {
      const newText = newToDos[key].text
      delete newToDos[key];
  
      newToDos2 = {...newToDos, 
        [Date.now()]: { text: newText, working,  done : true, edit:false },
      };
    } else {
      let doneTrueArr = []; 
      let doneFalseArr=[];
      let allArr = [];
      
      Object.keys(newToDos).map((key) => (
        newToDos[key].done ? (
            doneTrueArr = [...doneTrueArr, key]
          ) : (
            doneFalseArr = [...doneFalseArr, key]
        )
      ))
      doneFalseArr.splice(doneFalseArr.indexOf(key),1);

      allArr = [key, ...doneFalseArr, ...doneTrueArr];
      allArr.map((key) => newToDos2 = {...newToDos2, [key]:newToDos[key], })
    }
    setToDos(newToDos2);
    await saveToDos(newToDos2);
    setText('');
  };
  const fix = (key) => {
    const pushKey = key;
    const newToDos = {...toDos};
    Object.keys(newToDos).forEach(key=> pushKey!==key ? newToDos[key].edit=false : '');

    if(newToDos[key].edit === false){
      newToDos[key].edit = true;
      setFixing(true);
      setText( toDos[key].text);
    } else {
      newToDos[key].edit = false;
      setText('');
      setFixing(false);
    }
    
    setFixKey(key);
    setToDos(newToDos);
    saveToDos(newToDos);
  };
  const fixToDo = async () => {
    const newToDos = {...toDos};
    newToDos[fixKey].text = text;
    newToDos[fixKey].edit = false;
    setToDos(newToDos);
    await saveToDos(newToDos);
    setFixing(false);
    setFixKey('');
    setText('');

  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={{ ...styles.btnText, color: working ? "white" : '#495057' }}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text style={{...styles.btnText,color: !working ? "white" : '#495057',}}>Travel</Text>
        </TouchableOpacity>
      </View>

      {/* TEXT INPUT */}
      {
        fixing === false ? (
        <TextInput
        autoFocus
          onSubmitEditing={addToDo}
          value={text}
          onChangeText={onChangeText}
          returnKeyType="done"
          placeholder={
            working ? "What do you have to do?" : "Where do you want to go?"
          }
          style={styles.input}
        />
        ): (
          <TextInput
            autoFocus
            value={text}
            style={{...styles.input, backgroundColor:"#FF7163", color:"white"}}
            onSubmitEditing={fixToDo}
            onChangeText={onChangeText}
            returnKeyType="done"
            
          />
        )
      }

      {/* ToDOs */}
      <ScrollView fadingEdgeLength='200'>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <View style={{...styles.toDo, backgroundColor: toDos[key].done === true ? '#266E16': '#9DD871' }} key={key}>
              {/* Text */}
              <Text style={{...styles.toDoText, textDecorationLine:toDos[key].done === true ? 'line-through':'none'}}>
                {toDos[key].text}
              </Text>
              {/* Icons */}
              <View style={styles.toDoIcons}>
                <TouchableOpacity onPress={()=>checkDone(key)} style={{marginRight:10}}>
                  {toDos[key].done === true ? (
                    <AntDesign name="checkcircle" size={22} style={styles.check} />
                    ) : (
                    <AntDesign name="checkcircleo" size={22} style={styles.check} />)
                  }
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteToDo(key)} style={{marginRight:10}} >
                  <Fontisto name="trash" size={18} style={styles.trash} />
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>(fix(key))}>
                  {toDos[key].edit === false ? (
                    <Entypo name="edit" size={20} style={{...styles.edit, color:"white"}}/>
                  ) : (
                    <Entypo name="edit" size={20} style={{...styles.edit, color:'#FF7163'}}/>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 80,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 30,
    fontSize: 16,
    marginBottom:30,
  },
  toDo: {
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    width: "78%",
    textDecorationColor:"white",
    
  },
  toDoIcons:{
    flexDirection: 'row',
    justifyContent:'flex-end',
    width: "22%",
  },
  check:{
    color:'white',
    padding:1,
  },
  trash:{
    color:'white',
    padding:1,
  },
  edit:{
    padding:1,
  },
});