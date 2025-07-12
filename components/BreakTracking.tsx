import React, { useState, useEffect } from 'react';

interface BreakEntry {
  id: string;
  type: 'lunch' | 'break' | 'meeting' | 'other';
  startTime: string;
  endTime?: string;
  duration?: number;
  note?: string;
}

interface BreakTrackingProps {
  isVisible: boolean;
  onClose: () => void;
  onBreakStart: (breakData: Omit<BreakEntry, 'id'>) => void;
  onBreakEnd: (breakId: string) => void;
  activeBreaks: BreakEntry[];
}

const BreakTracking: React.FC<BreakTrackingProps> = ({
  isVisible,
  onClose,
  onBreakStart,
  onBreakEnd,
  activeBreaks
}) => {
  const [breakType, setBreakType] = useState<'lunch' | 'break' | 'meeting' | 'other'>('break');
  const [note, setNote] = useState('');

  const handleStartBreak = () => {
    const breakData: Omit<BreakEntry, 'id'> = {
      type: breakType,
      startTime: new Date().toISOString(),
      note: note.trim() || undefined
    };
    
    onBreakStart(breakData);
    setNote('');
  };

  const formatDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getBreakTypeIcon = (type: string) => {
    switch (type) {
      case 'lunch': return 'fa-utensils';
      case 'meeting': return 'fa-users';
      case 'other': return 'fa-clock';
      default: return 'fa-coffee';
    }
  };

  const getBreakTypeColor = (type: string) => {
    switch (type) {
      case 'lunch': return 'text-orange-400';
      case 'meeting': return 'text-blue-400';
      case 'other': return 'text-purple-400';
      default: return 'text-green-400';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="card-glass rounded-lg p-6 max-w-md mx-4 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center">
            <i className="fas fa-coffee mr-2"></i>
            Break Tracking
          </h3>
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Active Breaks */}
          {activeBreaks.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">Active Breaks</h4>
              <div className="space-y-3">
                {activeBreaks.map(breakEntry => (
                  <div key={breakEntry.id} className="glass-light p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <i className={`fas ${getBreakTypeIcon(breakEntry.type)} ${getBreakTypeColor(breakEntry.type)}`}></i>
                        <span className="text-white font-medium capitalize">{breakEntry.type}</span>
                      </div>
                      <span className="text-white/70 text-sm">
                        {formatDuration(breakEntry.startTime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">
                        Started: {new Date(breakEntry.startTime).toLocaleTimeString()}
                      </span>
                      <button
                        onClick={() => onBreakEnd(breakEntry.id)}
                        className="btn-glass text-white py-1 px-3 rounded text-sm hover:bg-red-500/20"
                      >
                        End Break
                      </button>
                    </div>
                    {breakEntry.note && (
                      <p className="text-white/70 text-sm mt-2 italic">"{breakEntry.note}"</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Start New Break */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Start New Break</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Break Type</label>
                <select
                  value={breakType}
                  onChange={(e) => setBreakType(e.target.value as any)}
                  className="w-full input-glass rounded-lg p-3 transition-all duration-300"
                >
                  <option value="break">Short Break</option>
                  <option value="lunch">Lunch Break</option>
                  <option value="meeting">Meeting</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Note (Optional)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What are you doing during this break?"
                  className="w-full input-glass rounded-lg p-3 transition-all duration-300"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="btn-glass text-white py-2 px-4 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartBreak}
                  className="btn-glass hover:glass-light text-white py-2 px-4 rounded-lg text-sm flex items-center gap-2"
                >
                  <i className="fas fa-play"></i>
                  Start Break
                </button>
              </div>
            </div>
          </div>
          
          {/* Break Statistics */}
          <div className="glass-light p-4 rounded-lg">
            <h5 className="font-semibold text-white mb-2">Today's Break Summary</h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-white/70">Total Breaks:</span>
                <span className="text-white ml-2 font-medium">{activeBreaks.length}</span>
              </div>
              <div>
                <span className="text-white/70">Active Now:</span>
                <span className="text-white ml-2 font-medium">{activeBreaks.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakTracking;