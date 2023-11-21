import express from "express";
import { MessagesModel } from "../models/Messages.js";

const router = express.Router();

const messageLimit = 50;

router.get("/sync/:roomId", async (req, res) => {
  try {
    const messages = await MessagesModel.findOne({ room: req.params.roomId })
      .sort({ createdAt: -1 })
      .limit(messageLimit);

    res.status(200).send(messages.messages);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/olderMessages/:roomId/:messagesChunk", async (req, res) => {
  //console.log("greg");
  try {
    const totalMessages = await MessagesModel.findOne({
      room: req.params.roomId,
    });
    if (req.params.messagesChunk >= totalMessages.messages.length) {
      res.status(200).send(null);
    } else {
      const messages = totalMessages.messages.slice(
        req.params.messagesChunk,
        messageLimit
      );

      res.status(200).send(messages);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post("/newMessage", async (req, res) => {
  try {
    const messages = await MessagesModel.findOne({ room: req.body.roomId });

    messages.messages = [
      ...messages.messages,
      {
        message: req.body.message,
        name: req.body.name,
        timestamp: new Date().toUTCString(),
      },
    ];

    const savedMessages = await messages.save();

    res.status(201).send(savedMessages);
  } catch (err) {
    res.status(500).send(err);
  }
});

export { router as messageRouter };
