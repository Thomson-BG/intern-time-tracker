import React, { useState } from 'react';
import { SafetyTest, TestResult, UserInfo } from '../types';
import { safetyTests } from '../data/safetyTests';
import TestSelectionScreen from './TestSelectionScreen';
import SafetyTestComponent from './SafetyTestComponent';
import TestResultsScreen from './TestResultsScreen';

interface SafetyTestPanelProps {
  userInfo: UserInfo;
}

type ViewState = 'selection' | 'test' | 'results';

const SafetyTestPanel: React.FC<SafetyTestPanelProps> = ({ userInfo }) => {
  const [currentView, setCurrentView] = useState<ViewState>('selection');
  const [selectedTest, setSelectedTest] = useState<SafetyTest | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const handleTestSelection = (test: SafetyTest) => {
    setSelectedTest(test);
    setCurrentView('test');
  };

  const handleTestComplete = (result: TestResult) => {
    setTestResult(result);
    setCurrentView('results');
  };

  const handleBackToSelection = () => {
    setCurrentView('selection');
    setSelectedTest(null);
    setTestResult(null);
  };

  const handleRetakeTest = () => {
    setCurrentView('test');
    setTestResult(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'selection':
        return (
          <TestSelectionScreen
            tests={safetyTests}
            onTestSelect={handleTestSelection}
            userInfo={userInfo}
          />
        );
      case 'test':
        return selectedTest ? (
          <SafetyTestComponent
            test={selectedTest}
            userInfo={userInfo}
            onTestComplete={handleTestComplete}
            onBack={handleBackToSelection}
          />
        ) : null;
      case 'results':
        return testResult && selectedTest ? (
          <TestResultsScreen
            result={testResult}
            test={selectedTest}
            userInfo={userInfo}
            onRetakeTest={handleRetakeTest}
            onBackToSelection={handleBackToSelection}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="safety-test-panel">
      {renderCurrentView()}
    </div>
  );
};

export default SafetyTestPanel;