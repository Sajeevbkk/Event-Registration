import { Fragment, useRef, useState } from "react";
import { Link } from "react-router-dom";

function RegistrationList({ users, events, loadUsers, loadEvents }) {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [expandedUserKeys, setExpandedUserKeys] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const closeModalRef = useRef(null);

  const [addingEventToUser, setAddingEventToUser] = useState(null);
  const [newEventRow, setNewEventRow] = useState({
    event: "",
    ticketCount: 1,
    date: "",
    paymentStatus: false,
  });

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
          paidCount: 0,
        };
      }

      groups[groupKey].registrations.push(user);
      if (user.paymentStatus) {
        groups[groupKey].paidCount++;
      }

      return groups;
    }, {}),
  );

  function startAddingEvent(group) {
    setAddingEventToUser(group.key);
    setNewEventRow({
      event: "",
      ticketCount: 1,
      date: "",
      paymentStatus: false,
    });
  }

  function cancelAddingEvent() {
    setAddingEventToUser(null);
  }

  function handleAddEventSubmit(e, group) {
    e.preventDefault();

    if (!newEventRow.event) {
      alert("Please select an event.");
      return;
    }

    const payload = {
      userName: group.userName,
      contact: group.contact,
      event: newEventRow.event,
      ticketCount: newEventRow.ticketCount,
      date: newEventRow.date,
      paymentStatus: newEventRow.paymentStatus,
    };

    fetch("http://localhost:3000/registrations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        const data = await response.json();
        if (response.ok) {
          setAddingEventToUser(null);
          loadUsers();
          loadEvents();
        } else {
          alert(`Error: ${data.message || "Failed to add event"}`);
        }
      })
      .catch((error) => {
        console.error("Error adding event:", error);
        alert("An error occurred while adding the event.");
      });
  }

  return (
    <div>
      {/* Delete User Modal */}
      <div
        className="modal fade"
        id="deleteUser"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="deleteUserLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content liquid-glass text-white border-0">
            <div className="modal-header border-bottom-0">
              <h1 className="modal-title fs-5" id="deleteUserLabel">
                Delete Registration
              </h1>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete this registration?
            </div>
            <div className="modal-footer border-top-0">
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

      <div className="container-fluid min-vh-100 p-4">
        <div className="container-sm liquid-glass p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="mb-0 text-white">Registrations</h1>
            <div className="d-flex">
              <input
                className="form-control me-2 bg-transparent border-light text-white placeholder-white"
                type="search"
                placeholder="Search Users"
                aria-label="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="d-flex flex-column gap-3">
            {userGroups.length === 0 ? (
              <p className="text-white">No registrations found.</p>
            ) : (
              <div className="table-responsive">
                <table className="table liquid-glass-table align-middle">
                  <thead>
                    <tr>
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
                      const totalTickets = group.registrations.reduce(
                        (sum, reg) => sum + (Number(reg.ticketCount) || 0),
                        0
                      );

                      return (
                        <Fragment key={group.key}>
                          <tr>
                            <td>
                              <span className="fw-bold">{group.userName}</span>
                            </td>
                            <td>{totalTickets}</td>
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
                                  onClick={() => toggleUserEvents(group.key)}
                                >
                                  Show Events
                                </button>
                              </div>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr>
                              <td colSpan="6" className="p-0 border-0">
                                <div className="p-3" style={{ background: 'rgba(0,0,0,0.2)' }}>
                                  <div className="table-responsive">
                                    <table className="table liquid-glass-table table-sm align-middle mb-3">
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
                                                {registration.event || "No Event"}
                                              </td>
                                              <td>
                                                {formatDate(registration.date)}
                                              </td>
                                              <td>{registration.ticketCount}</td>
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
                                                  <span className="badge bg-danger">
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

                                  {addingEventToUser !== group.key ? (
                                    <div className="text-center mt-2">
                                      <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => startAddingEvent(group)}
                                      >
                                        Add New Event
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="card liquid-glass mt-3 p-3 text-white border-0">
                                      <h6 className="mb-3">Add Event for {group.userName}</h6>
                                      <form onSubmit={(e) => handleAddEventSubmit(e, group)}>
                                        <div className="row g-3 align-items-end">
                                          <div className="col-md-3">
                                            <label className="form-label">Event</label>
                                            <select
                                              className="form-select bg-transparent border-light text-white"
                                              value={newEventRow.event}
                                              onChange={(e) => setNewEventRow({...newEventRow, event: e.target.value})}
                                              required
                                            >
                                              <option value="" disabled>Select Event</option>
                                              {events.map((event) => (
                                                <option
                                                  key={event._id}
                                                  value={event.name}
                                                  disabled={event.ticketsAvailable <= 0}
                                                >
                                                  {event.name} ({event.ticketsAvailable} tickets left)
                                                </option>
                                              ))}
                                            </select>
                                          </div>
                                          <div className="col-md-2">
                                            <label className="form-label">Tickets</label>
                                            <input
                                              type="number"
                                              className="form-control bg-transparent border-light text-white"
                                              min="1"
                                              value={newEventRow.ticketCount}
                                              onChange={(e) => setNewEventRow({...newEventRow, ticketCount: parseInt(e.target.value) || 1})}
                                              required
                                            />
                                          </div>
                                          <div className="col-md-3">
                                            <label className="form-label">Date</label>
                                            <input
                                              type="date"
                                              className="form-control bg-transparent border-light text-white"
                                              value={newEventRow.date}
                                              onChange={(e) => setNewEventRow({...newEventRow, date: e.target.value})}
                                            />
                                          </div>
                                          <div className="col-md-2">
                                            <div className="form-check">
                                              <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id={`paymentStatus-${group.key}`}
                                                checked={newEventRow.paymentStatus}
                                                onChange={(e) => setNewEventRow({...newEventRow, paymentStatus: e.target.checked})}
                                              />
                                              <label className="form-check-label" htmlFor={`paymentStatus-${group.key}`}>
                                                Paid
                                              </label>
                                            </div>
                                          </div>
                                          <div className="col-md-2 d-flex gap-2">
                                            <button type="submit" className="btn btn-success btn-sm w-100">Save</button>
                                            <button type="button" className="btn btn-secondary btn-sm w-100" onClick={cancelAddingEvent}>Cancel</button>
                                          </div>
                                        </div>
                                      </form>
                                    </div>
                                  )}
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
  );
}

export default RegistrationList;
