import React, { useState } from 'react';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
  category: 'productivity' | 'engagement' | 'accessibility' | 'safety';
}

const FeatureSuggestions: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const features: Feature[] = [
    {
      id: 'qr-checkin',
      title: 'QR Code Check-in',
      description: 'Each bus/location gets a unique QR code for quick, contactless check-in. Students just scan to clock in - faster and more accurate than manual entry.',
      icon: 'fa-qrcode',
      priority: 'high',
      category: 'productivity'
    },
    {
      id: 'photo-verification',
      title: 'Photo Verification',
      description: 'Optional selfie capture during check-in for additional security. Helps verify student identity and location accuracy.',
      icon: 'fa-camera',
      priority: 'medium',
      category: 'safety'
    },
    {
      id: 'achievement-badges',
      title: 'Achievement System',
      description: 'Gamify the experience with badges for punctuality, perfect attendance, and milestones. Motivates students and recognizes good behavior.',
      icon: 'fa-trophy',
      priority: 'medium',
      category: 'engagement'
    },
    {
      id: 'mentor-chat',
      title: 'Supervisor Messaging',
      description: 'Built-in chat system for students to communicate with supervisors. Quick way to report issues or ask questions.',
      icon: 'fa-comments',
      priority: 'high',
      category: 'productivity'
    },
    {
      id: 'weather-alerts',
      title: 'Weather Integration',
      description: 'Automatic notifications about weather conditions that might affect bus routes or schedules. Keeps everyone informed.',
      icon: 'fa-cloud-rain',
      priority: 'low',
      category: 'safety'
    },
    {
      id: 'voice-commands',
      title: 'Voice Check-in',
      description: 'Allow students to check in/out using voice commands for hands-free operation and improved accessibility.',
      icon: 'fa-microphone',
      priority: 'medium',
      category: 'accessibility'
    },
    {
      id: 'offline-mode',
      title: 'Offline Functionality',
      description: 'Basic check-in/out works without internet, syncs when connection returns. Essential for areas with poor signal.',
      icon: 'fa-wifi',
      priority: 'high',
      category: 'accessibility'
    },
    {
      id: 'schedule-calendar',
      title: 'Schedule Calendar',
      description: 'Visual calendar showing upcoming shifts, route assignments, and important dates. Better planning for students.',
      icon: 'fa-calendar-alt',
      priority: 'medium',
      category: 'productivity'
    }
  ];

  const uiImprovements = [
    {
      title: 'Progressive Web App (PWA)',
      description: 'Make the app installable on phones like a native app - faster access and works better offline.',
      impact: 'High'
    },
    {
      title: 'Multi-language Support',
      description: 'Add Spanish and other languages to serve diverse student populations better.',
      impact: 'Medium'
    },
    {
      title: 'Larger Touch Targets',
      description: 'Bigger buttons and interactive elements for easier mobile use, especially with gloves or in vehicles.',
      impact: 'Medium'
    },
    {
      title: 'Theme Toggle',
      description: 'Let users switch between dark and light modes based on preference or time of day.',
      impact: 'Low'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Features', icon: 'fa-star' },
    { id: 'productivity', label: 'Productivity', icon: 'fa-rocket' },
    { id: 'engagement', label: 'Student Engagement', icon: 'fa-heart' },
    { id: 'accessibility', label: 'Accessibility', icon: 'fa-universal-access' },
    { id: 'safety', label: 'Safety & Security', icon: 'fa-shield-alt' }
  ];

  const filteredFeatures = selectedCategory === 'all' 
    ? features 
    : features.filter(f => f.category === selectedCategory);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-lg border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <i className="fas fa-lightbulb text-purple-400"></i>
          Feature Enhancement Recommendations
        </h2>
        
        <div className="glass p-4 rounded-lg border border-blue-500/30 mb-6">
          <h3 className="text-blue-300 font-semibold mb-2">Research-Based Suggestions</h3>
          <p className="text-gray-300 text-sm">
            Based on current trends in student management systems, mobile-first design, and feedback from similar transportation tracking applications.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${
                selectedCategory === category.id
                  ? 'bg-purple-600 text-white'
                  : 'glass border border-white/20 text-gray-300 hover:bg-white/10'
              }`}
            >
              <i className={`fas ${category.icon}`}></i>
              {category.label}
            </button>
          ))}
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {filteredFeatures.map(feature => (
            <div key={feature.id} className="glass p-4 rounded-lg border border-white/10">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <i className={`fas ${feature.icon} text-purple-400 text-lg`}></i>
                  <h4 className="text-white font-semibold">{feature.title}</h4>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(feature.priority)}`}>
                  {feature.priority}
                </span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-6 rounded-lg border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <i className="fas fa-palette text-purple-400"></i>
          UI/UX Improvement Suggestions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {uiImprovements.map((improvement, index) => (
            <div key={index} className="glass p-4 rounded-lg border border-white/10">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-white font-semibold">{improvement.title}</h4>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  improvement.impact === 'High' ? 'text-red-400 bg-red-500/20' :
                  improvement.impact === 'Medium' ? 'text-yellow-400 bg-yellow-500/20' :
                  'text-green-400 bg-green-500/20'
                }`}>
                  {improvement.impact} Impact
                </span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{improvement.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-6 rounded-lg border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <i className="fas fa-tools text-purple-400"></i>
          Recommended Tools & Libraries
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass p-4 rounded-lg border border-white/10">
            <h4 className="text-purple-300 font-semibold mb-2">Performance</h4>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• React Query - Better data fetching</li>
              <li>• Workbox - Service worker/PWA</li>
              <li>• React.memo - Component optimization</li>
            </ul>
          </div>
          <div className="glass p-4 rounded-lg border border-white/10">
            <h4 className="text-blue-300 font-semibold mb-2">User Experience</h4>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Framer Motion - Smooth animations</li>
              <li>• React Hook Form - Better forms</li>
              <li>• React i18next - Multi-language</li>
            </ul>
          </div>
          <div className="glass p-4 rounded-lg border border-white/10">
            <h4 className="text-green-300 font-semibold mb-2">Features</h4>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• QR Code library - Scanning support</li>
              <li>• Web Speech API - Voice commands</li>
              <li>• Push notifications API</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureSuggestions;