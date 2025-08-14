import React from 'react';
import { SafetyTest, UserInfo } from '../types';

interface TestSelectionScreenProps {
  tests: SafetyTest[];
  onTestSelect: (test: SafetyTest) => void;
  userInfo: UserInfo;
}

const TestSelectionScreen: React.FC<TestSelectionScreenProps> = ({
  tests,
  onTestSelect,
  userInfo
}) => {
  return (
    <div className="test-selection-screen slide-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          🛡️ Safety Training Tests
        </h2>
        <p className="text-gray-600 mb-2">
          Welcome, {userInfo.firstName ? `${userInfo.firstName} ${userInfo.lastName}` : 'Student'}!
        </p>
        <p className="text-gray-600">
          Select a safety test to begin. You must score 100% to pass and receive a certificate.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test) => (
          <div
            key={test.id}
            className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6"
          >
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {test.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {test.description}
              </p>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-question-circle mr-2"></i>
                <span>{test.questions.length} Questions</span>
              </div>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <i className="fas fa-clock mr-2"></i>
                <span>~{Math.ceil(test.questions.length * 1.5)} minutes</span>
              </div>
            </div>

            <button
              onClick={() => onTestSelect(test)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              <i className="fas fa-play mr-2"></i>
              Start Test
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start">
          <i className="fas fa-info-circle text-yellow-600 mt-1 mr-3"></i>
          <div>
            <h4 className="text-yellow-800 font-semibold mb-1">Important Notes:</h4>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• You must score 100% to pass and receive a certificate</li>
              <li>• You can retake any test if you don't pass on the first attempt</li>
              <li>• Read each question carefully before selecting your answer</li>
              <li>• Once you submit an answer, you cannot change it</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSelectionScreen;