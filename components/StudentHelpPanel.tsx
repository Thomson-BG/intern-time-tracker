import React, { useState } from 'react';
import FeatureSuggestions from './FeatureSuggestions';

const StudentHelpPanel: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'faqs' | 'features'>('faqs');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "What is the Intern Tracking Systems (ITS) Application?",
      answer: "ITS is your digital timecard for tracking when you start and end your work as an intern. Think of it like clocking in and out at any job - it helps keep accurate records of your work hours."
    },
    {
      question: "How do I clock in for my shift?",
      answer: "Fill out your name and employee ID in the Time Tracking tab, then click 'CHECK IN' when you arrive. Make sure your phone's location is enabled so we can verify you're at the right place."
    },
    {
      question: "What if I forget to clock out?",
      answer: "Don't worry! Contact your supervisor or the admin as soon as possible. They can help fix your timesheet. It's better to report it quickly than to let it go unnoticed."
    },
    {
      question: "Do I need to report sick days or time off?",
      answer: "Yes! Use the 'Report Absence' tab to let your supervisor know if you'll be missing work. This helps them plan coverage and keeps everything documented properly."
    },
    {
      question: "Is my location data private?",
      answer: "Your location is only used to verify you're at your work site when clocking in/out. This data is stored securely and only accessible to authorized supervisors for attendance verification."
    },
    {
      question: "Can I use this app on my personal phone?",
      answer: "Yes! This web app works on any phone, tablet, or computer with internet access. You don't need to download anything - just bookmark this page for easy access."
    },
    {
      question: "What if the app isn't working?",
      answer: "First, try refreshing the page or checking your internet connection. If you're still having trouble, tell your supervisor right away so they can help you and mark your attendance manually if needed."
    }
  ];

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-lg border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <i className="fas fa-question-circle text-purple-400"></i>
          Student Help Center
        </h2>
        
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveSection('faqs')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeSection === 'faqs'
                ? 'bg-purple-600 text-white'
                : 'glass border border-white/20 text-gray-300 hover:bg-white/10'
            }`}
          >
            <i className="fas fa-question-circle mr-2"></i>
            FAQs & Help
          </button>
          <button
            onClick={() => setActiveSection('features')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeSection === 'features'
                ? 'bg-purple-600 text-white'
                : 'glass border border-white/20 text-gray-300 hover:bg-white/10'
            }`}
          >
            <i className="fas fa-lightbulb mr-2"></i>
            Future Features
          </button>
        </div>

        {activeSection === 'faqs' && (
          <>
            <div className="glass p-4 rounded-lg border border-blue-500/30 mb-4">
              <div className="flex items-start gap-3">
                <i className="fas fa-graduation-cap text-blue-400 text-lg mt-1"></i>
                <div>
                  <h3 className="text-blue-300 font-semibold mb-1">Welcome, Student Intern!</h3>
                  <p className="text-gray-300 text-sm">
                    This app helps you track your work hours professionally, just like in any workplace. 
                    Take a moment to read through these FAQs to get the most out of your internship experience.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {faqs.map((faq, index) => (
                <div key={index} className="glass border border-white/10 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <span className="text-white font-medium">{faq.question}</span>
                    <i className={`fas fa-chevron-${openFaq === index ? 'up' : 'down'} text-purple-400 transition-transform`}></i>
                  </button>
                  {openFaq === index && (
                    <div className="px-4 pb-4">
                      <p className="text-gray-300 text-sm leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/20">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-green-400">
                  <i className="fas fa-shield-alt"></i>
                  <span>Secure & Private</span>
                </div>
                <div className="flex items-center gap-2 text-blue-400">
                  <i className="fas fa-mobile-alt"></i>
                  <span>Mobile Friendly</span>
                </div>
                <div className="flex items-center gap-2 text-purple-400">
                  <i className="fas fa-clock"></i>
                  <span>Real-time Tracking</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {activeSection === 'features' && <FeatureSuggestions />}
    </div>
  );
};

export default StudentHelpPanel;