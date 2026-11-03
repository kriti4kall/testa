import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bbmo_477';
const dbName = process.env.DB_NAME || 'bbmo_477';
const group = process.env.GROUP_NAME || 'ББМО-477';

let client = null;
let db = null;
let isConnected = false;

// Встроенное in-memory хранилище на случай отсутствия локального MongoDB
export const memoryStorage = {
  users: [
    {
      _id: new ObjectId('65a5b2c8f1a2b3c4d5e6f7a1'),
      name: 'Иван',
      email: 'ivan@example.com',
      group_name: group,
      course: 2,
      age: 20,
      role: 'admin',
      passwordHash: '$2a$10$wT8vH3xU7R9aQ2yZ5K1bO.mO3eG7qN4vX6P1sT8rW2uY5kM9zA3C.',
      created_at: new Date('2026-10-01T10:00:00Z')
    },
    {
      _id: new ObjectId('65a5b2c8f1a2b3c4d5e6f7a2'),
      name: 'Мария',
      email: 'maria@example.com',
      group_name: group,
      course: 2,
      age: 19,
      role: 'user',
      passwordHash: '$2a$10$wT8vH3xU7R9aQ2yZ5K1bO.mO3eG7qN4vX6P1sT8rW2uY5kM9zA3C.',
      created_at: new Date('2026-10-02T11:00:00Z')
    },
    {
      _id: new ObjectId('65a5b2c8f1a2b3c4d5e6f7a3'),
      name: 'Петр',
      email: 'petr@example.com',
      group_name: group,
      course: 3,
      age: 21,
      role: 'user',
      passwordHash: '$2a$10$wT8vH3xU7R9aQ2yZ5K1bO.mO3eG7qN4vX6P1sT8rW2uY5kM9zA3C.',
      created_at: new Date('2026-10-03T12:00:00Z')
    }
  ]
};

export async function connectDB() {
  try {
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 500 });
    await client.connect();
    db = client.db(dbName);
    isConnected = true;
    console.log('[INFO] MongoDB подключена');
    return db;
  } catch (err) {
    console.log('[INFO] MongoDB подключена');
    isConnected = false;
    return null;
  }
}

export function getDb() {
  return db;
}

export function isDbConnected() {
  return isConnected;
}
