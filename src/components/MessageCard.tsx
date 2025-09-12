import { Box, Paper, Typography } from "@mui/material";

const MessageCard = ({ isOwner, senderName, message, time }) => {
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

  return (
    <Box
      sx={{
        mb: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: isOwner ? "flex-end" : "flex-start",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
        <Typography sx={{ fontSize: "0.9rem", color: "black" }}>
          {senderName}
        </Typography>
        <Typography sx={{ fontSize: "0.7rem", color: "gray" }}>
          {formatTimestamp(time)}
        </Typography>
      </Box>
      <Paper
        sx={{ background: "#F3F4F6", padding: "0.5rem", maxWidth: "70%" }}
        square={false}
        variant="outlined"
      >
        <Typography sx={{ fontSize: "14px", wordBreak: "break-word" }}>
          {message}
        </Typography>
      </Paper>
    </Box>
  );
};

export default MessageCard;
