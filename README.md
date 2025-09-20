# MyKhata - Personal Finance Management System

**MyKhata** is a comprehensive personal finance management system built with modern web technologies. It provides users with **intuitive tools** for tracking **income**, **expenses**, and **financial insights** through an **AI-powered platform** with **advanced analytics**, **receipt scanning**, **real-time data visualization**, and **secure user authentication**.

## 🚀 Technology Stack

### Frontend
- **React** - Modern UI library with hooks and context
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Chart.js** - Interactive data visualization
- **React Router DOM** - Client-side routing
- **React Hot Toast** - Toast notifications
- **React Dropzone** - File upload with drag & drop
- **React Webcam** - Camera integration
- **React Helmet Async** - SEO and meta management

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - Stateless authentication
- **Bcryptjs** - Password hashing
- **Cloudinary** - Cloud image storage and processing
- **Multer** - File upload handling
- **Node-Cache** - In-memory caching
- **Moment.js** - Date manipulation

### AI & Processing
- **Tesseract.js** - OCR (Optical Character Recognition)
- **Smart Categorization** - ML-based transaction categorization
- **Cloud Storage** - Scalable image storage and processing

## ✨ Features

### 🔐 Authentication & Security
- **User Registration & Login**: Secure account creation and authentication
- **JWT Token Management**: Stateless authentication with automatic token refresh
- **Password Encryption**: Bcrypt hashing for secure password storage
- **Protected Routes**: Role-based access control for application sections
- **Session Management**: Automatic token refresh and secure logout

### 💰 Transaction Management
- **CRUD Operations**: Create, read, update, and delete financial transactions
- **Multi-category Support**: Organize transactions with customizable categories
- **Date Range Filtering**: Filter transactions by custom date ranges
- **Advanced Search**: Search transactions by description, category, or amount
- **Bulk Operations**: Efficient management of multiple transactions
- **Currency Support**: Multi-currency transaction support (INR, USD, EUR, etc.)
- **Transaction Validation**: Real-time form validation and error handling

### 📄 Receipt Management
- **AI-Powered Scanning**: Automatic receipt data extraction using Tesseract.js OCR
- **Single & Batch Processing**: Process individual receipts or multiple receipts at once
- **Receipt History**: View and manage all scanned receipts with status tracking
- **Data Validation**: Automatic validation and correction of extracted data
- **Receipt Overview**: Statistical overview with processed/pending amounts
- **Camera Integration**: Direct camera capture for both mobile and desktop
- **File Upload**: Support for image file uploads (JPG, PNG, PDF) with drag & drop
- **Cloud Storage**: Automatic image storage with Cloudinary integration
- **Smart Categorization**: AI-powered transaction categorization based on merchant patterns

### 📊 Data Visualization & Analytics
- **Interactive Charts**: Dynamic line and bar charts using Chart.js
- **Merchant Insights**: Detailed analysis of spending patterns by merchant
- **Time Trends**: Receipt processing trends and analytics over time
- **Receipt Analytics**: Comprehensive statistics and processing metrics
- **Real-time Insights**: Automated financial insights and trends
- **Responsive Charts**: Optimized visualization for all screen sizes
- **Dashboard Overview**: Centralized view of financial health and trends

### 🎨 User Experience
- **Dark/Light Theme**: Toggle between themes for personalized experience
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Smooth Animations**: Framer Motion powered transitions and interactions
- **Toast Notifications**: Real-time feedback for user actions
- **Loading States**: Optimistic UI with skeleton loading components
- **Error Boundaries**: Comprehensive error handling and fallback UI
- **Accessibility**: Keyboard navigation and screen reader support

### 📈 Analytics & Exports
- **Data Export**: Export receipt and transaction data in PDF, CSV, and JSON formats
- **Customizable Reports**: Generate comprehensive reports with charts and analytics
- **Receipt Data Export**: Export scanned receipt data with processing status
- **Transaction Data Export**: Export financial transaction data with filtering options
- **Data Persistence**: Automatic data saving and synchronization
- **Performance Optimization**: Code splitting and lazy loading

### 🧠 AI & Smart Features
- **Smart Categorization**: ML-based merchant recognition and auto-categorization
- **Pattern Learning**: Learns from user's historical categorization patterns
- **Confidence Scoring**: Provides confidence levels for AI predictions
- **Fallback Categories**: Intelligent fallback to default categories
- **Merchant Recognition**: Advanced pattern matching for merchant identification

### ⚡ Performance & Optimization
- **Code Splitting**: Lazy loading of components for faster initial load
- **Caching System**: Multi-layer caching for improved performance
- **Memory Management**: Efficient memory usage and cleanup
- **Image Optimization**: Automatic image compression and optimization
- **Bundle Optimization**: Minimized and optimized production builds

## 🏗️ Architecture & Project Structure

### Backend Services
- **User Management**: JWT-based authentication with bcrypt password hashing
- **Transaction Processing**: CRUD operations with category management
- **Receipt Processing**: OCR-based data extraction with Tesseract.js
- **Smart Categorization**: ML-powered merchant recognition and categorization
- **Cloud Storage**: Cloudinary integration for image storage and processing
- **Caching System**: Multi-layer caching with Node-Cache for performance
- **Export Services**: PDF, CSV, and JSON data export functionality
- **Analytics Engine**: Real-time insights and spending pattern analysis

### Frontend Architecture
- **Component-Based**: Modular React components with custom hooks
- **State Management**: Context API for global state management
- **Routing**: React Router with protected routes and lazy loading
- **UI Framework**: Tailwind CSS with custom design system
- **Animation**: Framer Motion for smooth transitions and interactions
- **Data Visualization**: Chart.js for interactive charts and analytics
- **File Handling**: React Dropzone for drag-and-drop file uploads
- **Camera Integration**: React Webcam for mobile and desktop camera access

### Key Components
- **ReceiptScanner**: AI-powered receipt scanning with OCR processing
- **BatchProcessor**: Multi-receipt processing and management
- **DashboardChart**: Interactive financial data visualization
- **TransactionForm**: Smart form with validation and auto-categorization
- **ExportManager**: Comprehensive data export functionality
- **SmartCategorySelector**: AI-powered category suggestions

### Custom Hooks
- **useScannerOperations**: Handles receipt scanning and transaction creation
- **useReceiptOperations**: Manages receipt history and editing
- **useCameraOperations**: Camera functionality for mobile and desktop
- **useAuth**: Authentication state and user management
- **useTheme**: Dark/light theme management

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Cloudinary account (for image storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dhyan2815/MyKhata.git
   cd MyKhata
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**
   - Create `.env` file in backend directory
   - Add MongoDB connection string
   - Add Cloudinary credentials
   - Add JWT secret key

5. **Start the application**
   ```bash
   # Start backend server
   cd backend && npm run dev
   
   # Start frontend development server
   cd frontend && npm run dev
   ```

## 📱 Features Overview

### Core Functionality
- **Transaction Management**: Add, edit, delete, and categorize financial transactions
- **Receipt Scanning**: AI-powered receipt processing with automatic data extraction
- **Analytics Dashboard**: Comprehensive financial insights and trends
- **Data Export**: Export data in multiple formats (PDF, CSV, JSON)
- **Smart Categorization**: AI-powered transaction categorization
- **Multi-currency Support**: Support for various currencies

### Advanced Features
- **Batch Processing**: Process multiple receipts simultaneously
- **Cloud Storage**: Automatic image storage and optimization
- **Real-time Insights**: Automated financial analysis and recommendations
- **Responsive Design**: Mobile-first approach with cross-platform compatibility
- **Theme Support**: Dark and light mode with smooth transitions
- **Performance Optimization**: Lazy loading and caching for optimal performance

## 🛠️ Development

### Backend Development
- **API Routes**: RESTful API with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based security
- **File Processing**: Multer for file uploads
- **Caching**: Node-Cache for performance optimization

### Frontend Development
- **Build Tool**: Vite for fast development and building
- **Styling**: Tailwind CSS with custom components
- **State Management**: React Context API
- **Routing**: React Router with lazy loading
- **Animations**: Framer Motion for smooth interactions

## 📊 Performance Metrics

- **Bundle Size**: Optimized with code splitting and lazy loading
- **Load Time**: Fast initial load with Vite and optimized assets
- **Memory Usage**: Efficient memory management with proper cleanup
- **Caching**: Multi-layer caching for improved performance
- **Image Optimization**: Automatic compression and optimization

## 🔧 Configuration

### Environment Variables
```env
# Backend
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend
VITE_API_URL=http://localhost:5000/api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) for the amazing frontend framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Chart.js](https://www.chartjs.org/) for data visualization
- [MongoDB Atlas](https://www.mongodb.com/atlas) for cloud database hosting
- [React Dropzone](https://react-dropzone.js.org/) for file upload functionality
- [React Hot Toast](https://react-hot-toast.com/) for notifications
- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- [Tesseract.js](https://tesseract.projectnaptha.com/) for OCR processing
- [Cloudinary](https://cloudinary.com/) for image storage and processing

---

**Made by [Dhyan Patel](https://github.com/dhyan2815)**
