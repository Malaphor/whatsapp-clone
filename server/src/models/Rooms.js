import mongoose, { Schema } from "mongoose";

const RoomSchema = mongoose.Schema({
  name: { type: String, required: true },
  messages: { type: Schema.Types.ObjectId, ref: "messages" },
});

export const RoomModel = mongoose.model("room", RoomSchema);
