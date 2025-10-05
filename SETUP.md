# Notes Sharing Platform - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

Follow these steps to get your notes sharing platform up and running:

### Step 1: Install Dependencies

**Backend:**
```powershell
cd backend
npm install
```

**Frontend:**
```powershell
cd frontend
npm install
```

### Step 2: Azure Services Configuration

The application is pre-configured to use Azure services:
- **Azure Cosmos DB**: MongoDB-compatible database
- **Azure Blob Storage**: Secure file storage

### Step 3: Environment Variables

Create a `.env` file in the backend directory with your Azure service credentials:
```env
MONGODB_URI=your_azure_cosmos_db_connection_string
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
ADMIN_EMAIL=admin@notessharing.com
ADMIN_PASSWORD=admin123

# Azure Blob Storage Configuration
AZURE_STORAGE_CONNECTION_STRING=your_azure_storage_connection_string
AZURE_CONTAINER_NAME=notes-files
```

### Step 4: Start the Applications

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm start
```

### Step 5: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

### Step 6: Admin Access

Use these credentials to access the admin panel:
- **Email**: admin@notessharing.com
- **Password**: admin123

## 📁 What's Included

✅ **Complete Authentication System**
- User registration and login
- JWT token-based authentication
- Admin role management

✅ **File Upload System**
- PDF upload with validation
- File size limits (10MB)
- Secure file storage

✅ **User Features**
- Browse and search notes
- Filter by subject
- Download tracking
- Personal notes management

✅ **Admin Panel**
- User management
- Note approval system
- Platform statistics
- Content moderation

✅ **Responsive Design**
- Mobile-friendly interface
- Clean and modern UI
- Toast notifications

## 🛠️ Project Structure

```
notes-sharing/
├── backend/           # Node.js + Express API
│   ├── models/       # MongoDB schemas
│   ├── routes/       # API endpoints
│   ├── middleware/   # Authentication & validation
│   └── uploads/      # File storage
├── frontend/         # React.js application
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/      # Page components
│   │   └── context/    # Authentication context
└── README.md
```

## 🔧 Troubleshooting

**Azure Cosmos DB Connection Issues:**
- Verify the connection string is correct
- Check Azure Cosmos DB firewall settings
- Ensure your IP is whitelisted in Azure

**Azure Blob Storage Issues:**
- Verify the storage account connection string
- Check if the storage account exists and is accessible
- Container will be created automatically

**Port Already in Use:**
- Change the PORT in `.env` file
- Kill any process using ports 3000 or 5000

**File Upload Issues:**
- Check Azure Storage connection string
- Verify storage account permissions

## 📚 Usage

1. **Students** can register, upload notes, and download resources
2. **Admins** can manage users and moderate content
3. **Everyone** can browse and download approved notes

Your notes sharing platform is now ready! 🎉