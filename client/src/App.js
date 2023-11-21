import { useState } from "react";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useNavigate,
} from "react-router-dom";
import { LoginContext } from "./contexts";
import "./App.css";
import Chat from "./components/Chat";
import Sidebar from "./components/Sidebar";
import Login from "./components/Login";

function App() {
  const [user, setUser] = useState({
    isLoggedIn: false,
    name: "",
    picture: "",
    type: "",
  });
  /*
  useEffect(() => {
    const getRooms = async () => {
      try {
        const response = await axios.get("/rooms/getRooms");
        setRooms(response.data);
        console.log(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    getRooms();
  }, []);*/

  console.log(window.location.href);

  return (
    <div className="app">
      <LoginContext.Provider value={[user, setUser]}>
        {!user.isLoggedIn ? (
          <Login />
        ) : (
          <div className="appBody">
            <Router>
              <Sidebar />
              <Routes>
                <Route path="/rooms/:roomId" element={<Chat />} />
                <Route path="/" element={<Chat />} />
              </Routes>
            </Router>
          </div>
        )}
      </LoginContext.Provider>
    </div>
  );
}

export default App;
