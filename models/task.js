import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: false,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  category: {
    type: String,
    enum: ["shopping", "travail", "personnel", "administration"],
    required: true,
  },
  categoryColor: {
    type: String,
    default: "#007aff",
  },
});

const Task = mongoose.model("Task", taskSchema);
export default Task;
