import { Dialog, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useRef, useState } from "react";

const ZoomDialog = ({ open, onClose, image }) => {
  const imgRef = useRef(null);
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const img = imgRef.current;
      if (img && img.naturalHeight > img.naturalWidth) {
        setIsPortrait(true); // portrait, rotate to left (counter-clockwise)
      } else {
        setIsPortrait(false); // landscape, no rotation
      }
    };

    if (open) {
      const timeout = setTimeout(checkOrientation, 100); // wait for image load
      return () => clearTimeout(timeout);
    }
  }, [open, image]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      PaperProps={{
        style: {
          backgroundColor: "black",
          margin: 0,
        },
      }}
    >
      {/* Tombol Close */}
      <IconButton
        onClick={onClose}
        sx={{
          position: "fixed",
          top: 16,
          right: 16,
          zIndex: 9999,
          backgroundColor: "rgba(0,0,0,0.5)",
          color: "white",
          "&:hover": {
            backgroundColor: "rgba(0,0,0,0.7)",
          },
        }}
        size="large"
      >
        <CloseIcon />
      </IconButton>

      {/* Gambar dengan rotasi jika portrait */}
      <img
  ref={imgRef}
  src={image.src}
  alt={image.title}
  onClick={onClose}
  style={{
    width: isPortrait ? "100vh" : "100vw",
    height: isPortrait ? "100vw" : "100vh",
    transform: isPortrait ? "rotate(-90deg)" : "none",
    transformOrigin: "center center",
    display: "block",
    margin: "auto",
    objectFit: "cover", // ganti dari 'contain' jadi 'cover'
    backgroundColor: "black",
    cursor: "zoom-out",
  }}
/>
    </Dialog>
  );
};

export default ZoomDialog;
