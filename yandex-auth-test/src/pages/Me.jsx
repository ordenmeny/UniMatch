import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Me() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/auth/users/me/httponly/",
          {
            credentials: "include", // <-- обязательно для HttpOnly cookies!
          },
        );

        if (response.status === 401) {
          navigate("/");
          return;
        }

        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Ошибка загрузки пользователя:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  if (loading) return <p>Загрузка...</p>;
  if (!user) return <p>Пользователь не найден</p>;

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Привет, {user.first_name || user.login}!</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
