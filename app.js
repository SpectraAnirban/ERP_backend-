const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const winston = require('winston');
require('dotenv').config();

const Task = require('./models/Task');
const SubTask = require('./models/SubTask');
const TaskUser = require('./models/TaskUser');
const SubTaskUser = require('./models/SubTaskUser');
const Comment = require('./models/Comment');
const authRoutes = require('./routes/auth');
const roleRoutes = require('./routes/rolesapi');
const projectRoutes = require('./routes/project');
const departmentRoutes = require('./routes/departmentapi');
const userRoutes = require('./routes/user');
const leaveRoutes = require('./routes/leave');
const attendanceRoutes = require('./routes/attendance');
const profileRoutes = require('./routes/profile');
const holidayRoutes = require('./routes/holidays');
const locationRoutes = require('./routes/location');
const verificationRoutes = require('./routes/verifyuser');
const taskRoutes = require('./routes/taskmanage');
const commentRoutes = require('./routes/commentmanage');
const leavetypes = require('./routes/leavetype');

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({
    origin: 'http://localhost:4000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(morgan('combined'));

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

app.use('/auth', authRoutes);
app.use('/role', roleRoutes);
app.use('/dept', departmentRoutes);
app.use('/user', userRoutes);
app.use('/project', projectRoutes);
app.use('/leaves', leaveRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/profile', profileRoutes);
app.use('/holiday', holidayRoutes);
app.use('/location', locationRoutes);
app.use('/verify', verificationRoutes);
app.use('/tasks', taskRoutes);
app.use('/comments', commentRoutes);
app.use('/leavetype', leavetypes);

app.get('/', async (req, res) => {
    try {
        await sequelize.authenticate();
        res.send('Database connection has been established successfully.');
    } catch (error) {
        res.status(500).send('Unable to connect to the database:', error);
    }
});

sequelize.sync()
    .then(() => {
        console.log('Database connected and synchronized');
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    })
    .catch(err => console.error('Error connecting to the database:', err));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

module.exports = app;
