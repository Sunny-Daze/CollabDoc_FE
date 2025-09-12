import styled from "@emotion/styled";
import { Avatar, Badge, Box, Typography } from "@mui/material";
import { getRandomColor } from "../utils";

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

const UserBadge = ({ username }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "0.5rem",
      }}
    >
      <Box sx={{ display: "flex", gap: "5px" }}>
        <Box>
          <StyledBadge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            variant="dot"
          >
            <Avatar
              sx={{
                bgcolor: getRandomColor(),
                height: "2rem",
                width: "2rem",
              }}
            >
              {username[0] || ""}
            </Avatar>
          </StyledBadge>
        </Box>
        <Typography sx={{ fontSize: "1.2rem" }}>{username}</Typography>
      </Box>
    </Box>
  );
};

export default UserBadge;
