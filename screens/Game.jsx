import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ScrollView,
} from "react-native";
import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, database } from "../config/firebase";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import colors from "../colors";

export default function Game() {
  const [messages, setMessages] = useState([]);
  const navigation = useNavigation();
  var myTurn = true;
  var myTurn = false;

  var playersArray = [
    { id: 1, cards: [1, 2, 3, 5], name: "mehdi (shmanks left: 30)" },
    { id: 2, cards: [1], name: "latif" },
    { id: 3, cards: [10, 25, 23, 11, 21, 20, 24, 35], name: "masum" },
    { id: 4, cards: [7], name: "nayem" },
    { id: 5, cards: [9, 15], name: "fahim" },
  ];

  const onSignOut = () => {
    signOut(auth).catch((error) => console.log("Error logging out: ", error));
  };

  //top nav bar
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{
            marginRight: 10,
          }}
          onPress={onSignOut}
        >
          <AntDesign
            name="logout"
            size={24}
            color={colors.gray}
            style={{ marginRight: 10 }}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  //retrieve prev messages
  useLayoutEffect(() => {
    const collectionRef = collection(database, "games");
    const q = query(collectionRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      console.log("querySnapshot unsusbscribe");
      setMessages(
        querySnapshot.docs.map((doc) => ({
          _id: doc.data()._id,
          createdAt: doc.data().createdAt.toDate(),
          text: doc.data().text,
          user: doc.data().user,
        }))
      );
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

  //send text to firebase
  // const onSend = useCallback((messages = []) => {
  //   console.log(messages);
  //   setMessages((previousMessages) =>
  //    gf.append(previousMessages, messages)
  //   );
  //   // setMessages([...messages, ...messages]);
  //   const { _id, createdAt, text, user } = messages[0];
  //   addDoc(collection(database, "chats"), {
  //     //id for text
  //     _id,
  //     createdAt,
  //     text,
  //     //object contining id of user aka the email
  //     user,
  //   });
  // }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shmanks</Text>

      <View style={styles.centerCard}>
        <Text style={styles.centerCardValuetl}>32</Text>
        <Text style={styles.centerCardValue}>32</Text>
      </View>
      <ScrollView style={{ width: "100%" }}>
        <View style={styles.opponentsView}>
          {playersArray.map((player) => (
            <View key={player.id} style={styles.playerTag}>
              <Text style={styles.playerName}>{player.name}</Text>
              <View style={styles.playerCards}>
                {displayableCards(player.cards).map((bunch) => (
                  <View key={bunch} style={styles.playerCard}>
                    {bunch.map((card, index) => (
                      <View
                        key={index}
                        style={
                          index === 0
                            ? [styles.playerConsecutiveCard, { marginLeft: 10 }]
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
      {myTurn ? (
        <View style={styles.chooseAction}>
          <View style={styles.takeCardBtn}>
            <Text style={{ textAlign: "center" }}>take card</Text>
          </View>
          <View style={styles.noShmanksBtn}>
            <Text
              style={{ textAlign: "center", width: 60, color: colors.white }}
            >
              no shmanks
            </Text>
          </View>
        </View>
      ) : (
        ""
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
    // flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
  },
  playerTag: {
    padding: 5,
    backgroundColor: colors.beige,
    marginVertical: 5,
    borderRadius: 5,
    width: "90%",
    marginLeft: "5%",
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
