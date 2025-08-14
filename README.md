# 🏭 Bulldog Garage Intern Time & Absence Tracker

A comprehensive web application designed for managing intern time tracking, absence reporting, safety training, and certification generation at Bulldog Garage.

![App Screenshot](https://github.com/user-attachments/assets/a5fe3ef7-bd13-4dd9-b114-62963ec6f7f3)

## ✨ Features

### 🕒 Time Tracking
- **Clock In/Out System**: Real-time location tracking with GPS coordinates
- **Device Management**: Track which device was used for each entry
- **Duration Calculation**: Automatic calculation of work hours
- **Geolocation Verification**: Ensures interns are on-site when clocking in/out
- **Monday-Thursday Restrictions**: Prevents weekend time entries

### 📝 Absence Management
- **Absence Logging**: Record planned absences with reasons
- **Date Selection**: Pick specific absence dates
- **Reason Tracking**: Categorize absences (sick, family, academic, etc.)
- **Submission History**: Track when absences were reported

### 📊 Timesheet Generation
- **Personal Timesheets**: View individual time records
- **PDF Export**: Download professional timesheet documents
- **HTML Export**: Web-friendly timesheet format
- **Filtering Options**: Search by employee ID and date ranges

### 🛡️ Safety Training System
- **Interactive Quizzes**: Multiple choice safety tests covering:
  - 🔧 **Workplace Safety Fundamentals**
  - ⚡ **Electrical Safety**
  - ⚗️ **Chemical Safety**
- **Progress Tracking**: Visual progress bars during tests
- **Immediate Feedback**: Real-time answer validation
- **100% Pass Requirement**: Must achieve perfect score to pass
- **Unlimited Retakes**: Students can retake failed tests
- **Back Navigation**: Red "BACK" button on every test screen

### 🎓 Certificate Generation
- **Automatic Certificates**: Generated upon 100% test completion
- **Anti-Forgery Protection**: Large watermark overlaying student details
- **Professional Design**: Clean, printable certificate format
- **Unique Certificate IDs**: Trackable certification numbers
- **HTML Download**: Certificates save as formatted HTML files

### 👨‍💼 Admin Dashboard
- **Comprehensive Reports**: View all intern activities
- **Multi-Format Downloads**: PDF, HTML, and CSV exports
- **Date Filtering**: Filter records by specific dates
- **Real-time Data**: Live updates of intern check-ins/outs
- **Absence Management**: Monitor and track all absence reports

### 📱 Progressive Web App (PWA)
- **Offline Capability**: Works without internet connection
- **App Installation**: Install directly to device home screen
- **Mobile Optimized**: Responsive design for all devices
- **Service Worker**: Background sync and caching

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v14 or higher)
- **npm** package manager

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Thomson-BG/intern-time-tracker.git
   cd intern-time-tracker
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open in browser**:
   Navigate to `http://localhost:5173/`

### Production Build

```bash
npm run build
npm run serve
```

## 🎯 Usage Guide

### For Interns

1. **📋 Fill out personal information** (Name, Employee ID, Device Name)
2. **🕐 Clock in when arriving** (GPS location will be captured)
3. **🕕 Clock out when leaving** (Duration automatically calculated)
4. **📅 Report absences** using the Absence tab
5. **📈 View timesheets** and download PDF reports
6. **🛡️ Complete safety training** tests to earn certificates

### Safety Training Process

1. **📚 Navigate to Safety Tests tab**
2. **🎯 Select a safety test** from available options
3. **📝 Answer all questions** (one at a time)
4. **✅ Submit answers** (immediate feedback provided)
5. **🎓 Download certificate** if 100% score achieved
6. **🔄 Retake if needed** (for scores below 100%)

### For Administrators

1. **🔐 Login using admin credentials**
2. **📊 View comprehensive dashboard** with all intern data
3. **📥 Download reports** in multiple formats (PDF, HTML, CSV)
4. **📅 Filter by date ranges** for specific reporting periods
5. **👥 Monitor real-time activity** across all interns

## 🛠️ Technology Stack

- **⚛️ React 19**: Modern frontend framework
- **📘 TypeScript**: Type-safe development
- **🎨 Tailwind CSS**: Utility-first styling
- **⚡ Vite**: Fast build tool and dev server
- **📱 PWA**: Progressive Web App capabilities
- **🌐 Service Workers**: Offline functionality
- **📍 Geolocation API**: GPS tracking
- **📄 jsPDF**: PDF generation
- **🔤 Font Awesome**: Icon library

## 📁 Project Structure

```
intern-time-tracker/
├── 📂 components/           # React components
│   ├── AdminPanel.tsx       # Administrator dashboard
│   ├── TimePanel.tsx        # Time tracking interface
│   ├── AbsencePanel.tsx     # Absence reporting
│   ├── SafetyTestPanel.tsx  # Safety training hub
│   ├── TestSelectionScreen.tsx  # Test selection interface
│   ├── SafetyTestComponent.tsx  # Individual test component
│   ├── TestResultsScreen.tsx    # Results and retake options
│   ├── CertificateGenerator.tsx # Certificate creation
│   └── ...other components
├── 📂 data/                 # Static data files
│   └── safetyTests.ts       # Safety test questions
├── 📂 utils/                # Utility functions
│   ├── downloadHelpers.ts  # Export functionality
│   └── appwrite.ts          # Database connections
├── 📂 types/                # TypeScript definitions
├── 📂 public/               # Static assets
└── 📂 src/                  # Source code
```

## 🔧 Configuration

### Environment Variables

```bash
GEMINI_API_KEY=your_gemini_api_key
JITI_DEBUG=false
JITI_CACHE=true
```

### Build Configuration

- **Vite Config**: `vite.config.ts`
- **Tailwind Config**: `tailwind.config.js`
- **TypeScript Config**: `tsconfig.json`
- **PostCSS Config**: `postcss.config.js`

## 🔒 Security Features

- **🔐 Admin Authentication**: Secure login system
- **📍 Location Verification**: GPS validation for time entries
- **🚫 Weekend Restrictions**: Prevents unauthorized time entries
- **🛡️ Certificate Protection**: Large watermarks prevent forgery
- **🔒 Data Validation**: Input sanitization and validation

## 📊 Reporting Features

### Time Reports
- **📈 Individual timesheets**
- **📅 Date-range filtering**
- **📄 PDF/HTML export**
- **⏱️ Duration calculations**

### Absence Reports
- **📋 Absence summaries**
- **📊 CSV exports**
- **📅 Date tracking**
- **📝 Reason categorization**

### Safety Training Reports
- **🎓 Certificate tracking**
- **📊 Test completion rates**
- **🔄 Retake statistics**
- **📈 Progress monitoring**

## 🤝 Contributing

1. **🍴 Fork the repository**
2. **🌿 Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **💾 Commit changes**: `git commit -m 'Add amazing feature'`
4. **📤 Push to branch**: `git push origin feature/amazing-feature`
5. **🔄 Open a Pull Request**

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- **📧 Email**: support@bulldoggarage.com
- **📱 Phone**: (555) 123-4567
- **🌐 Website**: [bulldoggarage.com](https://bulldoggarage.com)

## 🔄 Version History

- **v2.0.0** - Added Safety Training System with certificates
- **v1.5.0** - Enhanced admin dashboard and reporting
- **v1.0.0** - Initial release with time tracking and absence management

---

**🏭 Built with ❤️ for Bulldog Garage Interns**
