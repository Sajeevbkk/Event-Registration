import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Link, Routes, Route } from "react-router-dom";

import AddUser from "./pages/AddUser";
import EditUser from "./pages/EditUser";

function App() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const closeModalRef = useRef(null);

  useEffect(() => {
    document.title = "Event Management";
    loadUsers();
  }, []);

  function loadUsers() {
    fetch("http://localhost:3000/registrations")
      .then((response) => response.json())
      .then((data) => {
        setUsers(data);
      })
      .catch((error) => console.error("Error loading users:", error));
  }

  function openDeleteModal(id) {
    setSelectedUserId(id);
  }

  function deleteUser() {
    if (!selectedUserId) return;

    fetch(`http://localhost:3000/registrations/${selectedUserId}`, {
      method: "DELETE",
    }).then((response) => {
      if (response.ok) {
        if (closeModalRef.current) {
          closeModalRef.current.click();
        }
        loadUsers();
      } else {
        alert("Failed to delete the registration.");
      }
    });
  }

  const filteredUsers = users.filter((user) =>
    user.userName
      ? user.userName.toLowerCase().includes(searchQuery.toLowerCase())
      : false,
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              <nav className="navbar navbar-expand-lg bg-body-tertiary">
                <div className="container-fluid">
                  <Link className="navbar-brand h1 mb-0" to="/">
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
                  <div
                    className="collapse navbar-collapse"
                    id="navbarSupportedContent"
                  >
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                      <li className="nav-item">
                        <Link
                          className="btn btn-outline-primary me-2"
                          to="/create"
                        >
                          Create Registration
                        </Link>
                      </li>
                    </ul>

                    <form
                      className="d-flex"
                      role="search"
                      onSubmit={(e) => e.preventDefault()}
                    >
                      <input
                        className="form-control me-2"
                        type="search"
                        placeholder="Search"
                        aria-label="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </form>
                  </div>
                </div>
              </nav>

              <div
                className="modal fade"
                id="deleteUser"
                tabIndex="-1"
                aria-labelledby="deleteModalLabel"
                aria-hidden="true"
              >
                <div className="modal-dialog">
                  <div className="modal-content text-dark">
                    <div className="modal-header">
                      <h1 className="modal-title fs-5" id="deleteModalLabel">
                        Deleting User
                      </h1>
                      <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                      ></button>
                    </div>
                    <div className="modal-body">
                      Are you sure you want to delete this user?
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        data-bs-dismiss="modal"
                        ref={closeModalRef}
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={deleteUser}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="container-fluid min-vh-100 bg-dark text-white p-4">
                <div className="container-sm">
                  <h1 className="mb-4">Registrations</h1>
                  <div className="d-flex flex-column gap-3">
                    {filteredUsers.length === 0 ? (
                      <p>No registrations found.</p>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-dark table-hover align-middle">
                          <thead>
                            <tr className="table-primary">
                              <th>User Details</th>
                              <th>Tickets</th>
                              <th>Contact</th>
                              <th>Event</th>
                              <th>Event Date</th>
                              <th>Paid Status</th>
                              <th className="text-end pe-4">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredUsers.map((user) => (
                              <tr key={user._id}>
                                <td>
                                  <span className="fw-bold">
                                    {user.userName}
                                  </span>
                                </td>
                                <td>{user.ticketCount}</td>
                                <td>{user.contact}</td>
                                <td>{user.event ? user.event : "No Event"}</td>
                                <td>
                                  {user.date
                                    ? (() => {
                                        const [y, m, d] = user.date.split("-");
                                        return `${d}/${m}/${y}`;
                                      })()
                                    : "N/A"}
                                </td>
                                <td>
                                  {user.paymentStatus === true ? (
                                    <span className="badge bg-success">
                                      Paid
                                    </span>
                                  ) : (
                                    <span className="badge bg-danger text-dark">
                                      Unpaid
                                    </span>
                                  )}
                                </td>
                                <td>
                                  <div className="d-flex justify-content-end pe-2">
                                    <Link
                                      className="btn btn-secondary btn-sm"
                                      to={`/edituser/${user._id}`}
                                    >
                                      Edit
                                    </Link>
                                    <button
                                      className="btn btn-danger btn-sm ms-2"
                                      data-bs-toggle="modal"
                                      data-bs-target="#deleteUser"
                                      onClick={() => openDeleteModal(user._id)}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          }
        />

        <Route path="/create" element={<AddUser />} />
        <Route path="/edituser/:id" element={<EditUser />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
