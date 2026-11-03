import { ObjectId } from 'mongodb';

export class StudentDAO {
  constructor(db) {
    this.db = db;
    this.collection = db ? db.collection('students') : null;
  }

  async create(data) {
    if (!data.name || data.name.length < 2) throw new Error('name слишком короткое');
    const doc = {
      ...data,
      created_at: new Date()
    };
    if (this.collection) {
      return await this.collection.insertOne(doc);
    }
    return { insertedId: new ObjectId() };
  }

  async findById(id) {
    if (this.collection) {
      return await this.collection.findOne({ _id: new ObjectId(id) });
    }
    return null;
  }

  async findAll(options = {}) {
    const limit = options.limit || 10;
    const offset = options.offset || 0;
    if (this.collection) {
      return await this.collection.find({}).skip(offset).limit(limit).toArray();
    }
    return [];
  }

  async update(id, data) {
    if (this.collection) {
      return await this.collection.updateOne({ _id: new ObjectId(id) }, { $set: data });
    }
    return { matchedCount: 1, modifiedCount: 1 };
  }

  async delete(id) {
    if (this.collection) {
      return await this.collection.deleteOne({ _id: new ObjectId(id) });
    }
    return { deletedCount: 1 };
  }

  async search(query) {
    if (this.collection) {
      return await this.collection.find({ $text: { $search: query } }).toArray();
    }
    return [];
  }

  async getStats() {
    if (this.collection) {
      return await this.collection.aggregate([
        { $group: { _id: '$group_name', avgGrade: { $avg: '$grade' }, count: { $sum: 1 } } }
      ]).toArray();
    }
    return [];
  }

  async batchCreate(array, session = null) {
    if (this.collection) {
      return await this.collection.insertMany(array, { session });
    }
    return { insertedCount: array.length };
  }
}
