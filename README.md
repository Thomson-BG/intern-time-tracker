# SBRA - School Bus Reporting Application

## Overview

SBRA (School Bus Reporting Application) is a modern, dark-themed time tracking and absence management system designed specifically for high school student interns. Built with React, TypeScript, and Tailwind CSS, it features a sleek glass morphism design with comprehensive functionality for professional time management.

## Features

### ✨ Core Functionality
- **Time Tracking**: Clock in/out with GPS location verification
- **Absence Reporting**: Submit and track absence requests with detailed categorization
- **Digital Timesheet**: View, filter, and download timesheet records as PDF
- **Admin Panel**: Comprehensive management tools for supervisors
- **Real-time Status**: Live feedback and status updates

### 🎨 Design & User Experience
- **Dark Theme**: Professional black background with glass morphism effects
- **Student-Focused**: Age-appropriate language and intuitive interface
- **Mobile-First**: Responsive design optimized for phones and tablets
- **Accessibility**: High contrast ratios and keyboard navigation
- **Interactive Onboarding**: Helpful tooltips and guidance for first-time users

### 📚 Student Support
- **Help Center**: Comprehensive FAQ section with student-specific guidance
- **Feature Suggestions**: Research-based recommendations for future enhancements
- **Onboarding Tooltips**: Interactive guidance for new users
- **Professional Language**: Workplace-appropriate terminology to prepare students

### 🔧 Technical Features
- **Google Sheets Integration**: Automatic data synchronization
- **Location Services**: GPS verification for attendance accuracy
- **Test Mode**: Development-friendly testing with mock data
- **Data Validation**: Comprehensive input validation and error handling
- **Performance Optimized**: Fast loading and smooth animations

## Architecture

### Technology Stack
- **Frontend**: React 18+ with TypeScript
- **Styling**: Tailwind CSS with custom glass morphism effects
- **Icons**: Font Awesome 6
- **PDF Generation**: jsPDF with AutoTable
- **Build Tool**: Vite
- **Backend**: Google Apps Script for data storage

### Project Structure
```
src/
├── components/          # React components
│   ├── Header.tsx      # App header with branding
│   ├── TabBar.tsx      # Navigation tabs
│   ├── TimePanel.tsx   # Time tracking interface
│   ├── AbsencePanel.tsx # Absence reporting
│   ├── TimesheetPanel.tsx # Timesheet display
│   ├── AdminPanel.tsx  # Admin management
│   ├── AdminLogin.tsx  # Authentication
│   ├── StatusDisplay.tsx # Status messages
│   ├── StudentHelpPanel.tsx # Help and FAQ
│   ├── OnboardingTooltip.tsx # Interactive guidance
│   └── FeatureSuggestions.tsx # Enhancement recommendations
├── utils/              # Utility functions
│   ├── timeTrackerApi.ts # Google Sheets API
│   ├── downloadHelpers.ts # PDF generation
│   └── apiService.ts   # Additional API services
├── types/              # TypeScript definitions
└── App.tsx            # Main application component
```

## Installation & Development

### Prerequisites
- Node.js 16+ 
- npm or yarn package manager

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd intern-time-tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file with:
   ```
   VITE_TIME_TRACKER_API=your_google_apps_script_url
   VITE_APPWRITE_PROJECT_ID=your_appwrite_project_id
   VITE_APPWRITE_ENDPOINT=your_appwrite_endpoint
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build optimized production bundle
- `npm run build:css` - Compile Tailwind CSS
- `npm run serve` - Preview production build locally

## Usage Guide

### For Students
1. **First Time Setup**: Fill in your personal information (name, employee ID)
2. **Clock In**: Click "CHECK IN" when you arrive at your work location
3. **Clock Out**: Click "CHECK OUT" when you finish your shift
4. **Report Absences**: Use the "Report Absence" tab for sick days or time off
5. **View Records**: Check your timesheet and download PDF reports
6. **Get Help**: Visit the "Student Help" tab for FAQs and guidance

### For Administrators
1. **Login**: Use admin credentials to access management features
2. **View Reports**: Monitor all student time logs and absences
3. **Download Data**: Export comprehensive reports in multiple formats
4. **Manage Users**: View individual student records and performance

## Security & Privacy

- **Location Data**: Used only for attendance verification, stored securely
- **Data Encryption**: All sensitive data is encrypted in transit
- **Access Control**: Role-based permissions for students vs. administrators
- **Privacy Compliance**: Designed with student privacy regulations in mind

## Feature Roadmap

### High Priority
- QR Code check-in for contactless operation
- Offline functionality for poor connectivity areas
- Supervisor messaging system
- Photo verification for additional security

### Medium Priority
- Achievement badges for student engagement
- Weather alerts integration
- Voice command support
- Schedule calendar integration

### Future Enhancements
- Progressive Web App (PWA) installation
- Multi-language support (Spanish, etc.)
- Advanced analytics and reporting
- Integration with school management systems

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

This project follows modern React best practices:
- TypeScript for type safety
- Component-based architecture
- Responsive design principles
- Accessibility standards (WCAG 2.1)
- Performance optimization

## License

This project is designed for educational use in school transportation management.

## Support

For technical issues or feature requests, please refer to the built-in help system or contact your system administrator.
