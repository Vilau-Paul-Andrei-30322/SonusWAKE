import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Button,
  Alert,
  TextInput,
  Pressable,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

type Alarm = {
  time: string;
  label: string;
  enabled: boolean;
};

export default function App() {
  const [alarms, setAlarms] = useState<Alarm[]>([
    { time: "7:30", label: "School Time! (every weekday)", enabled: true },
  ]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isModalStopAlarmVisible, setModalStopAlarmVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("Add New Alarm");
  const [currentEditingIndex, setCurrentEditingIndex] = useState<number | null>(null);
  const [newAlarmLabel, setNewAlarmLabel] = useState("");
  const [selectedHour, setSelectedHour] = useState("0");
  const [selectedMinute, setSelectedMinute] = useState("00");

  const alarmsRef = useRef(alarms);

  useEffect(() => {
    alarmsRef.current = alarms;
  }, [alarms]);


  useEffect(() => {
    const intervalId = setInterval(checkTime, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const toggleSwitch = (index: number) => {
    const newAlarms = [...alarms];
    newAlarms[index].enabled = !newAlarms[index].enabled;
    setAlarms(newAlarms);
  };

  const openEditModal = (index: number) => {
    const alarm = alarms[index];
    const [hour, minute] = alarm.time.split(":");
    setSelectedHour(hour);
    setSelectedMinute(minute);
    setNewAlarmLabel(alarm.label);
    setModalTitle("Edit Alarm");
    setCurrentEditingIndex(index);
    setModalVisible(true);
  };

  const saveAlarm = () => {
    const newTime = `${selectedHour}:${selectedMinute}`;
    if (currentEditingIndex !== null) {
      const updatedAlarms = [...alarms];
      updatedAlarms[currentEditingIndex] = {
        time: newTime,
        label: newAlarmLabel,
        enabled: alarms[currentEditingIndex].enabled,
      };
      setAlarms(updatedAlarms);
    } else {
      setAlarms([...alarms, { time: newTime, label: newAlarmLabel, enabled: true }]);
    }
    resetModal();
  };

  const deleteAlarm = () => {
    if (currentEditingIndex !== null) {
      const updatedAlarms = alarms.filter((_, i) => i !== currentEditingIndex);
      setAlarms(updatedAlarms);
    }
    resetModal();
  };

  const resetModal = () => {
    setNewAlarmLabel("");
    setSelectedHour("0");
    setSelectedMinute("00");
    setModalTitle("Add New Alarm");
    setCurrentEditingIndex(null);
    setModalVisible(false);
  };

  
  const baseUrl="http://192.168.35.87"
  const port = "5000"

  const snoozeAlarm = async () => {
    await stopAlarm();

    setTimeout(async () => {
      setModalStopAlarmVisible(true);
      await startAlarm();
    }, 2000);
  }

  const stopAlarm = async ()=>{
    try {
      const response = await fetch(
        `${baseUrl}:${port}/toggle_led`,{
          method: 'POST',
          headers: {
          Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status:"off"
          }),
        }
      );
      const json = await response.json();
    } catch (error) {
      console.error(error);
      Alert.alert('Event sent', 'Error', [
        {text: 'Nu e bn' + error, onPress: () => console.log('OK Pressed')},
      ]);
    }
  }

  const startAlarm = async () => {
      try {
        const response = await fetch(
          `${baseUrl}:${port}/toggle_led`,{
            method: 'POST',
            headers: {
            Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status:"on"
            }),
          }
        );
        const json = await response.json();
        setModalStopAlarmVisible(true);
      } catch (error) {
        console.error(error);
        Alert.alert('Event not sent', 'My Alert Msg', [
          {text: `${error}`, onPress: () => console.log('OK Pressed')},
        ]);
      }
  }

  const checkTime = () => {
    const date = new Date();
    const minutes = date.getMinutes();
    const hour = date.getHours();

    const updatedAlarms = alarmsRef.current.map((alarm) => {
      if (`${hour}:${minutes}` === alarm.time && alarm.enabled) {
        startAlarm();
        return { ...alarm, enabled: false }; 
      }
      return alarm;
    });
  
    alarmsRef.current = updatedAlarms;
    setAlarms(updatedAlarms);
  }


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Alarms</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {alarms.map((alarm, index: number) => (
          <TouchableOpacity
            key={index}
            style={styles.alarmItem}
            onPress={() => openEditModal(index)}
          >
            <View>
              <Text style={styles.timeText}>{alarm.time}</Text>
              <Text style={styles.labelText}>{alarm.label}</Text>
            </View>
            <Switch
              value={alarm.enabled}
              onValueChange={() => toggleSwitch(index)}
            />
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={styles.sendButton}
          onPress={checkTime}
        >
          <Text style={styles.sendButtonText}>Send Event</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={resetModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {modalTitle === "Edit Alarm" && (
              <TouchableOpacity style={styles.deleteButton} onPress={deleteAlarm}>
                <Text style={styles.deleteButtonText}>-</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.modalTitle}>{modalTitle}</Text>

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedHour}
                onValueChange={(itemValue) => setSelectedHour(itemValue)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {Array.from({ length: 25 }, (_, i) => (
                  <Picker.Item key={i} label={i.toString()} value={i.toString()} />
                ))}
              </Picker>
              <Picker
                selectedValue={selectedMinute}
                onValueChange={(itemValue) => setSelectedMinute(itemValue)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {Array.from({ length: 60 }, (_, i) => {
                  const minute = i.toString().padStart(2, "0");
                  return <Picker.Item key={minute} label={minute} value={minute} />;
                })}
              </Picker>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Label (e.g., Work Time)"
              placeholderTextColor="#888"
              value={newAlarmLabel}
              onChangeText={setNewAlarmLabel}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={resetModal}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveAlarm}>
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={false}
        visible={isModalStopAlarmVisible}
        animationType="slide"
        onRequestClose={resetModal}
      >
            <View style={styles.alarmModalContainer}>
              <TouchableOpacity style={styles.turnOffAlarmButton} onPress={async () => {
                await snoozeAlarm();
                setModalStopAlarmVisible(false);
              }
              }>
                <Text style={styles.turnOffAlarmButtonText}>Snooze</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.turnOffAlarmButton} onPress={async () => {
                await stopAlarm()
                setModalStopAlarmVisible(false);
              }
              }>
                <Text style={styles.turnOffAlarmButtonText}>Turn off</Text>
              </TouchableOpacity>
            </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
  },
  addButton: {
    backgroundColor: "#ff9500",
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButton: {
    backgroundColor: "#ff9500",
    marginTop:450,
    marginLeft:90,
    borderRadius: 50,
    width: 200,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  alarmModalContainer:{
    paddingTop:300,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  turnOffAlarmButton: {
    margin:130,
    backgroundColor: "#ff9500",
    borderRadius: 50,
    width: 200,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  turnOffAlarmButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  addButtonText: {
    marginBottom: 2,
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
  },
  alarmItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1c1c1e",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  timeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  labelText: {
    fontSize: 14,
    color: "#aaa",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalContent: {
    backgroundColor: "#1c1c1e",
    borderRadius: 10,
    padding: 20,
    width: "85%",
    height: 380,
    alignItems: "center",
    justifyContent: "space-between",
  },
  deleteButton: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#ff3b30",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  pickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 5, 
    marginBottom: 10,
  },
  picker: {
    flex: 1,
    height: 150,
    color: "#fff",
  },
  pickerItem: {
    fontSize: 20,
    color: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 5,
    padding: 10,
    width: "100%",
    marginTop: 10,
    marginBottom: 5,
    color: "#aaa",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 5, 
  },
  modalButtonText: {
    color: "#ff9500",
    fontSize: 18,
    fontWeight: "bold",
  },
});
