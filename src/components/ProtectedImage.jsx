import { useEffect, useState } from "react";
import axios from "axios";

const ProtectedImage = ({ path, alt, className, onClick }) => {
  const [imageSrc, setImageSrc] = useState("/loading.png");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    axios
      .get(`http://localhost:8000/api${path}`, 
      {
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
  }, [path]);

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
