import useSocket from "../hooks/useSocket";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import "./editor.css";
import QuillCursors from "quill-cursors";
import useAuth from "../hooks/useAuth";
import SaveIcon from "@mui/icons-material/Save";
import Chat from "./Chat";
import { getRandomColor } from "../utils";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Toolbar,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import api from "../services/auth.service";

const options = ["Delete"];

const ITEM_HEIGHT = 20;

Quill.register("modules/cursors", QuillCursors);

const SAVE_INTERNAL_MS = 2000;

const Editor = () => {
  const { id: docId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [editor, setEditor] = useState<Quill | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [documentName, setDocumentName] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const remoteCursors = useRef<
    Record<string, { range: any; name: string; color: string }>
  >({});
  const [toggleChat, setToggleChat] = useState(true);

  const formatTimestamp = (isoString) => {
    const date = new Date(isoString);

    const time = date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const dateStr = date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    return `${dateStr} at ${time}`;
  };

  const createCursors = (users) => {
    users.forEach((activeUser) => {
      if (activeUser.userId === socket?.id) return;

      const { range, name, color } = activeUser.cursorData;
      const cursors = editor.getModule("cursors");
      if (!cursors) return;

      cursors?.removeCursor(activeUser.userId);
      cursors?.createCursor(activeUser.userId, name, color, {
        showAlways: true,
      });
      cursors?.moveCursor(activeUser.userId, range);

      remoteCursors.current[activeUser.userId] = { range, name, color };
    });
  };

  const removeCursors = (userId) => {
    if (userId === socket?.id) return;

    const cursors = editor.getModule("cursors");
    if (!cursors) return;

    cursors.removeCursor(userId);
    if (remoteCursors.current[userId]) {
      delete remoteCursors.current[userId];
    }
  };

  const handleDocInit = ({ doc, docMetaData, users, elapsedDeltas }) => {
    doc = JSON.parse(doc);
    docMetaData = JSON.parse(docMetaData);
    setDocumentName(docMetaData.title);
    setLastUpdated(formatTimestamp(docMetaData.updated_at));
    setActiveUsers(users);
    editor?.setContents(doc);
    elapsedDeltas.forEach((data) => {
      editor?.updateContents(data.delta);
    });
    editor?.enable();
    createCursors(users);
  };

  const handleDocEdit = (delta, oldDelta, source) => {
    if (source !== "user") return;

    setHasUnsavedChanges(true);
    const range = editor?.getSelection();
    if (!range) return;
    socket?.emit("doc:cursor", {
      docId,
      cursorData: {
        name: user?.username,
        range,
        color: getRandomColor(socket?.id),
      },
    });
    socket?.emit("doc:update", { docId, content: delta });
  };

  const handleDocUpdate = (delta) => {
    editor?.updateContents(delta);

    const cursors = editor.getModule("cursors");
    if (!cursors) return;
    Object.entries(remoteCursors.current).forEach(
      ([uid, { range, name, color }]) => {
        cursors.createCursor(uid, name, color, { showAlways: true });
        cursors.moveCursor(uid, range);
      }
    );
  };

  useEffect(() => {
    if (!socket || !editor) return;

    if (!hasUnsavedChanges) {
      return;
    }

    const interval = setInterval(() => {
      const doc = JSON.stringify(editor?.getContents());
      socket?.emit("doc:full-doc-sync", { docId, fullDoc: doc });
      setHasUnsavedChanges(false);
    }, SAVE_INTERNAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [socket, editor, hasUnsavedChanges]);

  useEffect(() => {
    if (!socket || !editor) return;
    const range = editor?.getSelection();
    if (!range) return;
    socket?.emit("doc:join", {
      docId,
      username: user?.username,
      cursorData: {
        name: user?.username,
        range,
        color: getRandomColor(socket?.id),
      },
    });
    socket?.on("doc:init", handleDocInit);
    socket?.on("doc:update", handleDocUpdate);

    editor?.on("text-change", handleDocEdit);

    socket?.on("doc:cursor", ({ userId, cursorData }) => {
      const { range, name, color } = cursorData;
      const cursors = editor.getModule("cursors");
      if (!cursors) return;

      cursors?.removeCursor(userId);
      cursors?.createCursor(userId, name, color, { showAlways: true });
      cursors?.moveCursor(userId, range);

      remoteCursors.current[userId] = { range, name, color };
    });

    socket?.on("doc:full-doc-sync-done", ({ success, lastUpdated }) => {
      setLastUpdated(formatTimestamp(lastUpdated));
    });

    socket?.on("doc:user-joined", ({ userId, username, cursorData }) => {
      createCursors([{ userId, username, cursorData }]);
      setActiveUsers((prevUsers) => [...prevUsers, { userId, username }]);
    });

    socket?.on("doc:user-left", ({ userId, docId }) => {
      removeCursors(userId);
      setActiveUsers((prevUsers) =>
        prevUsers.filter((u) => u.userId !== userId)
      );
    });

    const handleSelectionChange = (range: any, _old: any, source: string) => {
      if (source !== "user" || !range) return;
      socket.emit("doc:cursor", {
        docId,
        cursorData: {
          range,
          name: user?.username,
          color: getRandomColor(socket?.id),
        },
      });
    };

    editor.on("selection-change", handleSelectionChange);

    return () => {
      socket.emit("doc:leave", docId);
      socket?.off("doc:join");
      socket?.off("doc:init");
      socket?.off("doc:update");
      socket?.off("doc:cursor");
      socket?.off("doc:full-doc-sync-done");
      socket?.off("doc:user-joined");
      socket?.off("doc:user-left");
      editor?.off("text-change");

      socket?.disconnect();
    };
  }, [socket, editor, docId]);

  const editorRef = useCallback((wrapper) => {
    if (wrapper == null) return;

    wrapper.innerHTML = "";
    const baseEditor = document.createElement("div");
    wrapper.append(baseEditor);
    const q = new Quill(baseEditor, {
      theme: "bubble",
      modules: {
        cursors: { showCursorAlways: true },
      },
    });
    q.focus();
    setEditor(q);
  }, []);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleDelete = async (option: string) => {
    if (option === "Delete") {
      handleClose();
      await api.post("/documents/delete", { docId });
      navigate("/");
    }
    setAnchorEl(null);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        variant="outlined"
        color="transparent"
        sx={{ height: "8vh", display: "flex", justifyContent: "center" }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Button onClick={() => navigate("/")}>
              <ArrowBackRoundedIcon sx={{ ml: 2 }} />
              <Typography
                variant="h6"
                component="div"
                sx={{ flexGrow: 1, color: "black", fontSize: "0.9rem", ml: 1 }}
              >
                Back to documents
              </Typography>
            </Button>
            <Box sx={{ height: "1.5rem", ml: 1, border: "0.1px solid gray" }} />

            <Box sx={{ display: "flex", flexDirection: "column", ml: 2 }}>
              <Typography sx={{ fontSize: "1.2rem" }}>
                {documentName}
              </Typography>
              <Box sx={{ display: "flex", gap: "12px" }}>
                <Typography sx={{ fontSize: "0.8rem" }}>
                  Last updated {lastUpdated}
                </Typography>
                <Box sx={{ display: "flex", gap: "2px" }}>
                  <SaveIcon color="primary" sx={{ fontSize: "1rem" }} />
                  <Typography sx={{ fontSize: "0.8rem" }}>Auto-Save</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Paper
              variant="outlined"
              size="large"
              color="inherit"
              sx={{
                color: "black",
                mr: 3,
                height: "1.9rem",
                width: "5rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "1rem",
                background: "#f3f4f6",
                borderRadius: "5rem",
              }}
            >
              <Box
                sx={{
                  background: "green",
                  borderRadius: "50%",
                  height: "0.7rem",
                  width: "0.7rem",
                }}
              ></Box>
              Live
            </Paper>
            <Button
              variant="outlined"
              size="small"
              color="inherit"
              sx={{ color: "black", mr: 1 }}
              onClick={() => setToggleChat(!toggleChat)}
            >
              Toggle Chat
            </Button>
            <div>
              <IconButton
                aria-label="more"
                id="long-button"
                aria-controls={open ? "long-menu" : undefined}
                aria-expanded={open ? "true" : undefined}
                aria-haspopup="true"
                onClick={handleClick}
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                id="long-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                slotProps={{
                  paper: {
                    style: {
                      maxHeight: ITEM_HEIGHT * 4.5,
                      width: "20ch",
                    },
                  },
                  list: {
                    "aria-labelledby": "long-button",
                  },
                }}
              >
                {options.map((option) => (
                  <MenuItem key={option} onClick={() => handleDelete(option)}>
                    {option}
                  </MenuItem>
                ))}
              </Menu>
            </div>
          </Box>
        </Toolbar>
      </AppBar>
      <Box sx={{ display: "flex" }}>
        <div
          ref={editorRef}
          style={{
            border: "1px solid black",
            borderRadius: "5px",
            margin: "1rem",
            flex: 1,
            height: "calc(100vh - 90px)",
          }}
        />
        {toggleChat && <Chat activeUsers={activeUsers} />}
      </Box>
    </Box>
  );
};

export default Editor;
