import { useNavigate } from "react-router";
import useAuth from "../hooks/useAuth";
import useSocket from "../hooks/useSocket";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import AddIcon from "@mui/icons-material/Add";
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  Modal,
  Paper,
  Tab,
  Tabs,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import DocCard from "../components/DocCard";
import api from "../services/auth.service";
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: "5px",
  boxShadow: 24,
  p: 4,
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { connectSocket } = useSocket();
  const { user, logout } = useAuth();
  const [value, setValue] = useState(0);
  const [publicDocuments, setPublicDocuments] = useState<any[]>([]);
  const [privateDocuments, setPrivateDocuments] = useState<any[]>([]);
  const [documentName, setDocumentName] = useState("");
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleLoadDocument = (docId: string) => {
    connectSocket();
    navigate(`/document/${docId}`);
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleCreateDocument = async () => {
    const res = await api.post("/documents", {
      title: documentName,
      userId: user?.id,
    });
    fetchDocuments();
    handleClose();
  };

  const filteredDocuments = useMemo(() => {
    return publicDocuments.filter((doc) =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [publicDocuments, searchTerm]);

  const fetchDocuments = async () => {
    try {
      let res;
      if (value === 0) {
        setLoading(true);
        res = await api.get("/documents/public");
        setPublicDocuments(res.data?.documents);
        setLoading(false);
      } else if (value === 1) {
        setLoading(true);
        res = await api.post("/documents/private", {
          userId: user?.id,
        });
        setPrivateDocuments(res.data?.documents);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.error("Failed to fetch documents:", error);
    }
  };
  useEffect(() => {
    fetchDocuments();
  }, [value]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        sx={{ height: "8vh", display: "flex", justifyContent: "center" }}
      >
        <Toolbar>
          <EditDocumentIcon sx={{ fontSize: "2.5rem", mr: 2, ml: 20 }} />
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, color: "white", fontSize: "1.5rem" }}
          >
            CollabDoc
          </Typography>
          <Paper
            variant="outlined"
            size="large"
            color="inherit"
            sx={{
              color: "black",
              mr: 3,
              height: "2.6rem",
              minWidth: "9rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "1rem",
              background: "#f3f4f6",
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
            {user?.username}
          </Paper>
          <Button
            variant="outlined"
            size="large"
            color="inherit"
            sx={{ color: "white", mr: 20 }}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ position: "relative", mr: 23, ml: 23 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "80vw",
          }}
        >
          <Typography variant="h1" sx={{ fontSize: "2rem", mt: 5 }}>
            Your documents
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{ mt: 5 }}
            onClick={handleOpen}
          >
            <AddIcon sx={{ fontSize: "2rem" }} />
            Create new document
          </Button>
        </Box>

        <TextField
          label="Search documents"
          variant="outlined"
          type="text"
          size="medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            mt: 2,
            fontSize: "4rem",
            width: "80vw",
            height: "30vh",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: "11rem",
            display: "flex",
            gap: "2rem",
            flexWrap: "wrap",
            justifyContent: "center",
            width: "80vw",
          }}
        >
          {loading ? (
            <Box
              sx={{
                display: "flex",
                width: "80vw",
                mt: 15,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            filteredDocuments.map((doc) => (
              <DocCard
                key={doc.id}
                {...doc}
                handleDocClick={() => handleLoadDocument(doc.id)}
              />
            ))
          )}
        </Box>
      </Box>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Create new document
          </Typography>
          <TextField
            id="outlined-basic"
            label="Document name"
            variant="outlined"
            size="small"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            fullWidth
            type="text"
            sx={{ mt: 2 }}
          />

          <Box sx={{ display: "flex", gap: "5px", mt: 2 }}>
            <Button fullWidth onClick={handleClose} variant="outlined">
              Cancel
            </Button>
            <Button
              disabled={documentName.trim() === ""}
              fullWidth
              onClick={handleCreateDocument}
              variant="contained"
            >
              Create
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Dashboard;
