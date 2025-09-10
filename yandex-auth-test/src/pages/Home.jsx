import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/auth/get_yandex_auth_url/",
      );
      const data = await response.json();
      // Перенаправляем пользователя на страницу авторизации Яндекс
      window.location.assign(data.auth_url);
    } catch (error) {
      console.error("Ошибка при получении ссылки:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Авторизация через Яндекс</h1>
      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Загрузка..." : "Войти через Яндекс"}
      </button>
    </div>
  );
}
