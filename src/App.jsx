import Quiz from "./components/Quiz/Quiz";
import { jsQuizz } from "./assets/constants";
function App() {
  return <Quiz questions={ jsQuizz.questions} />
}

export default App
