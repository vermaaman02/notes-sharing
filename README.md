# Notes Sharing Platform

A simple web application that allows students to share and access study materials like PDF notes. Built with React.js and Node.js.

## Features

- **User Authentication**: Register and login system for students
- **Admin Panel**: Special admin access for managing users and notes
- **File Upload**: Upload PDF notes with descriptions and subject categorization
- **Search & Filter**: Search notes by title/description and filter by subject
- **Download Tracking**: Track how many times each note has been downloaded
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React.js, React Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: Azure Cosmos DB (MongoDB API)
- **File Storage**: Azure Blob Storage
- **Authentication**: JWT tokens
- **File Upload**: Multer with Azure Storage integration
- **UI**: CSS3 with responsive design

## Project Structure

```
notes-sharing/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── uploads/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── App.js
│   ├── public/
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd notes-sharing
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration**
   
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

5. **Azure Services Setup**
   
   The application is configured to use:
   - **Azure Cosmos DB**: For MongoDB-compatible database storage
   - **Azure Blob Storage**: For secure PDF file storage with automatic container creation

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on http://localhost:5000

2. **Start the Frontend Application**
   ```bash
   cd frontend
   npm start
   ```
   The frontend will run on http://localhost:3000

## Usage

### For Students

1. **Register/Login**: Create an account or login with existing credentials
2. **Browse Notes**: View all available notes on the home page
3. **Search**: Use the search bar to find specific notes
4. **Filter**: Filter notes by subject
5. **Upload**: Upload your own PDF notes to share with others
6. **Download**: Download any available notes
7. **My Notes**: View and manage your uploaded notes

### For Admins

1. **Admin Login**: 
   - Email: admin@notessharing.com
   - Password: admin123

2. **Admin Panel**: Access the admin panel to:
   - View platform statistics
   - Manage all users
   - Manage all notes (approve/disapprove/delete)
   - Monitor downloads and user activity

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Notes Endpoints

- `GET /api/notes` - Get all approved notes (public)
- `POST /api/notes/upload` - Upload a new note (authenticated)
- `GET /api/notes/download/:id` - Download a specific note
- `GET /api/notes/my-notes` - Get user's uploaded notes (authenticated)

### Admin Endpoints

- `GET /api/admin/stats` - Get platform statistics (admin only)
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/notes` - Get all notes (admin only)
- `DELETE /api/admin/notes/:id` - Delete a note (admin only)
- `PATCH /api/admin/notes/:id/approve` - Toggle note approval (admin only)
- `DELETE /api/admin/users/:id` - Delete a user (admin only)

## File Upload

- Only PDF files are allowed
- Maximum file size: 10MB
- Files are stored securely in Azure Blob Storage
- Original filenames are preserved with unique blob identifiers
- Automatic container creation with public read access
- Built-in CDN capabilities for fast file delivery

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected routes for authenticated users
- Admin-only routes for administrative functions
- File type validation for uploads
- Input validation and sanitization

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please create an issue in the GitHub repository.