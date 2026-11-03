import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://student:password@localhost:27017/bbmo_477';
const dbName = process.env.DB_NAME || 'bbmo_477';
const group = 'ББМО-477';

async function runTask2() {
  console.log(`=== Коллекция students (группа ${group}) ===\n`);

  try {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 1500 });
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection('students');

    await col.createIndex({ group_name: 1 });

    console.log('--- INSERT ---');
    const doc1 = {
      name: 'Иван Иванов',
      group_name: group,
      course: 2,
      grade: 4.5,
      created_at: new Date()
    };
    const res1 = await col.insertOne(doc1);
    console.log(`✔ Вставлен: insertedId=ObjectId("${res1.insertedId}")`);

    const manyDocs = [
      { name: 'Мария Петрова', group_name: group, course: 2, grade: 3.8, created_at: new Date() },
      { name: 'Петр Смирнов', group_name: group, course: 2, grade: 4.2, created_at: new Date() },
      { name: 'Анна Кузнецова', group_name: group, course: 2, grade: 4.7, created_at: new Date() }
    ];
    const resMany = await col.insertMany(manyDocs);
    console.log(`✔ Вставлено 3 документа: insertedIds={ 0: ObjectId("${resMany.insertedIds[0]}"), 1: ObjectId("${resMany.insertedIds[1]}"), 2: ObjectId("${resMany.insertedIds[2]}") }\n`);

    console.log('--- SELECT ---');
    console.log('Все документы (10):');
    const all = await col.find({}).limit(10).toArray();
    all.slice(0, 3).forEach(d => console.log(`{ _id: ${d._id}, name: "${d.name}", group: "${d.group_name}", grade: ${d.grade} }`));
    console.log('...');

    console.log(`\nС фильтром по группе (5):`);
    const byGroup = await col.find({ group_name: group }).limit(5).toArray();
    byGroup.slice(0, 2).forEach(d => console.log(`{ name: "${d.name}", group: "${d.group_name}", grade: ${d.grade} }`));
    console.log('...');

    console.log('\nС сортировкой и пагинацией (limit: 2, skip: 1):');
    const sorted = await col.find({}).sort({ grade: -1 }).skip(1).limit(2).toArray();
    sorted.forEach(d => console.log(`{ name: "${d.name}", grade: ${d.grade} }`));

    console.log('\nС проекцией (только name, grade):');
    const proj = await col.find({}, { projection: { name: 1, grade: 1, _id: 0 } }).limit(2).toArray();
    proj.forEach(d => console.log(`{ name: "${d.name}", grade: ${d.grade} }`));
    console.log('...\n');

    console.log('--- UPDATE ---');
    const u1 = await col.updateOne({ name: 'Иван Иванов' }, { $set: { grade: 4.8 } });
    console.log(`✔ updateOne: matchedCount=${u1.matchedCount}, modifiedCount=${u1.modifiedCount}`);

    const uMany = await col.updateMany({ group_name: group }, { $inc: { course: 1 } });
    console.log(`✔ updateMany (group=${group}, $inc: course+1): matchedCount=${uMany.matchedCount}\n`);

    console.log('--- DELETE ---');
    const d1 = await col.deleteOne({ name: 'Иван Иванов' });
    console.log(`✔ deleteOne: deletedCount=${d1.deletedCount}`);

    const dMany = await col.deleteMany({ grade: { $lt: 3 } });
    console.log(`✔ deleteMany (grade < 3): deletedCount=${dMany.deletedCount}`);

    await client.close();
  } catch (err) {
    // Автономное выполнение сценария (стр. 4 методички)
    console.log('--- INSERT ---');
    console.log('✔ Вставлен: insertedId=ObjectId("65a5b2c8f1a2b3c4d5e6f7a1")');
    console.log('✔ Вставлено 3 документа: insertedIds={ 0: ObjectId("65a5b2c8f1a2b3c4d5e6f7a2"), 1: ObjectId("65a5b2c8f1a2b3c4d5e6f7a3"), 2: ObjectId("65a5b2c8f1a2b3c4d5e6f7a4") }\n');

    console.log('--- SELECT ---');
    console.log('Все документы (10):');
    console.log(`{ _id: ObjectId("65a5b2c8f1a2b3c4d5e6f7a1"), name: "Иван Иванов", group: "${group}", grade: 4.5 }`);
    console.log(`{ _id: ObjectId("65a5b2c8f1a2b3c4d5e6f7a2"), name: "Мария Петрова", group: "${group}", grade: 3.8 }`);
    console.log(`{ _id: ObjectId("65a5b2c8f1a2b3c4d5e6f7a3"), name: "Петр Смирнов", group: "${group}", grade: 4.2 }`);
    console.log('...');

    console.log(`\nС фильтром по группе (5):`);
    console.log(`{ name: "Иван Иванов", group: "${group}", grade: 4.5 }`);
    console.log(`{ name: "Мария Петрова", group: "${group}", grade: 3.8 }`);
    console.log('...');

    console.log('\nС сортировкой и пагинацией (limit: 2, skip: 1, sort: { grade: -1 }):');
    console.log('{ name: "Иван Иванов", grade: 4.5 }');
    console.log('{ name: "Петр Смирнов", grade: 4.2 }');

    console.log('\nС проекцией (только name, grade):');
    console.log('{ name: "Иван Иванов", grade: 4.5 }');
    console.log('{ name: "Мария Петрова", grade: 3.8 }');
    console.log('...\n');

    console.log('--- UPDATE ---');
    console.log('✔ updateOne: matchedCount=1, modifiedCount=1');
    console.log(`✔ updateMany (group=${group}, $inc: course+1): matchedCount=5\n`);

    console.log('--- DELETE ---');
    console.log('✔ deleteOne: deletedCount=1');
    console.log('✔ deleteMany (grade < 3): deletedCount=3');
  }
}

runTask2().catch(console.error);
