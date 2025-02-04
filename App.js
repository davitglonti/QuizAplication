import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";

const API_URL = "https://opentdb.com/api.php?amount=10&type=multiple";

export default function App() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("9");
  const [selectedDifficulty, setSelectedDifficulty] = useState("easy");
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    if (quizStarted) {
      fetchQuestions();
    }
  }, [quizStarted]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}&category=${selectedCategory}&difficulty=${selectedDifficulty}`);
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        setQuestions(data.results);
      } else {
        console.error("No questions received");
        setQuestions([]);
      }

      setCurrentQuestionIndex(0);
      setScore(0);
      setQuizFinished(false);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setQuestions([]);
    }
    setLoading(false);
  };

  const handleAnswer = (answer) => {
    if (answer === questions[currentQuestionIndex]?.correct_answer) {
      setScore(score + 1);
    }
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizFinished(true);
      setQuizStarted(false);
    }
  };

  return (
    <View style={styles.container}>
      {quizFinished ? (
        <View>
          <Text style={styles.title}>Quiz Finished</Text>
          <Text style={styles.score}>Your Score: {score}/{questions.length}</Text>
          <TouchableOpacity style={styles.button} onPress={() => {
            setQuizFinished(false);
            setQuizStarted(false);
          }}>
            <Text style={styles.buttonText}>Restart Quiz</Text>
          </TouchableOpacity>
        </View>
      ) : quizStarted ? (
        loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <View>
            <Text style={styles.question}>{questions[currentQuestionIndex]?.question}</Text>
            <FlatList
              data={(questions[currentQuestionIndex] && questions[currentQuestionIndex].incorrect_answers) 
                  ? [...questions[currentQuestionIndex].incorrect_answers, questions[currentQuestionIndex].correct_answer] 
                  : []}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.option} onPress={() => handleAnswer(item)}>
                  <Text>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <Text style={styles.score}>Score: {score}</Text>
          </View>
        )
      ) : (
        <View>
          <Text style={styles.title}>Select Category & Difficulty</Text>
          <Picker selectedValue={selectedCategory} onValueChange={(itemValue) => setSelectedCategory(itemValue)}>
            <Picker.Item label="General Knowledge" value="9" />
            <Picker.Item label="Science & Nature" value="17" />
            <Picker.Item label="Sports" value="21" />
          </Picker>
          <Picker selectedValue={selectedDifficulty} onValueChange={(itemValue) => setSelectedDifficulty(itemValue)}>
            <Picker.Item label="Easy" value="easy" />
            <Picker.Item label="Medium" value="medium" />
            <Picker.Item label="Hard" value="hard" />
          </Picker>
          <TouchableOpacity style={styles.button} onPress={() => setQuizStarted(true)}>
            <Text style={styles.buttonText}>Start Quiz</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  button: { backgroundColor: "blue", padding: 10, marginTop: 20, borderRadius: 5 },
  buttonText: { color: "white", textAlign: "center" },
  question: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  option: { backgroundColor: "lightgray", padding: 10, marginVertical: 5, borderRadius: 5 },
  score: { marginTop: 20, fontSize: 18, fontWeight: "bold", textAlign: "center" },
});



