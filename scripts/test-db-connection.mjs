import { MongoClient } from 'mongodb';

const MONGO_URI = 'mongodb+srv://anvaya123:kQfoUfl02QP3rP1E@cluster0.dlekiba.mongodb.net/heritageDB';

async function testConnection() {
  console.log('🔍 Testing MongoDB Atlas connection...\n');
  console.log('Connection string:', MONGO_URI.replace(/:[^:@]+@/, ':****@'));
  
  const client = new MongoClient(MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  });

  try {
    console.log('📡 Attempting to connect...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB Atlas!\n');

    const db = client.db();
    console.log('📊 Database name:', db.databaseName);
    
    const collections = await db.listCollections().toArray();
    console.log('📁 Collections found:', collections.length);
    collections.forEach(col => console.log('  -', col.name));
    
    const adminDb = client.db().admin();
    const serverStatus = await adminDb.ping();
    console.log('\n🏓 Server ping:', serverStatus);

  } catch (error) {
    console.error('❌ Connection failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      console.error('\n💡 Network/DNS issue - check your internet connection');
    } else if (error.message.includes('authentication')) {
      console.error('\n💡 Authentication issue - verify credentials');
    } else if (error.message.includes('IP')) {
      console.error('\n💡 IP whitelist issue - add your IP in Atlas Network Access');
    }
  } finally {
    await client.close();
    console.log('\n🔌 Connection closed');
  }
}

testConnection();
