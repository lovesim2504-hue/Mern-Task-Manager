import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext"; // 👈 IMPORTANT

const Success = () => {
  const navigate = useNavigate();
  const { updateUser } = useUser();

  useEffect(() => {
    const upgradeUser = async () => {
      try {
        const email = localStorage.getItem("userEmail");

       const res = await fetch("http://localhost:8000/api/v1/users/make-premium", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ email }),
});

// ✅ FIX: handle non-JSON response
let data;
try {
  data = await res.json();
} catch {
  console.error("❌ Not JSON response (probably 404)");
  return;
}

        console.log("Upgrade:", data);

        // ✅ AUTO LOGIN
        updateUser(data.user);

        // ✅ clear saved email
        localStorage.removeItem("userEmail");

        setTimeout(() => {
          navigate("/profile"); // 🔥 NOW THIS WORKS
        }, 2000);

      } catch (error) {
        console.error(error);
      }
    };

    upgradeUser();
  }, [navigate, updateUser]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Payment Successful 🎉</h1>
      <p>Logging you in...</p>
    </div>
  );
};

export default Success;