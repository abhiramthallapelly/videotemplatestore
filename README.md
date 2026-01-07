# Video Editing Store - Complete Digital Assets Platform

A comprehensive video editing store with admin dashboard, public store interface, user authentication, and beautiful landing page for ABHIRAM CREATIONS.

## 🏗️ Project Structure (Complete Ecosystem)

```
video-editing-store/
├── index.html                 # ABHIRAM CREATIONS Public Website (Port 3000)
├── store.html                 # Digital Assets Store (Port 3000/store.html)
├── admin-dashboard/           # React Admin Dashboard (Port 3001)
│   ├── src/                  # React source code
│   ├── public/               # Static assets
│   ├── package.json          # Frontend dependencies
│   └── start-admin.bat       # Admin dashboard startup script
├── backend/                   # Express.js Backend Server (Port 5050)
│   ├── routes/               # API route handlers
│   │   ├── admin.js          # Admin management routes
│   │   ├── public.js         # Public contact/review routes
│   │   ├── auth.js           # User authentication routes
│   │   └── store.js          # Store and download routes
│   ├── config/               # Database and middleware config
│   ├── uploads/              # File upload storage
│   └── server.js             # Main server file
├── start-complete-system.bat # Complete system startup script
└── README.md                  # This file
```

## 🚀 Quick Start

### **Option 1: Start Everything at Once (Recommended)**
   ```bash
# Run the complete startup script
start-complete-system.bat
   ```

### **Option 2: Start Services Individually**
   ```bash
# 1. Start Backend Server
   cd backend
   npm start
   
# 2. Start Admin Dashboard (in new terminal)
   cd admin-dashboard
   npm start
   
# 3. Start Public Website (in new terminal)
npx http-server -p 3000 -o
```

## 🌟 Features

### **🔐 User Authentication System**
- **User Registration**: Create accounts with username, email, and password
- **User Login**: Secure authentication with JWT tokens
- **Profile Management**: Update profile information and change passwords
- **Session Management**: Persistent login sessions with secure tokens

### **🛍️ Digital Assets Store**
- **Template Categories**: Video templates, project files, fonts, effects, graphics
- **Free & Paid Downloads**: Mix of free and premium content
- **Advanced Filtering**: Search by category, price, popularity, and date
- **Purchase System**: Track paid downloads and purchases
- **Download Management**: Secure file downloads with user verification

### **📊 Admin Dashboard**
- **Content Management**: Upload and manage templates, files, and assets
- **User Management**: Monitor user accounts and activities
- **Store Analytics**: Track downloads, purchases, and popular items
- **Category Management**: Organize content into logical groups
- **File Upload**: Support for various file types (XML, AEP, FFX, fonts, etc.)

### **🌐 Public Website**
- **Professional Landing Page**: Showcase services and portfolio
- **Contact Forms**: Integrated with backend for lead generation
- **Review System**: Customer testimonials and feedback collection
- **Responsive Design**: Mobile-optimized for all devices

## 🔧 Technical Stack

### **Backend**
- **Node.js + Express**: RESTful API server
- **SQLite Database**: Lightweight, file-based database
- **JWT Authentication**: Secure user sessions
- **bcrypt**: Password hashing and security
- **File Upload**: Multer for handling file uploads

### **Frontend**
- **React**: Admin dashboard interface
- **Vanilla JavaScript**: Public website and store
- **CSS3**: Modern, responsive styling
- **HTML5**: Semantic markup and accessibility

### **Database Schema**
- **Users**: User accounts and authentication
- **Projects**: Store items and templates
- **Categories**: Content organization
- **Purchases**: Payment tracking
- **Downloads**: Download history and analytics

## 📱 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Public Website** | http://localhost:3000 | Main landing page |
| **Store** | http://localhost:3000/store.html | Digital assets store |
| **Admin Dashboard** | http://localhost:3001 | Content management |
| **Backend API** | http://localhost:5050 | REST API endpoints |
| **Health Check** | http://localhost:5050/api/health | System status |

## 🛠️ API Endpoints

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### **Store**
- `GET /api/store/items` - Browse store items
- `GET /api/store/categories` - Get categories
- `GET /api/store/item/:id` - Get item details
- `POST /api/store/download/:id` - Download item
- `POST /api/store/purchase/:id` - Purchase item
- `GET /api/store/my-purchases` - User's purchases
- `GET /api/store/my-downloads` - Download history

### **Public**
- `POST /api/public/contact` - Contact form submission
- `POST /api/public/review` - Review submission

### **Admin**
- `POST /api/admin/upload` - Upload new content
- `GET /api/admin/projects` - List all projects
- `PUT /api/admin/project/:id` - Update project
- `DELETE /api/admin/project/:id` - Delete project

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure session management
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: Parameterized queries
- **CORS Configuration**: Controlled cross-origin access
- **File Upload Security**: Type and size validation

## 📁 File Support

### **Supported File Types**
- **Video Templates**: XML, PRPROJ, AEP, PSD, AI
- **Fonts**: TTF, OTF, WOFF, WOFF2
- **Effects**: FFX, Motion Graphics
- **Archives**: ZIP, RAR
- **Images**: JPG, PNG, GIF, SVG

### **Upload Limits**
- **File Size**: Configurable (default: 100MB)
- **Image Formats**: JPG, PNG, GIF, SVG
- **Video Formats**: MP4, AVI, MOV, MPEG

## 🚀 Deployment

### **Production Setup**
1. Set environment variables in `env.production`
2. Configure database path and JWT secret
3. Set up proper CORS origins
4. Configure file upload limits
5. Set up SSL certificates for HTTPS

### **Environment Variables**
```bash
NODE_ENV=production
PORT=5050
JWT_SECRET=your-super-secret-key
DB_PATH=./production-database.sqlite
ALLOWED_ORIGINS=https://yourdomain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software for ABHIRAM CREATIONS.

## 🆘 Support

For technical support or questions:
- Check the admin dashboard for system status
- Review the backend logs for errors
- Ensure all services are running on correct ports
- Verify database connectivity and file permissions

---

**Built with ❤️ for ABHIRAM CREATIONS - Transforming video editing one template at a time!** 