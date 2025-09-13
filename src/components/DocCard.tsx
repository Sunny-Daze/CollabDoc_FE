import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";
import { Avatar, AvatarGroup, Box } from "@mui/material";
import { getRandomColor } from "../utils";

export default function DocCard({
  title,
  owner_name,
  created_at,
  updated_at,
  content,
  handleDocClick,
}) {
  const changeDateFormat = (dateIso: string) => {
    const isoString = dateIso;
    const date = new Date(isoString);

    const formattedDate = `${
      date.getMonth() + 1
    }/${date.getDate()}/${date.getFullYear()}`;

    return formattedDate;
  };

  
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

    return `${dateStr} ${time}`;
  };

  return (
    <div onClick={handleDocClick}>
      <Card
        variant="outlined"
        sx={{ maxWidth: 370, minWidth: 370, maxHeight: 235 }}
      >
        <CardActionArea>
          <CardContent>
            <Box sx={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <EditDocumentIcon
                sx={{ fontSize: "2rem", color: "primary.main" }}
              />
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography gutterBottom variant="h6" component="div">
                  {title}
                </Typography>
                <Typography
                  sx={{ mt: -2, fontSize: "1rem", color: "text.secondary" }}
                  gutterBottom
                >
                  by {owner_name}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ minHeight: '5rem'}}>
              <Typography
                variant="body2"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                sx={{ color: "text.secondary", mt: 2 }}
              >
                {content?.ops[0].insert || "No content yet!"}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                gap: "2rem",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0,
                }}
              >
                <Typography
                  sx={{ color: "text.secondary", fontSize: "0.8rem", mt: 2 }}
                >
                  created at -
                </Typography>
                <Typography
                  sx={{ color: "text.secondary", fontSize: "0.8rem" }}
                >
                  {changeDateFormat(created_at)}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
                <Typography
                  sx={{ color: "text.secondary", fontSize: "0.8rem", mt: 2 }}
                >
                  updated at -
                </Typography>
                <Typography
                  sx={{ color: "text.secondary", fontSize: "0.8rem" }}
                >
                  {formatTimestamp(updated_at)}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0,
                  mt: 2.5,
                }}
              >
                <AvatarGroup>
                  <Avatar
                    sx={{
                      bgcolor: getRandomColor(title),
                      height: "1.5rem",
                      width: "1.5rem",
                    }}
                  />
                  <Avatar
                    sx={{
                      bgcolor: getRandomColor(owner_name),
                      height: "1.5rem",
                      width: "1.5rem",
                    }}
                  />
                  <Avatar
                    sx={{
                      bgcolor: getRandomColor(created_at),
                      height: "1.5rem",
                      width: "1.5rem",
                    }}
                  />
                </AvatarGroup>
              </Box>
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
    </div>
  );
}
