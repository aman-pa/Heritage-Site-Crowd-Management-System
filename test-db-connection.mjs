import mongoose from 'mongoose';

const uri = 'mongodb+srv://anvaya123:kQfoUfl02QP3rP1E@cluster0.dlekiba.mongodb.net/heritageDB';

console.log('Testing MongoDB Atlas connection...');
console.log('URI:', uri.substring(0, 50) + '...');

try {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });
  
  console.log('✅ Successfully connected to MongoDB Atlas!');
  console.log('Database:', mongoose.connection.db.databaseName);
  
  await mongoose.disconnect();
  console.log('✅ Disconnected successfully');
  process.exit(0);
} catch (error) {
  console.error('❌ Connection failed:', error.message);
  console.error('Error code:', error.code);
  console.error('Error name:', error.name);
  process.exit(1);
}
