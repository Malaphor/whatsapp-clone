import mongoose, { Schema } from "mongoose";

const MessagesSchema = mongoose.Schema({
  room: { type: Schema.Types.ObjectId, ref: "room", required: true },
  messages: [
    {
      message: { type: String, required: true },
      name: { type: String, required: true },
      timestamp: { type: String, required: true },
    },
  ],
});

export const MessagesModel = mongoose.model("messages", MessagesSchema);
