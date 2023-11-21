import React, { useContext, useEffect, useState } from "react";
import Pusher from "pusher-js";
import axios from "../axios";
import { Avatar, Button, IconButton } from "@mui/material";
import {
  DonutLarge,
  Chat,
  MoreVert,
  SearchOutlined,
} from "@mui/icons-material";
import SidebarChat from "./SidebarChat";
import "./Sidebar.css";
import { googleLogout } from "@react-oauth/google";
import { LoginContext } from "../contexts";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const [user, setUser] = useContext(LoginContext);
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profilePicture, setProfilePicture] = useState(user.picture);

  const logout = async () => {
    try {
      if (user.type === "email") {
        const response = await axios.post("/users/logout");
        localStorage.removeItem("access_token");
      } else {
        googleLogout();
      }
      setUser({ isLoggedIn: false, name: "", picture: "", type: "" });
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put("users/updateProfile", {
        profilePicture,
        accessToken: localStorage.getItem("access_token"),
      });
      if (response.data.message === "Profile updated") {
        setUser({ ...user, picture: response.data.picture });
      }
      setShowEditProfile(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const getRooms = async () => {
      try {
        const response = await axios.get("/rooms/getRooms");
        setRooms(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    getRooms();
  }, []);

  useEffect(() => {
    const pusher = new Pusher("974638ea84054043aa65", {
      cluster: "us3",
    });

    const channel = pusher.subscribe("rooms");
    channel.bind("inserted", (newRoom) => {
      setRooms([...rooms, newRoom]);
    });

    const channel2 = pusher.subscribe("rooms");
    channel.bind("deleted", (deletedRoom) => {
      const newRooms = rooms.filter((room) => room._id != deletedRoom.roomId);
      setRooms([...newRooms]);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [rooms]);

  return (
    <div className="sidebar">
      <div className="sidebarHeader">
        <Avatar src={user.picture} />
        {showEditProfile && (
          <div className="sidebarEditProfile">
            <form onSubmit={updateProfile}>
              <div className="form-group">
                <label htmlFor="profilePicture">Picture</label>
                <input
                  name="profilePicture"
                  type="text"
                  placeholder="http://www.profilePic.com"
                  value={profilePicture}
                  onChange={(e) => setProfilePicture(e.target.value)}
                />
              </div>
              <Button
                className="profileBack"
                type="button"
                onClick={() => {
                  setShowEditProfile(false);
                  setProfilePicture(user.picture);
                }}
              >
                Close
              </Button>
              <Button className="profileSubmit" type="submit">
                Update
              </Button>
            </form>
          </div>
        )}
        <div className="sidebarHeaderRight">
          <IconButton>
            <DonutLarge />
          </IconButton>
          <IconButton>
            <Chat />
          </IconButton>
          <IconButton onClick={() => setShowMore(!showMore)}>
            <MoreVert />
          </IconButton>
          {showMore && (
            <div className="sidebarShowMore">
              <p onClick={logout}>Logout</p>
              {user.type === "email" && (
                <p
                  onClick={() => {
                    setShowEditProfile(true);
                    setShowMore(false);
                  }}
                >
                  Edit Profile
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="sidebarSearch">
        <div className="sidebarSearchContainer">
          <SearchOutlined />
          <input type="text" placeholder="Search chats" />
        </div>
      </div>
      <div className="sidebarChats">
        <SidebarChat addNewChat={true} />
        {rooms.map((room) => (
          <SidebarChat
            addNewChat={false}
            key={room._id}
            id={room._id}
            name={room.name}
            lastMessage={room.lastMessage.message}
          />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
