import { Fragment, useEffect, useRef, useState } from "react";
import { BrowserRouter, Link, Routes, Route } from "react-router-dom";

import AddUser from "./pages/AddUser";
import EditUser from "./pages/EditUser";

function App() {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [expandedUserKeys, setExpandedUserKeys] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const closeModalRef = useRef(null);

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
        setSelectedUserId(null);
        loadUsers();
        loadEvents();
      } else {
        alert("Failed to delete the registration.");
      }
    });
  }

  function toggleUserEvents(userKey) {
    setExpandedUserKeys((currentUserKeys) => ({
      ...currentUserKeys,
      [userKey]: !currentUserKeys[userKey],
    }));
  }

  function formatDate(value) {
    if (!value) return "N/A";

    const [year, month, day] = value.split("-");

    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }

    return value;
  }

  function getAvailableTickets(eventName) {
    const event = events.find((eventItem) => eventItem.name === eventName);

    return event ? event.ticketsAvailable : "N/A";
  }

  function getPaymentBadge(group) {
    if (group.paidCount === group.registrations.length) {
      return <span className="badge bg-success">Paid</span>;
    }

    if (group.paidCount === 0) {
      return <span className="badge bg-danger text-dark">Unpaid</span>;
    }

    return (
      <span className="badge bg-warning text-dark">
        {group.paidCount}/{group.registrations.length} paid
      </span>
    );
  }

  const filteredUsers = users.filter((user) =>
    user.userName
      ? user.userName.toLowerCase().includes(searchQuery.toLowerCase())
      : false,
  );

  const userGroups = Object.values(
    filteredUsers.reduce((groups, user) => {
      const userName = user.userName || "Unnamed User";
      const contact = user.contact || "No Contact";
      const groupKey = `${userName}|${contact}`;

      if (!groups[groupKey]) {
        groups[groupKey] = {
          key: groupKey,
          userName,
          contact,
          registrations: [],
        };
      }

      groups[groupKey].registrations.push(user);
      return groups;
    }, {}),
  ).map((group) => ({
    ...group,
    totalTickets: group.registrations.reduce(
      (sum, registration) => sum + (Number(registration.ticketCount) || 0),
      0,
    ),
    paidCount: group.registrations.filter(
      (registration) => registration.paymentStatus === true,
    ).length,
  }));

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
                      onSubmit={(event) => event.preventDefault()}
                    >
                      <input
                        className="form-control me-2"
                        type="search"
                        placeholder="Search"
                        aria-label="Search"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
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
                        Deleting Registration
                      </h1>
                      <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                      ></button>
                    </div>
                    <div className="modal-body">
                      Are you sure you want to delete this registration?
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
                    {userGroups.length === 0 ? (
                      <p>No registrations found.</p>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-dark table-hover align-middle">
                          <thead>
                            <tr className="table-primary">
                              <th>User Details</th>
                              <th>Total Tickets</th>
                              <th>Contact</th>
                              <th>Events</th>
                              <th>Paid Status</th>
                              <th className="text-end pe-4">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userGroups.map((group) => {
                              const isExpanded = expandedUserKeys[group.key];

                              return (
                                <Fragment key={group.key}>
                                  <tr>
                                    <td>
                                      <span className="fw-bold">
                                        {group.userName}
                                      </span>
                                    </td>
                                    <td>{group.totalTickets}</td>
                                    <td>{group.contact}</td>
                                    <td>
                                      {group.registrations.length}{" "}
                                      {group.registrations.length === 1
                                        ? "event"
                                        : "events"}
                                    </td>
                                    <td>{getPaymentBadge(group)}</td>
                                    <td>
                                      <div className="d-flex justify-content-end pe-2">
                                        <button
                                          className="btn btn-outline-light btn-sm dropdown-toggle"
                                          type="button"
                                          aria-expanded={isExpanded}
                                          onClick={() =>
                                            toggleUserEvents(group.key)
                                          }
                                        >
                                          Show Events
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                  {isExpanded && (
                                    <tr>
                                      <td colSpan="6" className="bg-black">
                                        <div className="table-responsive py-2">
                                          <table className="table table-dark table-sm align-middle mb-0">
                                            <thead>
                                              <tr>
                                                <th>Event</th>
                                                <th>Event Date</th>
                                                <th>Tickets</th>
                                                <th>Available Tickets</th>
                                                <th>Paid Status</th>
                                                <th className="text-end pe-4">
                                                  Actions
                                                </th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {group.registrations.map(
                                                (registration) => (
                                                  <tr key={registration._id}>
                                                    <td>
                                                      {registration.event ||
                                                        "No Event"}
                                                    </td>
                                                    <td>
                                                      {formatDate(
                                                        registration.date,
                                                      )}
                                                    </td>
                                                    <td>
                                                      {
                                                        registration.ticketCount
                                                      }
                                                    </td>
                                                    <td>
                                                      {getAvailableTickets(
                                                        registration.event,
                                                      )}
                                                    </td>
                                                    <td>
                                                      {registration.paymentStatus ===
                                                      true ? (
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
                                                          to={`/edituser/${registration._id}`}
                                                        >
                                                          Edit
                                                        </Link>
                                                        <button
                                                          className="btn btn-danger btn-sm ms-2"
                                                          data-bs-toggle="modal"
                                                          data-bs-target="#deleteUser"
                                                          onClick={() =>
                                                            openDeleteModal(
                                                              registration._id,
                                                            )
                                                          }
                                                        >
                                                          Delete
                                                        </button>
                                                      </div>
                                                    </td>
                                                  </tr>
                                                ),
                                              )}
                                            </tbody>
                                          </table>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </Fragment>
                              );
                            })}
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
