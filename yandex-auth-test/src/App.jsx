import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Me from "./pages/Me";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/me" element={<Me />} />
      </Routes>
    </Router>
  );
}

// function App() {
//   const handleLogin = async () => {
//     try {
//       const response = await fetch(
//         "http://127.0.0.1:8000/api/auth/get_yandex_auth_url/",
//         { method: "GET" },
//       );
//       const data = await response.json();
//       window.location.assign(data.auth_url);
//     } catch (error) {
//       console.error("Ошибка при получении ссылки:", error);
//     }
//   };

//   return (
//     <div>
//       <h1>Авторизация через Яндекс</h1>
//       <button onClick={handleLogin}>Войти через Яндекс</button>
//     </div>
//   );
// }

// export default App;
