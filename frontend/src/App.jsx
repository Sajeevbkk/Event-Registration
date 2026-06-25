import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Link,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import AddUser from "./pages/AddUser";
import EditUser from "./pages/EditUser";
import RegistrationList from "./pages/RegistrationList";
import Dashboard from "./pages/Dashboard";

function Navigation() {
  const location = useLocation();
  // Don't show nav on dashboard
  if (location.pathname === "/") return null;

  return (
    <nav className="navbar navbar-expand-lg glass-nav navbar-dark">
      <div className="container-fluid">
        <Link className="navbar-brand h1 mb-0 text-white fw-bold" to="/">
          Event Registration
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              {location.pathname === "/registrations" && (
                <Link className="btn btn-outline-light ms-2" to="/create">
                  Create Registration
                </Link>
              )}

              {(location.pathname === "/create" ||
                location.pathname.startsWith("/edituser/")) && (
                <Link
                  className="btn btn-outline-light ms-2"
                  to="/registrations"
                >
                  View Registrations
                </Link>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

function App() {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    document.title = "Event Management";
    loadUsers();
    loadEvents();
  }, []);

  function loadUsers() {
    fetch("http://localhost:3000/registrations")
      .then((response) => response.json())
      .then((data) => {
        setUsers(data);
      })
      .catch((error) => console.error("Error loading users:", error));
  }

  function loadEvents() {
    fetch("http://localhost:3000/events")
      .then((response) => response.json())
      .then((data) => {
        setEvents(data);
      })
      .catch((error) => console.error("Error loading events:", error));
  }

  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<Dashboard users={users} events={events} />} />
        <Route
          path="/registrations"
          element={
            <RegistrationList
              users={users}
              events={events}
              loadUsers={loadUsers}
              loadEvents={loadEvents}
            />
          }
        />
        <Route path="/create" element={<AddUser />} />
        <Route path="/edituser/:id" element={<EditUser />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
