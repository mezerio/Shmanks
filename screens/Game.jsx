import React, { useState, useLayoutEffect, useCallback } from "react";
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { onSnapshot, updateDoc, getDoc, doc } from "firebase/firestore";
import { database } from "../config/firebase";
import { useNavigation, useRoute } from "@react-navigation/native";
import colors from "../colors";

export default function Game() {
  const navigation = useNavigation();
  var myRoomCode = useRoute().params.RoomCode;
  var playerID = useRoute().params.myPlayerID;
  const [playersArray, setPlayersArray] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [topCard, setTopCard] = useState(0);
  const [myShmanks, setMyShmanks] = useState(11);
  const [shmanksOnCard, setShmanksOnCard] = useState(0);

  useLayoutEffect(() => {
    const docRef = doc(database, "shmanks", myRoomCode);
    const unsubscribe = onSnapshot(docRef, (doc) => {
      setCurrentPlayer(doc.data().currentPlayer);
      setPlayersArray(doc.data().playersArray);
      setTopCard(doc.data().deck[0]);
      setShmanksOnCard(doc.data().shmanksOnCard);
      setMyShmanks(doc.data().playersArray[playerID - 1].shmanks);
      if (doc.data().deck.length < 1) {
        navigation.navigate("GameOver", {
          RoomCode: myRoomCode,
          myPlayerID: playerID,
        });
      }
    });
    return unsubscribe;
  }, []);

  function displayableCards(cards) {
    const ascendingCards = cards.sort((a, b) => b - a);
    const displayableCardsArray = [];
    let currentSequence = [ascendingCards[0]];
    for (let i = 1; i < ascendingCards.length; i++) {
      if (
        ascendingCards[i] ===
        currentSequence[currentSequence.length - 1] - 1
      ) {
        currentSequence.push(ascendingCards[i]);
      } else {
        displayableCardsArray.push(currentSequence);
        currentSequence = [ascendingCards[i]];
      }
    }
    displayableCardsArray.push(currentSequence);
    return displayableCardsArray;
  }

  const handleCardTaken = useCallback((cardTaken) => {
    const docRef = doc(database, "shmanks", myRoomCode);
    let nextPlayer = 0;
    getDoc(docRef).then((doc) => {
      if (doc.exists()) {
        const currentPlayersArray = doc.data().playersArray || [];
        const currentDeck = doc.data().deck || [];
        var currentShmanksOnCard = doc.data().shmanksOnCard || 0;
        const totPlayers = currentPlayersArray.length;
        if (playerID < totPlayers) {
          nextPlayer = playerID + 1;
        } else {
          nextPlayer = 1;
        }
        if (cardTaken == true) {
          currentPlayersArray[playerID - 1].cards.push(currentDeck[0]);
          currentPlayersArray[playerID - 1].shmanks =
            currentPlayersArray[playerID - 1].shmanks + currentShmanksOnCard;
          currentDeck.shift();
          currentShmanksOnCard = 0;
        } else {
          currentPlayersArray[playerID - 1].shmanks--;
          currentShmanksOnCard++;
        }

        updateDoc(docRef, {
          playersArray: currentPlayersArray,
          currentPlayer: nextPlayer,
          deck: currentDeck,
          shmanksOnCard: currentShmanksOnCard,
        });
      }
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Shmanks</Text>

      <View style={styles.centerCard}>
        <Text style={styles.centerCardValuetl}>{topCard}</Text>
        <Text style={styles.centerCardValue}>{topCard}</Text>

        <Text
          style={[
            styles.cardShmanks,
            shmanksOnCard < 1 ? { opacity: 0 } : { opacity: 1 },
          ]}
        >
          + {shmanksOnCard} Shmanks
        </Text>
      </View>
      <Text style={styles.myShmanks}>You have {myShmanks} Shmanks left</Text>
      <ScrollView style={{ width: "100%" }}>
        <View style={styles.opponentsView}>
          {playersArray.map((player) => (
            <View
              key={player.id}
              style={[
                styles.playerTag,
                playerID == player.id
                  ? { backgroundColor: colors.darkbeige }
                  : { backgroundColor: colors.beige },
                currentPlayer == player.id
                  ? { borderColor: colors.white }
                  : { borderColor: "transparent" },
              ]}
            >
              <Text style={styles.playerName}>{player.name}</Text>
              <View style={styles.playerCards}>
                {player.cards.length > 0 &&
                  displayableCards(player.cards).map((bunch) => (
                    <View key={bunch} style={styles.playerCard}>
                      {bunch.map((card, index) => (
                        <View
                          key={index}
                          style={
                            index === 0
                              ? [
                                  styles.playerConsecutiveCard,
                                  { marginLeft: 10 },
                                ]
                              : styles.playerConsecutiveCard
                          }
                        >
                          <Text style={styles.playerCardValuetl}>{card}</Text>
                          <Text
                            style={
                              index !== bunch.length - 1
                                ? [
                                    styles.playerCardValue,
                                    { color: colors.cream },
                                  ]
                                : styles.playerCardValue
                            }
                          >
                            {card}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      {currentPlayer == playerID ? (
        <View style={styles.chooseAction}>
          <TouchableOpacity
            style={styles.takeCardBtn}
            onPress={() => handleCardTaken(true)}
          >
            <Text style={{ textAlign: "center" }}>shmank you</Text>
          </TouchableOpacity>
          {myShmanks > 0 ? (
            <TouchableOpacity
              style={styles.noShmanksBtn}
              onPress={() => handleCardTaken(false)}
            >
              <Text
                style={{ textAlign: "center", width: 60, color: colors.white }}
              >
                no shmanks
              </Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}
        </View>
      ) : (
        <View />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  myShmanks: {
    margin: 5,
    color: colors.white,
    fontSize: 20,
    fontWeight: "bold",
  },
  cardShmanks: {
    margin: 15,
    padding: 5,
    color: colors.white,
    backgroundColor: colors.beige,
    borderRadius: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  container: {
    flex: 1,
    backgroundColor: colors.red,
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: colors.white,
    alignSelf: "center",
  },

  myName: {
    color: colors.white,
  },
  myTag: {
    padding: 5,
  },
  myCards: { flexDirection: "row", justifyContent: "center" },
  myCard: {
    borderRadius: 5,
    height: 40,
    backgroundColor: colors.cream,
    width: 30,
    justifyContent: "center",
    margin: 5,
  },
  myCardValue: {
    color: colors.darkgrey,
    textAlign: "center",
    fontSize: 24,
  },
  opponentsView: {
    flexWrap: "wrap",
    width: "100%",
  },
  playerTag: {
    padding: 5,
    marginVertical: 5,
    borderRadius: 5,
    width: "90%",
    marginLeft: "5%",
    borderStyle: "solid",
    borderWidth: 2,
  },
  playerName: {
    color: colors.white,
  },
  playerCards: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  playerCard: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  playerConsecutiveCard: {
    borderRadius: 5,
    height: 30,
    backgroundColor: colors.cream,
    width: 25,
    justifyContent: "center",
    marginVertical: 2,
    marginHorizontal: -8,
  },
  playerCardValue: {
    color: colors.darkgrey,
    textAlign: "center",
    fontSize: 16,
  },
  playerCardValuetl: {
    color: colors.darkgrey,
    paddingHorizontal: 2,
    fontSize: 6,
  },
  gameArea: {
    width: "60%",
    aspectRatio: 1,
    alignItems: "center",
    margin: 10,
  },

  centerCard: {
    backgroundColor: colors.cream,
    height: "30%",
    aspectRatio: 1 / 1.5,
    borderRadius: 10,
    justifyContent: "center",
  },
  centerCardValue: { textAlign: "center", fontSize: 100 },
  centerCardValuetl: { fontSize: 20, paddingHorizontal: 15 },
  chooseAction: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    width: "100%",
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-around",
    borderRadius: 20,
    margin: 10,
  },
  takeCardBtn: {
    backgroundColor: colors.cream,
    height: 90,
    aspectRatio: 1 / 1.5,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    borderColor: colors.white,
    borderStyle: "solid",
    borderWidth: 5,
  },
  noShmanksBtn: {
    backgroundColor: colors.red,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
    width: 90,
    borderColor: colors.white,
    borderStyle: "solid",
    borderWidth: 5,
  },
});
