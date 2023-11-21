import express from "express";
import cors from "cors";
import Pusher from "pusher";
import mongoose from "mongoose";
import { messageRouter } from "./routes/messages.js";
import { roomRouter } from "./routes/rooms.js";
import { userRouter } from "./routes/users.js";

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const pusher = new Pusher({
  appId: "1706916",
  key: "974638ea84054043aa65",
  secret: "dffe2fde00ce2a49c64e",
  cluster: "us3",
  useTLS: true,
});

app.get("/", (req, res) => {
  res.status(200).send("hello world");
});

app.use("/messages", messageRouter);
app.use("/rooms", roomRouter);
app.use("/users", userRouter);

mongoose.connect(
  "mongodb+srv://mscoggins:1AyCNtbz1kG5HGNP@cluster0.jutzrqb.mongodb.net/?retryWrites=true&w=majority"
);

const db = mongoose.connection;
db.once("open", () => {
  console.log("db connected");

  const roomsCollection = db.collection("rooms");
  const changeStream = roomsCollection.watch();

  changeStream.on("change", (change) => {
    //console.log(change);

    //console.log(change);
    if (change.operationType === "insert") {
      const roomDetails = change.fullDocument;
      pusher.trigger("rooms", "inserted", {
        name: roomDetails.name,
        _id: roomDetails._id,
        lastMessage: "",
      });
    } else if (change.operationType === "delete") {
      const roomDetails = change.documentKey;
      //console.log(roomDetails);
      pusher.trigger("rooms", "deleted", {
        roomId: roomDetails._id,
      });
    }
  });

  const messagesCollection = db.collection("messages");
  const changeStream2 = messagesCollection.watch();

  changeStream2.on("change", (change) => {
    //console.log(change);

    //console.log(change);
    if (change.operationType === "update") {
      //console.log(change.updateDescription.updatedFields);
      const updateDetails = change.updateDescription.updatedFields.messages;
      const messageDetails = updateDetails[updateDetails.length - 1];
      //console.log(messageDetails);
      pusher.trigger("messages", "updated", {
        name: messageDetails.name,
        message: messageDetails.message,
        timestamp: messageDetails.timestamp,
      });
    }
  });
});

app.listen(port, () => {
  console.log(`server started on port ${port}`);
});
