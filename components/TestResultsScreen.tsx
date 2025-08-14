import React from 'react';
import { SafetyTest, TestResult, UserInfo } from '../types';
import CertificateGenerator from './CertificateGenerator';

interface TestResultsScreenProps {
  result: TestResult;
  test: SafetyTest;
  userInfo: UserInfo;
  onRetakeTest: () => void;
  onBackToSelection: () => void;
}

const TestResultsScreen: React.FC<TestResultsScreenProps> = ({
  result,
  test,
  userInfo,
  onRetakeTest,
  onBackToSelection
}) => {
  const isPassed = result.passed;

  return (
    <div className="test-results-screen slide-in">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={onBackToSelection}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
        >
          <div className="bg-white text-red-600 rounded-full w-6 h-6 flex items-center justify-center mr-2">
            <i className="fas fa-arrow-left text-sm"></i>
          </div>
          <span className="text-red-600 bg-white px-2 py-1 rounded">BACK</span>
        </button>
      </div>

      {/* Results Header */}
      <div className="text-center mb-8">
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
          isPassed ? 'bg-green-100' : 'bg-red-100'
        }`}>
          <i className={`text-3xl ${
            isPassed ? 'fas fa-check text-green-600' : 'fas fa-times text-red-600'
          }`}></i>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          {isPassed ? '🎉 Congratulations!' : '📝 Test Complete'}
        </h2>
        
        <p className="text-gray-600 mb-4">
          {isPassed 
            ? 'You have successfully passed the safety test!'
            : 'You did not achieve the required score to pass.'
          }
        </p>
      </div>

      {/* Score Display */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">{test.title}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-800">{result.score}</div>
            <div className="text-sm text-gray-600">Correct Answers</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-800">{test.questions.length}</div>
            <div className="text-sm text-gray-600">Total Questions</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className={`text-2xl font-bold ${
              isPassed ? 'text-green-600' : 'text-red-600'
            }`}>
              {result.percentage}%
            </div>
            <div className="text-sm text-gray-600">Final Score</div>
          </div>
        </div>

        <div className="text-center">
          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
            isPassed 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            <i className={`mr-2 ${
              isPassed ? 'fas fa-certificate' : 'fas fa-exclamation-triangle'
            }`}></i>
            {isPassed ? 'PASSED - Certificate Available' : 'FAILED - Retake Required'}
          </span>
        </div>

        {/* Student Info */}
        <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
          <p><strong>Student:</strong> {userInfo.firstName} {userInfo.lastName}</p>
          <p><strong>ID:</strong> {userInfo.employeeId}</p>
          <p><strong>Completed:</strong> {new Date(result.completedAt).toLocaleString()}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {/* Show retake button only if not passed (< 100%) */}
        {!isPassed && (
          <button
            onClick={onRetakeTest}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <i className="fas fa-redo mr-2"></i>
            Retake Test
          </button>
        )}

        {/* Certificate Generation - only show if passed */}
        {isPassed && (
          <CertificateGenerator
            userInfo={userInfo}
            testTitle={test.title}
            score={result.percentage}
            completedAt={result.completedAt}
          />
        )}

        <button
          onClick={onBackToSelection}
          className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          <i className="fas fa-list mr-2"></i>
          Back to Test Selection
        </button>
      </div>

      {/* Pass/Fail Message */}
      <div className={`mt-6 p-4 rounded-lg ${
        isPassed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-start">
          <i className={`mt-1 mr-3 ${
            isPassed ? 'fas fa-info-circle text-green-600' : 'fas fa-exclamation-triangle text-red-600'
          }`}></i>
          <div>
            {isPassed ? (
              <>
                <h4 className="text-green-800 font-semibold mb-1">Test Passed!</h4>
                <p className="text-green-700 text-sm">
                  You have successfully demonstrated your knowledge of {test.title.toLowerCase()}. 
                  Your certificate is now available for download.
                </p>
              </>
            ) : (
              <>
                <h4 className="text-red-800 font-semibold mb-1">Test Not Passed</h4>
                <p className="text-red-700 text-sm">
                  You need to score 100% to pass this safety test. Please review the material and try again. 
                  You can retake the test as many times as needed.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResultsScreen;