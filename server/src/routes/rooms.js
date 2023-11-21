import express from "express";
import { RoomModel } from "../models/Rooms.js";
import { MessagesModel } from "../models/Messages.js";

const router = express.Router();

router.get("/getName/:roomId", async (req, res) => {
  try {
    const room = await RoomModel.findById(req.params.roomId);
    if (room) {
      res.status(200).send({ name: room.name });
    } else {
      res.send({ message: "room not found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.get("/getRooms", async (req, res) => {
  try {
    const rooms = await RoomModel.find().populate("messages");
    //console.log(rooms);
    let roomNameAndMessage = [];
    for (let i = 0; i < rooms.length; i++) {
      roomNameAndMessage.push({
        name: rooms[i].name,
        _id: rooms[i]._id,
        lastMessage:
          rooms[i].messages.messages[rooms[i].messages.messages.length - 1],
      });
    }
    //console.log(roomNameAndMessage);
    res.status(200).send(roomNameAndMessage);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.post("/newRoom", async (req, res) => {
  try {
    const newRoom = new RoomModel({
      name: req.body.name,
    });

    const newMessages = new MessagesModel({
      room: newRoom._id,
    });

    const messages = await newMessages.save();

    newRoom.messages = messages._id;

    const room = await newRoom.save();
    res.status(201).send();
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.delete("/delete", async (req, res) => {
  try {
    const room = await RoomModel.findByIdAndDelete(req.body.roomId);
    const messages = await MessagesModel.findByIdAndDelete(room.messages);

    res.json({ message: "Chat deleted", roomId: room._id });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

export { router as roomRouter };
