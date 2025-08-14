import React, { useState } from 'react';
import { SafetyTest, SafetyTestQuestion, TestResult, UserInfo } from '../types';

interface SafetyTestComponentProps {
  test: SafetyTest;
  userInfo: UserInfo;
  onTestComplete: (result: TestResult) => void;
  onBack: () => void;
}

const SafetyTestComponent: React.FC<SafetyTestComponentProps> = ({
  test,
  userInfo,
  onTestComplete,
  onBack
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const currentQuestion = test.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === test.questions.length - 1;

  const handleAnswerSelect = (answerIndex: number) => {
    if (!isSubmitted) {
      setSelectedAnswer(answerIndex);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer !== null) {
      const newAnswers = [...answers, selectedAnswer];
      setAnswers(newAnswers);
      setIsSubmitted(true);

      // Show the result for a moment, then move to next question or finish
      setTimeout(() => {
        if (isLastQuestion) {
          // Calculate final results
          const correctAnswers = newAnswers.reduce((count, answer, index) => {
            return answer === test.questions[index].correctAnswer ? count + 1 : count;
          }, 0);

          const percentage = Math.round((correctAnswers / test.questions.length) * 100);
          
          const result: TestResult = {
            testId: test.id,
            score: correctAnswers,
            percentage,
            passed: percentage === 100,
            answers: newAnswers,
            completedAt: new Date().toISOString()
          };

          onTestComplete(result);
        } else {
          // Move to next question
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setSelectedAnswer(null);
          setIsSubmitted(false);
        }
      }, 2000);
    }
  };

  const getAnswerClass = (index: number) => {
    if (!isSubmitted) {
      return selectedAnswer === index
        ? 'bg-blue-100 border-blue-500 text-blue-700'
        : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100';
    }

    // After submission, show correct/incorrect
    if (index === currentQuestion.correctAnswer) {
      return 'bg-green-100 border-green-500 text-green-700';
    } else if (index === selectedAnswer) {
      return 'bg-red-100 border-red-500 text-red-700';
    } else {
      return 'bg-gray-50 border-gray-300 text-gray-500';
    }
  };

  const getAnswerIcon = (index: number) => {
    if (!isSubmitted) {
      return selectedAnswer === index ? 'fas fa-check-circle' : 'far fa-circle';
    }

    if (index === currentQuestion.correctAnswer) {
      return 'fas fa-check-circle text-green-600';
    } else if (index === selectedAnswer) {
      return 'fas fa-times-circle text-red-600';
    } else {
      return 'far fa-circle text-gray-400';
    }
  };

  return (
    <div className="safety-test-component slide-in">
      {/* Back Button - Red with white left arrow as specified */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
        >
          <div className="bg-white text-red-600 rounded-full w-6 h-6 flex items-center justify-center mr-2">
            <i className="fas fa-arrow-left text-sm"></i>
          </div>
          <span className="text-red-600 bg-white px-2 py-1 rounded">BACK</span>
        </button>
      </div>

      {/* Test Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{test.title}</h2>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Question {currentQuestionIndex + 1} of {test.questions.length}</span>
          <span>{userInfo.firstName} {userInfo.lastName} - ID: {userInfo.employeeId}</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / test.questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          {currentQuestion.question}
        </h3>

        {/* Answer Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={isSubmitted}
              className={`w-full p-4 border-2 rounded-lg text-left transition-all duration-200 flex items-center ${getAnswerClass(index)}`}
            >
              <i className={`${getAnswerIcon(index)} mr-3`}></i>
              <span>{option}</span>
            </button>
          ))}
        </div>

        {/* Submit Button */}
        {!isSubmitted && (
          <div className="mt-6">
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Submit Answer
            </button>
          </div>
        )}

        {/* Result Feedback */}
        {isSubmitted && (
          <div className="mt-6 p-4 rounded-lg">
            {selectedAnswer === currentQuestion.correctAnswer ? (
              <div className="flex items-center text-green-700">
                <i className="fas fa-check-circle mr-2"></i>
                <span className="font-semibold">Correct!</span>
              </div>
            ) : (
              <div className="flex items-center text-red-700">
                <i className="fas fa-times-circle mr-2"></i>
                <span className="font-semibold">
                  Incorrect. The correct answer is highlighted above.
                </span>
              </div>
            )}
            
            {!isLastQuestion && (
              <p className="text-gray-600 mt-2">Moving to next question...</p>
            )}
            {isLastQuestion && (
              <p className="text-gray-600 mt-2">Calculating your results...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SafetyTestComponent;