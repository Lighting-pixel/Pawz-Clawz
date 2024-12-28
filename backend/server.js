const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config(); 

// Initialize Express
const app = express();


// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const userRoutes = require('./routes/user-route');
const productRoutes = require('./routes/product-route');
const orderRoutes = require('./routes/order-route');
const vendorRoutes = require('./routes/vendor-route');
const AuthRoutes = require('./routes/auth-route');
const CartRoutes = require('./routes/cart-route')

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/auths', AuthRoutes);
app.use('/api/carts', CartRoutes)

// Define the PORT 
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
