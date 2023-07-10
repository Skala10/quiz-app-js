const selectTopic = document.getElementById("topic")
const startButton = document.getElementById("start__button")
const mainContainer = document.querySelector(".main__container")
const selectDifficulty = document.getElementById("difficulty")

let currentQuestionIndex = 0
let questions = []
let correctAnswersCount = 0

async function getCategories(url) {
  try {
    const response = await fetch(url)
    const data = await response.json()
    return data.trivia_categories
  } catch (error) {
    console.log(error)
    return []
  }
}

function populateCategoryOptions(categories) {
  let markup = ""
  categories.forEach((category) => {
    markup += `<option value="${category.id}">${category.name}</option>`
  })
  selectTopic.innerHTML = markup
}

async function fetchCategories(url) {
  const categories = await getCategories(url)
  populateCategoryOptions(categories)
}

fetchCategories("https://opentdb.com/api_category.php")

function clearElement(element) {
  element.innerHTML = ""
}

function startQuiz() {
  const userTopic = selectTopic.value
  const userDifficulty = selectDifficulty.value
  clearElement(mainContainer)
  currentQuestionIndex = 0
  correctAnswersCount = 0
  fetchQuestions(userTopic, userDifficulty)
}

function getQuestionsUrl(userTopic, userDifficulty) {
  let category = userTopic !== "any" ? `&category=${userTopic}` : ""
  let difficulty =
    userDifficulty !== "any" ? `&difficulty=${userDifficulty}` : ""
  return `https://opentdb.com/api.php?amount=5${category}${difficulty}`
}

async function getQuestions(url) {
  try {
    const response = await fetch(url)
    const data = await response.json()
    return data.results
  } catch (error) {
    console.log(error)
    return []
  }
}

async function fetchQuestions(userTopic, userDifficulty) {
  const url = getQuestionsUrl(userTopic, userDifficulty)
  const fetchedQuestions = await getQuestions(url)
  questions = fetchedQuestions
  showQuestion()
}

function createAnswerMarkup(answers) {
  let answerMarkup = ""
  answers.forEach((answer, index) => {
    answerMarkup += `
      <div class="quiz__answer">
        <input type="radio" id="${index + 1}" name="answer" value="${index}" ${
      index === 0 ? "checked" : ""
    } />
        <label for="${index + 1}">${answer}</label>
      </div>`
  })
  return answerMarkup
}

function showQuestion() {
  const currentQuestion = questions[currentQuestionIndex]
  const answers = [
    ...currentQuestion.incorrect_answers,
    currentQuestion.correct_answer,
  ]
  answers.sort(() => Math.random() - 0.5)

  const questionMarkup = `
    <div class="quiz__div quiz">
      <h2 class="quiz__title">Question ${currentQuestionIndex + 1}</h2>
      <p class="quiz__question">${currentQuestion.question}</p>
      <form class="quiz__answer-form">
        ${createAnswerMarkup(answers)}
      </form>
      <button id="next-question-button">Next</button>
    </div>`

  mainContainer.innerHTML = questionMarkup

  document
    .getElementById("next-question-button")
    .addEventListener("click", nextQuestion)
}

function nextQuestion() {
  const selectedAnswer = document.querySelector("input[name='answer']:checked")
  if (selectedAnswer) {
    const selectedAnswerIndex = parseInt(selectedAnswer.value)
    const currentQuestion = questions[currentQuestionIndex]
    const correctAnswerIndex = currentQuestion.incorrect_answers.length
    if (selectedAnswerIndex === correctAnswerIndex) {
      correctAnswersCount++
    }
  }

  currentQuestionIndex++

  if (currentQuestionIndex < questions.length) {
    showQuestion()
  } else {
    showGameResult()
  }
}

function showGameResult() {
  clearElement(mainContainer)
  const gameResultMarkup = `<div class="game-result-div">
    <h2 class="game-result">Your correct answers is: <span>${correctAnswersCount}</span></h2>
    <button id="start-again-button">Start again</button>
  </div>`
  mainContainer.innerHTML = gameResultMarkup
  const startAgainButton = document.getElementById("start-again-button")
  startAgainButton.addEventListener("click", () => location.reload())
}

function initializeQuiz() {
  startButton.addEventListener("click", startQuiz)
}

initializeQuiz()
