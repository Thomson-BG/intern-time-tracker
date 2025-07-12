import React, { useState, useEffect } from 'react';

interface ProjectEntry {
  id: string;
  projectName: string;
  taskDescription: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  billable: boolean;
}

interface ProjectTimeTrackingProps {
  isVisible: boolean;
  onClose: () => void;
  onProjectStart: (projectData: Omit<ProjectEntry, 'id'>) => void;
  onProjectEnd: (projectId: string) => void;
  activeProjects: ProjectEntry[];
}

const ProjectTimeTracking: React.FC<ProjectTimeTrackingProps> = ({
  isVisible,
  onClose,
  onProjectStart,
  onProjectEnd,
  activeProjects
}) => {
  const [projectName, setProjectName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [billable, setBillable] = useState(true);

  const predefinedProjects = [
    'Website Development',
    'Mobile App Development',
    'Database Design',
    'Testing & QA',
    'Documentation',
    'Client Meetings',
    'Research & Development',
    'Bug Fixes',
    'Training',
    'Administrative Tasks'
  ];

  const handleStartProject = () => {
    if (!projectName.trim() || !taskDescription.trim()) {
      alert('Please fill in both project name and task description.');
      return;
    }

    const projectData: Omit<ProjectEntry, 'id'> = {
      projectName: projectName.trim(),
      taskDescription: taskDescription.trim(),
      startTime: new Date().toISOString(),
      billable
    };
    
    onProjectStart(projectData);
    setProjectName('');
    setTaskDescription('');
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

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="card-glass rounded-lg p-6 max-w-2xl mx-4 border border-white/20 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center">
            <i className="fas fa-project-diagram mr-2"></i>
            Project Time Tracking
          </h3>
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Active Projects */}
          {activeProjects.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">Active Projects</h4>
              <div className="space-y-3">
                {activeProjects.map(project => (
                  <div key={project.id} className="glass-light p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <i className={`fas fa-project-diagram ${project.billable ? 'text-green-400' : 'text-blue-400'}`}></i>
                        <span className="text-white font-medium">{project.projectName}</span>
                        {project.billable && (
                          <span className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded-full">
                            Billable
                          </span>
                        )}
                      </div>
                      <span className="text-white/70 text-sm">
                        {formatDuration(project.startTime)}
                      </span>
                    </div>
                    <p className="text-white/80 text-sm mb-3">{project.taskDescription}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-xs">
                        Started: {new Date(project.startTime).toLocaleTimeString()}
                      </span>
                      <button
                        onClick={() => onProjectEnd(project.id)}
                        className="btn-glass text-white py-1 px-3 rounded text-sm hover:bg-red-500/20"
                      >
                        End Project
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Start New Project */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Start New Project</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Project Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter project name or select from list"
                    className="w-full input-glass rounded-lg p-3 pr-10 transition-all duration-300"
                    list="project-suggestions"
                  />
                  <datalist id="project-suggestions">
                    {predefinedProjects.map((project, index) => (
                      <option key={index} value={project} />
                    ))}
                  </datalist>
                  <i className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50"></i>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Task Description</label>
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Describe what you'll be working on..."
                  className="w-full input-glass rounded-lg p-3 h-20 transition-all duration-300 resize-none"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={billable}
                    onChange={(e) => setBillable(e.target.checked)}
                    className="rounded border-white/20 bg-white/10 text-green-500 focus:ring-green-500 focus:ring-offset-0"
                  />
                  <span className="text-white text-sm">Billable Hours</span>
                </label>
                <div className="text-white/60 text-xs">
                  {billable ? '💰 This time will be billed to client' : '🏢 Internal time tracking'}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="btn-glass text-white py-2 px-4 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartProject}
                  disabled={!projectName.trim() || !taskDescription.trim()}
                  className="btn-glass hover:glass-light text-white py-2 px-4 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-play"></i>
                  Start Project
                </button>
              </div>
            </div>
          </div>
          
          {/* Today's Project Summary */}
          <div className="glass-light p-4 rounded-lg">
            <h5 className="font-semibold text-white mb-3">Today's Project Summary</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-white/70">Active Projects:</span>
                <span className="text-white ml-2 font-medium">{activeProjects.length}</span>
              </div>
              <div>
                <span className="text-white/70">Billable:</span>
                <span className="text-green-300 ml-2 font-medium">
                  {activeProjects.filter(p => p.billable).length}
                </span>
              </div>
              <div>
                <span className="text-white/70">Non-billable:</span>
                <span className="text-blue-300 ml-2 font-medium">
                  {activeProjects.filter(p => !p.billable).length}
                </span>
              </div>
              <div>
                <span className="text-white/70">Total Time:</span>
                <span className="text-white ml-2 font-medium">
                  {activeProjects.length > 0 ? formatDuration(
                    activeProjects.reduce((earliest, project) => {
                      return new Date(project.startTime) < new Date(earliest) ? project.startTime : earliest;
                    }, activeProjects[0].startTime)
                  ) : '0m'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectTimeTracking;