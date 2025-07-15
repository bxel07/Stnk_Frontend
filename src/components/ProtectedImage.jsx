import { useEffect, useState } from "react";
import axios from "axios";

const ProtectedImage = ({ path, alt, className, onClick }) => {
  const [imageSrc, setImageSrc] = useState("/loading.png");

  // Ambil base URL dari environment variable VITE
  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
     const token = localStorage.getItem("access_token");

    axios
      .get(`${baseUrl}/api${path}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      })
      .then((res) => {
        const blobUrl = URL.createObjectURL(res.data);
        setImageSrc(blobUrl);
      })
      .catch((err) => {
        console.error("Gagal ambil gambar:", err);
        setImageSrc("/no-image.png");
      });
  }, [path, baseUrl]);

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onClick={onClick}
    />
  );
};

export default ProtectedImage;
