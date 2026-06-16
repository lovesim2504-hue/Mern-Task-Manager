import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Verify() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Verifying...");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token || done) return;

    const verifyUser = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/auth/verify/${token}`
        );

        setMessage(res.data.message);
        setDone(true);

        // ✅ redirect after 2 seconds
        setTimeout(() => {
          navigate("/profile");
        }, 2000);

      } catch (err) {
        if (err.response?.status === 400) {
          setMessage("Account already verified ✅");

          // ✅ still redirect
          setTimeout(() => {
            navigate("/profile");
          }, 2000);

        } else {
          setMessage("Verification failed ❌");
        }
      }
    };

    verifyUser();
  }, [token, done, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>{message}</h1>
      <p>Redirecting to SignIn...</p>
    </div>
  );
}