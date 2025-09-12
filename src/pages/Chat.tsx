import { useEffect, useRef, useState } from "react";
import useSocket from "../hooks/useSocket";
import { useParams } from "react-router";
import useAuth from "../hooks/useAuth";
import {
  Box,
  IconButton,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import MessageCard from "../components/MessageCard";
import SendIcon from "@mui/icons-material/Send";
import UserBadge from "../components/UserBadge";

const Chat = ({ activeUsers }) => {
  const { socket } = useSocket();
  const { id: docId } = useParams();
  const { user } = useAuth();

  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);
  const [value, setValue] = useState(0);
  const messagesEndRef = useRef(null);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleSendChat = () => {
    socket?.emit("chat:send", {
      userId: user?.id,
      docId,
      message: { username: user?.username, content: message },
    });
    setMessage("");
  };

  useEffect(() => {
    if (!socket) return;

    socket?.emit("chat:init", docId);

    socket?.on("chat:init", ({ messages, allMessagesLoaded }) => {
      const chatMessages = messages.map((mssg) => ({
        content: mssg.content,
        username: mssg.username,
        time: mssg.timestamp,
      }));

      setChats(chatMessages);

      if (!allMessagesLoaded) {
        const oldestTimestamp = chatMessages[0]?.time;

        socket.emit("chat:load-old-chats", docId, oldestTimestamp);
      }
    });

    socket?.on("chat:load-old-chats", (oldChats) => {
      setChats((prevChats) => [...oldChats, ...prevChats]);
    });

    socket?.on("chat:receive", (newMessage) => {
      setChats((prevChats) => [...prevChats, newMessage]);
    });

    return () => {
      socket?.off("chat:init");
      socket?.off("chat:receive");
      socket?.off("chat:load-old-chats");
    };
  }, [socket, docId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, value]);

  return (
    <div
      style={{
        position: "relative",
        marginTop: "1rem",
        marginRight: "1rem",
        border: "1px solid black",
        borderRadius: "5px",
        height: "calc(100vh - 90px)",
        width: "50vh",
      }}
    >
      <Box sx={{ width: "100%", bgcolor: "background.paper" }}>
        <Tabs value={value} onChange={handleChange} centered>
          <Tab sx={{ fontSize: "0.9rem" }} label="Chat" />
          <Tab
            sx={{ fontSize: "0.9rem" }}
            label={`Active Users (${activeUsers?.length})`}
          />
        </Tabs>
      </Box>
      {value === 0 ? (
        <>
          <Box
            sx={{
              padding: "0.9rem",
              height: "74vh",
              overflowY: "scroll",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {chats?.length > 0 ? (
              chats.map((chat, idx) => (
                <MessageCard
                  key={idx}
                  isOwner={chat?.username === user?.username}
                  senderName={chat?.username}
                  time={chat?.time || chat?.created_at || chat?.timestamp}
                  message={chat?.content}
                />
              ))
            ) : (
              <Typography
                sx={{
                  fontSize: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "gray",
                }}
              >
                No messages yet
              </Typography>
            )}
            <div ref={messagesEndRef} />
          </Box>

          <Box
            sx={{
              display: "flex",
              ml: 2,
              mr: 1,
              position: "absolute",
              bottom: "7px",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TextField
              id="outlined-basic"
              placeholder="Type a message..."
              variant="outlined"
              size="small"
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendChat();
                }
              }}
              sx={{ width: "19.5vw" }}
            />
            <IconButton onClick={handleSendChat} color="primary">
              <SendIcon sx={{ fontSize: "2rem" }} />
            </IconButton>
          </Box>
        </>
      ) : (
        <>
          <Box sx={{ overflowY: "scroll", height: "80vh" }}>
            {activeUsers?.length > 0 &&
              Array.from(new Set(activeUsers.map((user) => user.username))).map(
                (username, idx) => <UserBadge key={idx} username={username} />
              )}
          </Box>
        </>
      )}
    </div>
  );
};

export default Chat;
