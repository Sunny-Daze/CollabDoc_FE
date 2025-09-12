import { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { useNavigate } from "react-router";
import useAuth from "../hooks/useAuth";
import AccountBoxOutlinedIcon from "@mui/icons-material/AccountBoxOutlined";
import { Button, Typography } from "@mui/material";
import TextField from "@mui/material/TextField";

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [username, setUsername] = useState("");
  const [disabled, setDisabled] = useState(true);

  const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      e.preventDefault();
      const res = await login(username);

      if (res?.data?.success && res.data.user) {
        navigate("/");
      }
    } catch (err) {
      alert("Login failed");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setDisabled(e.target.value.trim() === "");
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexWrap: "wrap",
          padding: "2rem",
          borderRadius: "10px",
          "& > :not(style)": {
            m: 1,
            width: "50vh",
            height: "50vh",
          },
        }}
      >
        <Paper
          elevation={8}
          square={false}
          sx={{
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1px",
            position: "relative",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
              top: "2rem",
            }}
          >
            <AccountBoxOutlinedIcon
              sx={{ fontSize: "7rem", color: "primary.main" }}
            />
            <Typography variant="h5" sx={{ fontSize: "2rem", mb: 4, mt: 0 }}>
              Login
            </Typography>
          </Box>
          <Box
            sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 20 }}
          >
            <TextField
              id="outlined-basic"
              label="Username"
              variant="outlined"
              type="text"
              value={username}
              onChange={(e) => handleInputChange(e)}
              sx={{ width: "40vh" }}
            />
            <Button
              onClick={handleLogin}
              disabled={disabled}
              variant="contained"
              size="large"
            >
              Login
            </Button>
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default Login;
