import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://student:password@localhost:27017/bbmo_477';
const dbName = process.env.DB_NAME || 'bbmo_477';

export const client = new MongoClient(uri, { serverSelectionTimeoutMS: 1500 });
export const getDb = () => client.db(dbName);
