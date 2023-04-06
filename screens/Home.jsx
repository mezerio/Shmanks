import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import colors from "../colors";
import { auth, database } from "../config/firebase";

import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot,
  updateDoc,
  getDoc,
  doc,
  setDoc,
  arrayUnion,
} from "firebase/firestore";

const Home = () => {
  const [roomCode, setRoomCode] = useState("");
  const navigation = useNavigation();
  var playerID = 0;
  var playersArray = [];

  function generateNewCode() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
    const testRef = doc(database, "games", result);
    return getDoc(testRef).then((doc) => {
      if (doc.exists()) {
        return generateNewCode();
      } else {
        return result;
      }
    });
  }

  async function handleCreateRoom() {
    const newRoomCode = await generateNewCode();
    console.log("new room code: ", newRoomCode);
    const docRef = doc(database, "games", newRoomCode);
    playersArray = [{ id: 1, name: "player1", cards: [], shmanks: 11 }];
    playerID = 1;
    setDoc(docRef, {
      playersArray,
      playerID,
      gameStarted: false,
      playersExited: 0,
    });
    console.log(playerID, "pi");
    navigation.navigate("Waiting", {
      // navigation.navigate("GameOver", {
      RoomCode: newRoomCode,
      myPlayerID: playerID,
    });
  }

  function handleJoinRoom() {
    console.log("joined room code: ", roomCode);
    const docRef = doc(database, "games", roomCode);
    getDoc(docRef).then((doc) => {
      if (doc.exists()) {
        const currentPlayersArray = doc.data().playersArray || [];
        console.log(playerID, "pi01");

        playerID = currentPlayersArray.length + 1;
        console.log(playerID, "pi1");

        const myPlayer = {
          id: currentPlayersArray.length + 1,
          name: String("player" + playerID),
          cards: [],
          shmanks: 11,
        };
        currentPlayersArray.push(myPlayer);
        setDoc(docRef, {
          playersArray: currentPlayersArray,
          playerID: playerID,
          gameStarted: false,
          playersExited: 0,
        });
        console.log(playerID, "pi2");
        navigation.navigate("Waiting", {
          RoomCode: roomCode,
          myPlayerID: playerID,
        });
      }
    });
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter Room Code"
        autoCapitalize="characters"
        autoCorrect={false}
        textContentType="password"
        placeholderTextColor={colors.darkgrey}
        onChangeText={(text) => setRoomCode(text.toUpperCase())}
      />
      <TouchableOpacity onPress={handleJoinRoom} style={styles.gameButton}>
        <Text style={{ fontWeight: "bold", color: "#fff", fontSize: 18 }}>
          join game
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleCreateRoom} style={styles.gameButton}>
        <Text style={{ fontWeight: "bold", color: "#fff", fontSize: 18 }}>
          new game
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.red,
    justifyContent: "center",
    alignItems: "center",
  },
  gameButton: {
    backgroundColor: colors.beige,
    height: 58,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    width: "80%",
  },
  input: {
    color: colors.black,
    backgroundColor: colors.cream,
    height: 58,
    marginBottom: 20,
    fontSize: 16,
    borderRadius: 10,
    padding: 12,
  },
});
