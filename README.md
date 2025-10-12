# Farm2Market: A Digital Bridge for Maximizing Farmer Profits

![Farm2Market Logo](https://img.shields.io/badge/Smart%20India%20Hackathon-2025-green)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)

## 🌾 Farm2Market - Agricultural Marketplace

A full-stack web application connecting farmers directly with buyers, eliminating middlemen and ensuring fair prices for fresh produce.

## 🚀 Features

- **For Farmers**: 
  - Sell crops directly to buyers
  - Upload crop photos and details
  - Manage inventory and pricing
  - Track orders and earnings

- **For Buyers**:
  - Browse fresh produce marketplace
  - Search and filter by location, category, price
  - View farmer profiles and ratings
  - Add crops to cart and place orders

- **General**:
  - User authentication and authorization
  - Image upload and display
  - Real-time search and filtering
  - Responsive design with Tailwind CSS

## 🛠️ Tech Stack

**Frontend:**
- React 18 with Hooks
- React Router for navigation
- React Query for data fetching
- Tailwind CSS for styling
- Lucide React for icons
- React Hot Toast for notifications

**Backend:**
- Node.js with Express.js
- JWT authentication
- Bcrypt for password hashing
- Multer for file uploads
- Express Validator for input validation
- CORS for cross-origin requests

**Database:**
- In-memory database (for demo)
- Pre-seeded with test data

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Farm2Market
```

### 2. Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd ../client
npm install
```

### 3. Environment Setup

Create `.env` file in the server directory:
```bash
cd ../server
cp .env.example .env
```

Update the `.env` file with your configuration:
```env
PORT=5002
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

### 4. Run the Application

**Start Backend Server:**
```bash
cd server
node index.js
```
Backend will run on `http://localhost:5002`

**Start Frontend (in new terminal):**
```bash
cd client
npx react-scripts start
```
Frontend will run on `http://localhost:3000`

## 🔐 Test Accounts

The application comes with pre-configured test accounts:

**Farmer Account:**
- Email: `farmer@test.com`
- Password: `farmer123`

**Buyer Account:**
- Email: `buyer@test.com`
- Password: `buyer123`

**Admin Account:**
- Email: `admin@test.com`
- Password: `admin123`

## 📁 Project Structure

```
Farm2Market/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── App.js
│   └── package.json
├── server/                 # Node.js backend
│   ├── middleware/         # Express middleware
│   ├── models/            # Data models
│   ├── routes/            # API routes
│   ├── uploads/           # File upload directory
│   ├── db.js              # Database simulation
│   ├── seedData.js        # Sample data
│   └── index.js           # Server entry point
└── README.md
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Crops
- `GET /api/crops` - Get all crops (with filters)
- `POST /api/crops` - Create new crop (farmers only)
- `GET /api/crops/:id` - Get single crop
- `PUT /api/crops/:id` - Update crop (farmers only)
- `DELETE /api/crops/:id` - Delete crop (farmers only)
- `GET /api/crops/farmer/my-crops` - Get farmer's crops

### Other
- `GET /api/crops/categories` - Get crop categories
- `GET /api/crops/prices/recent` - Get recent prices
- `GET /api/health` - Health check

## 🖼️ Sample Data

The application comes with 3 sample crops:
- Organic Tomatoes (₹80/kg)
- Basmati Rice (₹120/kg)  
- Fresh Spinach (₹40/kg)

All with actual uploaded images and complete farmer information.

## 🚀 Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in environment
2. Configure production database
3. Set secure JWT_SECRET
4. Deploy to platforms like Heroku, Railway, or DigitalOcean

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy build folder to platforms like Netlify, Vercel, or serve from Express

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is open source and available under the MIT License.

## 🔧 Troubleshooting

**Common Issues:**

1. **Port already in use**: Change port in `.env` file
2. **CORS errors**: Ensure backend is running and CORS is configured
3. **Images not loading**: Check if uploads directory exists and static serving is configured
4. **Authentication issues**: Verify JWT_SECRET is set correctly

**Reset Database:**
- Restart the server to reload sample data (in-memory database)

## 📞 Support

For questions or issues, please create an issue in the GitHub repository.

---

Built with ❤️ for connecting farmers and buyers directly.
