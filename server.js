import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import adminRoutes from './Routes/admin.routes.js';
import reporterRoutes from './Routes/reporter.routes.js';
import userRoutes from './Routes/user.routes.js';
import connectDB from './Config/db.js';
import superadminRoutes from './Routes/superAdmin.routes.js'
const app = express();
const PORT = process.env.PORT || 8004;
 

connectDB();

app.use(cors({
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/v1/superadmin', superadminRoutes); // NEW ROUTE FOR SUPERADMIN
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/reporter', reporterRoutes);
app.use('/api/v1/user', userRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});