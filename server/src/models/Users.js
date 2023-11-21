import mongoose from "mongoose";

const UserSchema = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  name: String,
  picture: String,
  accessToken: String,
});

export const UserModel = mongoose.model("user", UserSchema);
