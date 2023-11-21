import React, { useContext, useEffect, useRef, useState } from "react";
import axios from "../axios.js";
import "./Chat.css";
import { Avatar, IconButton, useScrollTrigger } from "@mui/material";
import {
  AttachFile,
  InsertEmoticon,
  KeyboardDoubleArrowDown,
  Mic,
  MoreVert,
  SearchOutlined,
} from "@mui/icons-material";
import EmojiPicker from "emoji-picker-react";
import { useNavigate, useParams } from "react-router-dom";
import Pusher from "pusher-js";
import { LoginContext } from "../contexts.js";

const Chat = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useContext(LoginContext);
  const [input, setInput] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesChunk, setMessagesChunk] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const endMessagesRef = useRef(null);

  const getOlderMessages = async () => {
    try {
      const response = await axios.get(
        `/messages/olderMessages/${roomId}/${messagesChunk}`
      );
      if (response.data) {
        setMessages([...response.data, ...messages]);
        setMessagesChunk(messagesChunk + 50);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setShowEmojiPicker(false);

    const response = await axios.post("/messages/newMessage", {
      message: input,
      name: user.name,
      roomId,
    });

    setInput("");
  };

  const handleSearchMessages = (e) => {
    setSearchInput(e.target.value);
    const filteredMessages = messages.filter((message) => {
      message.message.includes(searchInput);
    });
  };

  const handleScroll = (e) => {
    if (e.target.scrollTop < 20 && roomId !== undefined) {
      getOlderMessages();
    }
    if (
      e.target.scrollTop <
      e.target.scrollHeight - e.target.clientHeight - 50
    ) {
      setShowScrollBottom(true);
    } else {
      setShowScrollBottom(false);
    }
  };

  const handleDeleteChat = async () => {
    setShowMore(false);
    try {
      const response = await axios.delete(`/rooms/delete`, {
        data: { roomId },
      });
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  const m = (message) => {
    return (
      <p
        key={Date.parse(message.timestamp)}
        className={`chatMessage ${
          message.name === user.name && "chatReceiver"
        }`}
      >
        <span className="chatName">{message.name}</span>
        {message.message}
        <span className="chatTimestamp">{message.timestamp}</span>
      </p>
    );
  };

  useEffect(() => {
    endMessagesRef.current?.scrollIntoView({ behavior: "instant" });
  }, [messages]);

  useEffect(() => {
    const getRoom = async () => {
      try {
        const response = await axios.get(`/rooms/getName/${roomId}`);
        setRoom(response.data.name);
      } catch (err) {
        console.error(err);
      }
    };
    const getMessages = async () => {
      try {
        const response = await axios.get(`/messages/sync/${roomId}`);
        setMessages(response.data);
        setMessagesChunk(50);
      } catch (err) {
        console.log(err);
      }
    };
    //console.log(roomId);
    if (roomId !== undefined) {
      getRoom();
      getMessages();
    } else {
      setMessages([]);
    }
  }, [roomId]);

  useEffect(() => {
    const pusher = new Pusher("974638ea84054043aa65", {
      cluster: "us3",
    });

    const channel = pusher.subscribe("messages");
    channel.bind("updated", (newMessage) => {
      setMessages([...messages, newMessage]);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [messages]);

  return (
    <div className="chat">
      <div className="chatHeader">
        {roomId && <Avatar />}
        <div className="chatHeaderInfo">
          {roomId && (
            <>
              <h3>{room}</h3>
              <p>
                {messages.length > 0 && messages[messages.length - 1].timestamp}
              </p>
            </>
          )}
        </div>
        <div className="chatHeaderRight">
          <IconButton
            onClick={() => {
              if (showSearch) {
                setShowSearch(false);
                setSearchInput("");
              } else {
                setShowSearch(true);
              }
            }}
          >
            <SearchOutlined />
          </IconButton>
          <IconButton>
            <AttachFile />
          </IconButton>
          {roomId !== undefined ? (
            <IconButton onClick={() => setShowMore(!showMore)}>
              <MoreVert />
            </IconButton>
          ) : (
            <IconButton>
              <MoreVert />
            </IconButton>
          )}
        </div>
        {showMore && (
          <div className="chatShowMore">
            <p onClick={handleDeleteChat}>Delete Chat</p>
          </div>
        )}
      </div>
      {showSearch && (
        <div className="searchMessages">
          {" "}
          <input
            value={searchInput}
            onChange={handleSearchMessages}
            type="text"
            placeholder="Search messages"
          />
        </div>
      )}
      <div className="chatBody" onScroll={handleScroll}>
        {searchInput !== ""
          ? messages
              .filter((message) => message.message.includes(searchInput))
              .map((message) => m(message))
          : messages.map((message) => m(message))}
        {showScrollBottom && (
          <IconButton
            className="scrollDown"
            onClick={() =>
              endMessagesRef.current?.scrollIntoView({ behavior: "instant" })
            }
          >
            <KeyboardDoubleArrowDown />
          </IconButton>
        )}
        <div ref={endMessagesRef}></div>
      </div>
      <div className="chatFooter">
        <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
          <InsertEmoticon />
        </IconButton>
        {showEmojiPicker && (
          <EmojiPicker
            skinTonesDisabled={true}
            lazyLoadEmojis={true}
            previewConfig={{ showPreview: false }}
            height={350}
            onEmojiClick={(emojiData) => setInput(input + emojiData.emoji)}
          />
        )}
        <form onSubmit={handleSendMessage}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            type="text"
            placeholder="Type a message"
          />
          <button type="submit">Send a message</button>
        </form>
        <Mic />
      </div>
    </div>
  );
};

export default Chat;
