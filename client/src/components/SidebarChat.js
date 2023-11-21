import React, { useEffect, useState } from "react";
import axios from "../axios";
import "./SidebarChat.css";
import { Avatar } from "@mui/material";
import { Link } from "react-router-dom";

const SidebarChat = ({ addNewChat, id, name, lastMessage }) => {
  const handleCreateChat = () => {
    const roomName = prompt("Enter name for new chat");

    if (roomName) {
      try {
        const response = axios.post("/rooms/newRoom", { name: roomName });
      } catch (err) {
        console.error(err);
      }
    }
  };
  //console.log(lastMessage);
  return !addNewChat ? (
    <Link to={`/rooms/${id}`}>
      <div className="sidebarChat">
        <Avatar />
        <div className="sidebarChatInfo">
          <h2>{name}</h2>
          <p>{lastMessage}</p>
        </div>
      </div>
    </Link>
  ) : (
    <div className="sidebarChat" onClick={handleCreateChat}>
      <h3>+ Create New Chat</h3>
    </div>
  );
};

export default SidebarChat;
