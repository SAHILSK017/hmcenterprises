import mongoose from "mongoose";

const { Schema, models, model } = mongoose;

const CounterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 10000 },
});

export const Counter = models.Counter || model("Counter", CounterSchema);
