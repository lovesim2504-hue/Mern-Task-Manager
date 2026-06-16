import { db } from '../libs/dbConnect.js';
import { ObjectId } from 'mongodb';

const collection = db.collection('tasks');


// ✅ GET TASKS BY USER
export const getTasksByUser = async (req, res, next) => {
  try {
    const query = { owner: new ObjectId(req.params.id) };

    const { status, orderBy } = req.query;

    if (status) query.status = status;

    const sort = orderBy ? { [orderBy]: 1 } : {};

    const page = parseInt(req.query.page) || 1;
    const pageSize = 4;

    const tasks = await collection
      .find(query)
      .sort(sort)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    const taskCount = await collection.countDocuments(query); // ✅ FIX

    res.status(200).json({ tasks, taskCount });

  } catch (error) {
    next({ status: 500, error });
  }
};


// ✅ GET SINGLE TASK
export const getTask = async (req, res, next) => {
  try {
    const task = await collection.findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!task) {
      return next({ status: 404, message: 'Task not found!' });
    }

    res.status(200).json(task);

  } catch (error) {
    next({ status: 500, error });
  }
};


// ✅ CREATE TASK
export const createTask = async (req, res, next) => {
  try {
    const newTask = {
      ...req.body,
      owner: new ObjectId(req.user.id), // 🔥 from token
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newTask);

    res.status(201).json({
      message: "Task created successfully ✅",
      taskId: result.insertedId,
    });

  } catch (error) {
    next({ status: 500, error });
  }
};


// ✅ DELETE TASK (SECURE)
export const deleteTask = async (req, res, next) => {
  try {
    const query = {
      _id: new ObjectId(req.params.id),
      owner: new ObjectId(req.user.id), // 🔥 only owner can delete
    };

    const result = await collection.deleteOne(query);

    if (result.deletedCount === 0) {
      return next({ status: 403, message: "Not allowed ❌" });
    }

    res.status(200).json({ message: 'Task deleted ✅' });

  } catch (error) {
    next({ status: 500, error });
  }
};


// ✅ UPDATE TASK (SECURE + FIXED)
export const updateTask = async (req, res, next) => {
  try {
    const query = {
      _id: new ObjectId(req.params.id),
      owner: new ObjectId(req.user.id), // 🔥 protect
    };

    const data = {
      $set: {
        ...req.body,
        updatedAt: new Date(),
      },
    };

    // ❌ DO NOT allow owner overwrite
    delete data.$set.owner;

    const updatedTask = await collection.findOneAndUpdate(
      query,
      data,
      { returnDocument: 'after' }
    );

    if (!updatedTask) {
      return next({ status: 403, message: "Not allowed ❌" });
    }

    res.status(200).json(updatedTask);

  } catch (error) {
    next({ status: 500, error });
  }
};