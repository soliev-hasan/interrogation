import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/UserModel';
import Interrogation from './src/models/InterrogationModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production";

const testInterrogationAccess = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/interrogation');
    console.log('Connected to database');

    // Create a test investigator user if not exists
    let investigatorUser = await User.findOne({ username: 'testinvestigator' });
    if (!investigatorUser) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash('testpass123', saltRounds);
      
      investigatorUser = new User({
        username: 'testinvestigator',
        email: 'testinvestigator@mvd.local',
        password: hashedPassword,
        role: 'investigator'
      });
      
      await investigatorUser.save();
      console.log('Created test investigator user');
    } else {
      console.log('Test investigator user already exists');
    }

    // Generate token for the investigator
    const token = jwt.sign(
      { userId: investigatorUser._id, role: investigatorUser.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
    console.log('Generated token for investigator:', token);

    // Create a test interrogation for this user
    const testInterrogation = new Interrogation({
      title: 'Test Interrogation by Investigator',
      date: new Date(),
      suspect: 'Test Suspect',
      officer: 'Test Officer',
      notes: 'Test notes',
      createdBy: investigatorUser._id
    });

    const savedInterrogation = await testInterrogation.save();
    console.log('Created test interrogation with ID:', savedInterrogation._id);

    // Try to access the interrogation as the creator
    console.log('Testing access by creator...');
    const interrogation = await Interrogation.findById(savedInterrogation._id);
    
    if (interrogation) {
      const creatorId = interrogation.createdBy.toString();
      const userId = investigatorUser._id.toString();
      
      console.log('Interrogation creator ID:', creatorId);
      console.log('Requesting user ID:', userId);
      console.log('Are they equal?', creatorId === userId);
      
      if (creatorId === userId) {
        console.log('SUCCESS: Investigator can access their own interrogation');
      } else {
        console.log('FAILURE: Investigator cannot access their own interrogation');
      }
    } else {
      console.log('FAILURE: Could not find the interrogation');
    }

    // Clean up - delete the test interrogation
    await Interrogation.findByIdAndDelete(savedInterrogation._id);
    console.log('Cleaned up test interrogation');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error in test:', error);
    mongoose.connection.close();
  }
};

testInterrogationAccess();