import mongoose from 'mongoose';

const timeTableSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const TimeTable = mongoose.model('TimeTable', timeTableSchema);

export default TimeTable;
