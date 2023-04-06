import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  TextInput,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import colors from "../colors";
import { auth, database } from "../config/firebase";
// import { useClipboard } from "@react-native-community/hooks";

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
  where,
} from "firebase/firestore";

const Waiting = () => {
  // const { setString } = useClipboard();
  const [playerList, setPlayerList] = useState([]);
  const navigation = useNavigation();
  var myRoomCode = useRoute().params.RoomCode;
  var playerID = useRoute().params.myPlayerID;
  var minPlayers = 1;
  var deck = [];
  for (let i = 3; i <= 35; i++) {
    deck.push(i);
  }

  useLayoutEffect(() => {
    const docRef = doc(database, "games", myRoomCode);
    const unsubscribe = onSnapshot(docRef, (doc) => {
      const newPlayerList = [];
      doc.data().playersArray.map((player) => {
        newPlayerList.push(player.name);
      });
      setPlayerList(newPlayerList);
      if (doc.data().gameStarted === true) {
        navigation.navigate("Game", {
          RoomCode: myRoomCode,
          myPlayerID: playerID,
        });
      }

      // console.log("playerlist", playerList, playerID, "id");
    });
    return unsubscribe;
  }, []);
  function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    deck.splice(0, 9);
    return deck;
  }
  function handleStartGame() {
    if (playerList.length > minPlayers) {
      deck = shuffleDeck(deck);
      const docRef = doc(database, "games", myRoomCode);
      updateDoc(docRef, {
        gameStarted: true,
        currentPlayer: 1,
        deck: deck,
        shmanksOnCard: 0,
      });
      // console.log("starting game in: ", myRoomCode);
    }
  }

  function copyRoomCode() {
    // setString(String(myRoomCode));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.roomCode}>{myRoomCode}</Text>
      <View style={styles.playerList}>
        <Text style={styles.title}>Waiting...</Text>
        {playerList.map((player, index) => (
          <Text key={index} style={styles.playerName}>
            {player}
          </Text>
        ))}
      </View>
      {playerID == 1 ? (
        <TouchableOpacity
          onPress={handleStartGame}
          style={
            playerList.length > minPlayers
              ? styles.gameButton
              : [styles.gameButton, { opacity: 0.5 }]
          }
        >
          <Text style={{ fontWeight: "bold", color: "#fff", fontSize: 18 }}>
            {playerList.length > minPlayers
              ? "Start Game"
              : "Waiting for Players..."}
          </Text>
        </TouchableOpacity>
      ) : (
        <View />
      )}
    </View>
  );
};

export default Waiting;

const styles = StyleSheet.create({
  roomCode: {
    color: colors.black,
    backgroundColor: colors.cream,
    fontSize: 36,
    borderRadius: 5,
    padding: 5,
    marginTop: 40,
    width: "40%",
    textAlign: "center",
    fontWeight: "bold",
  },
  title: {
    color: colors.white,
    fontSize: 20,
    padding: 20,
    paddingHorizontal: 70,
  },
  playerName: {
    color: colors.black,
    backgroundColor: colors.cream,
    padding: 5,
    borderRadius: 5,
    margin: 5,
  },
  container: {
    flex: 1,
    backgroundColor: colors.red,
    alignItems: "center",
  },
  gameButton: {
    backgroundColor: colors.beige,
    height: 58,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    width: "80%",
    position: "absolute",
    bottom: 40,
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
