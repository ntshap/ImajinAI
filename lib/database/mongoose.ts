import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseConnection {
 conn: Mongoose | null;
 promise: Promise<Mongoose> | null;
}

declare global {
 var mongoose: MongooseConnection | undefined;
}

const cached: MongooseConnection = global.mongoose || {
 conn: null,
 promise: null
};

if (!global.mongoose) {
 global.mongoose = cached;
}

export const connectToDatabase = async (): Promise<Mongoose> => {
 if (cached.conn) return cached.conn;

 if (!MONGODB_URI) {
   throw new Error('Missing MONGODB_URI environment variable');
 }

 cached.promise = cached.promise || 
   mongoose.connect(MONGODB_URI, {
     dbName: 'imaginify',
     bufferCommands: false,
     retryWrites: false,
     tls: true,
     authMechanism: 'SCRAM-SHA-256',
     maxIdleTimeMS: 120000
   });

 try {
   cached.conn = await cached.promise;
 } catch (error) {
   cached.promise = null;
   throw error;
 }

 return cached.conn;
}
