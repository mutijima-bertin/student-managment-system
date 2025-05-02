const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Student, Company, Internship } = require('../models'); // Updated the import statement to include `Internship`
const { authenticateToken, authorize } = require('../middleware/auth');

// Log the `User` model to verify if it is defined
console.log('User model:', User);

const router = express.Router();

// User registration route
router.post('/register', async (req, res) => {
    try {
        const { email, password, role = 'student' } = req.body; // Default role is 'student'

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await User.create({ email, password: hashedPassword, role });
        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        console.error('Error during user registration:', error); // Log the full error object
        res.status(500).json({ message: 'Error registering user', error });
    }
});

// User login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
});

// Profile Routes
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Error fetching profile', error });
    }
});

router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent updating role and password through this endpoint
        const { role, password, ...updateData } = req.body;
        await user.update(updateData);
        
        // Return user without password
        const updatedUser = await User.findByPk(user.id, {
            attributes: { exclude: ['password'] }
        });
        res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile', error });
    }
});

// Create a new student
router.post('/students', async (req, res) => {
    try {
        const student = await Student.create(req.body);
        res.status(201).json({ message: 'Student created successfully', student });
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({ message: 'Error creating student', error });
    }
});

// Get all students
router.get('/students', authenticateToken, authorize('admin', 'instructor'), async (req, res) => {
    try {
        const students = await Student.findAll();
        res.status(200).json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Error fetching students', error });
    }
});

// Get a single student by ID
router.get('/students/:id', authenticateToken, async (req, res) => {
    try {
        const student = await Student.findByPk(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.status(200).json(student);
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ message: 'Error fetching student', error });
    }
});

// Update a student by ID
router.put('/students/:id', authenticateToken, authorize('admin', 'instructor'), async (req, res) => {
    try {
        const student = await Student.findByPk(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        await student.update(req.body);
        res.status(200).json({ message: 'Student updated successfully', student });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ message: 'Error updating student', error });
    }
});

// Delete a student by ID
router.delete('/students/:id', authenticateToken, authorize('admin'), async (req, res) => {
    try {
        const student = await Student.findByPk(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        await student.destroy();
        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ message: 'Error deleting student', error });
    }
});

// Companies CRUD Operations
// Create a new company
router.post('/companies', authenticateToken, authorize('admin'), async (req, res) => {
    try {
        // Validate required fields
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ 
                message: 'Validation error', 
                errors: ['Company name is required'] 
            });
        }

        const company = await Company.create(req.body);
        res.status(201).json({ message: 'Company created successfully', company });
    } catch (error) {
        console.error('Error creating company:', error);
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ 
                message: 'Validation error', 
                errors: error.errors.map(err => err.message)
            });
        }
        res.status(500).json({ message: 'Error creating company', error });
    }
});

// Get all companies
router.get('/companies', authenticateToken, async (req, res) => {
    try {
        const companies = await Company.findAll();
        res.status(200).json(companies);
    } catch (error) {
        console.error('Error fetching companies:', error);
        res.status(500).json({ message: 'Error fetching companies', error });
    }
});

// Get a single company by ID
router.get('/companies/:id', authenticateToken, async (req, res) => {
    try {
        const company = await Company.findByPk(req.params.id);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }
        res.status(200).json(company);
    } catch (error) {
        console.error('Error fetching company:', error);
        res.status(500).json({ message: 'Error fetching company', error });
    }
});

// Update a company by ID
router.put('/companies/:id', authenticateToken, authorize('admin'), async (req, res) => {
    try {
        const company = await Company.findByPk(req.params.id);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }
        await company.update(req.body);
        res.status(200).json({ message: 'Company updated successfully', company });
    } catch (error) {
        console.error('Error updating company:', error);
        res.status(500).json({ message: 'Error updating company', error });
    }
});

// Delete a company by ID
router.delete('/companies/:id', authenticateToken, authorize('admin'), async (req, res) => {
    try {
        const company = await Company.findByPk(req.params.id);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }
        await company.destroy();
        res.status(200).json({ message: 'Company deleted successfully' });
    } catch (error) {
        console.error('Error deleting company:', error);
        res.status(500).json({ message: 'Error deleting company', error });
    }
});

// Internships CRUD Operations
// Create a new internship
router.post('/internships', authenticateToken, authorize('admin', 'instructor'), async (req, res) => {
    try {
        const internship = await Internship.create(req.body);
        const fullInternship = await Internship.findByPk(internship.id, {
            include: [
                { model: Company },
                { model: Student }
            ]
        });
        res.status(201).json({ message: 'Internship created successfully', internship: fullInternship });
    } catch (error) {
        console.error('Error creating internship:', error);
        res.status(500).json({ message: 'Error creating internship', error });
    }
});

// Get all internships with company and student details
router.get('/internships', authenticateToken, async (req, res) => {
    try {
        const internships = await Internship.findAll({
            include: [
                { model: Company },
                { model: Student }
            ]
        });
        res.status(200).json(internships);
    } catch (error) {
        console.error('Error fetching internships:', error);
        res.status(500).json({ message: 'Error fetching internships', error });
    }
});

// Get a single internship by ID with company and student details
router.get('/internships/:id', authenticateToken, async (req, res) => {
    try {
        const internship = await Internship.findByPk(req.params.id, {
            include: [
                { model: Company },
                { model: Student }
            ]
        });
        if (!internship) {
            return res.status(404).json({ message: 'Internship not found' });
        }
        res.status(200).json(internship);
    } catch (error) {
        console.error('Error fetching internship:', error);
        res.status(500).json({ message: 'Error fetching internship', error });
    }
});

// Update an internship by ID
router.put('/internships/:id', authenticateToken, authorize('admin', 'instructor'), async (req, res) => {
    try {
        const internship = await Internship.findByPk(req.params.id);
        if (!internship) {
            return res.status(404).json({ message: 'Internship not found' });
        }
        await internship.update(req.body);
        const updatedInternship = await Internship.findByPk(internship.id, {
            include: [
                { model: Company },
                { model: Student }
            ]
        });
        res.status(200).json({ message: 'Internship updated successfully', internship: updatedInternship });
    } catch (error) {
        console.error('Error updating internship:', error);
        res.status(500).json({ message: 'Error updating internship', error });
    }
});

// Delete an internship by ID
router.delete('/internships/:id', authenticateToken, authorize('admin'), async (req, res) => {
    try {
        const internship = await Internship.findByPk(req.params.id);
        if (!internship) {
            return res.status(404).json({ message: 'Internship not found' });
        }
        await internship.destroy();
        res.status(200).json({ message: 'Internship deleted successfully' });
    } catch (error) {
        console.error('Error deleting internship:', error);
        res.status(500).json({ message: 'Error deleting internship', error });
    }
});

module.exports = router;