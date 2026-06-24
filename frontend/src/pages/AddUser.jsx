import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

function AddUser() {
  const [userName, setuserName] = useState("");
  const [contact, setcontact] = useState("");
  const [events, setEvents] = useState([]);
  const [availableEvents, setAvailableEvents] = useState([]);
  const [date, setdate] = useState("");
  const [paymentStatus, setpaymentStatus] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  // Ref to programmatically open the error modal
  const errorModalRef = useRef(null);

  useEffect(() => {
    fetch("http://localhost:3000/events")
      .then((res) => res.json())
      .then((data) => setAvailableEvents(data))
      .catch((err) => console.error(err));
  }, []);

  function handleAddEvent() {
    if (availableEvents.length > 0) {
      setEvents([...events, { eventName: availableEvents[0].name, ticketCount: 1 }]);
    }
  }

  function handleEventChange(index, field, value) {
    const updatedEvents = [...events];
    if (field === "ticketCount") {
      updatedEvents[index][field] = Number(value);
    } else {
      updatedEvents[index][field] = value;
    }
    setEvents(updatedEvents);
  }

  function handleRemoveEvent(index) {
    const updatedEvents = events.filter((_, i) => i !== index);
    setEvents(updatedEvents);
  }

  function saveUser(event) {
    event.preventDefault();
    setErrorMessage("");

    fetch("http://localhost:3000/registrations", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        userName: userName,
        contact: contact,
        events: events,
        paymentStatus: paymentStatus,
        date: date,
      }),
    })
      .then((response) => response.json().then(data => ({ status: response.status, body: data })))
      .then(({ status, body }) => {
        if (status === 400 || status === 500) {
          setErrorMessage(body.error || "An error occurred");
          if (errorModalRef.current) {
            // Use Bootstrap modal via dataset API if needed, but simple click to trigger works if wrapped correctly
            // We'll rely on the data-bs-target approach via a hidden button, but since this is React,
            // we manually trigger the click on the hidden button.
            errorModalRef.current.click();
          }
        } else {
          window.location.href = "/";
        }
      });
  }

  return (
    <div>
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          <Link className="navbar-brand h1 mb-0" to="/">
            Event Registration
          </Link>

          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="btn btn-outline-primary me-2" to="/">
                  View All Registrations
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div className="container-fluid min-vh-100 bg-dark">
        <div className="container-sm min-vh-100 bg-dark text-white p-4">
          <h2 className="mb-4">Add User</h2>

          <form onSubmit={saveUser}>
            <div class="mb-3">
              <label class="form-label">Name of user</label>
              <input
                type="text"
                placeholder="User Name"
                className="form-control bg-secondary"
                value={userName}
                onChange={(event) => setuserName(event.target.value)}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="contactInput" className="form-label">
                Email / Phone
              </label>
              <input
                id="contactInput"
                type="text"
                placeholder="Enter your email or phone number"
                className="form-control bg-secondary text-white"
                aria-describedby="contactHelp"
                value={contact}
                onChange={(event) => setcontact(event.target.value)}
              />
              <div id="contactHelp" className="form-text text-white-50">
                We'll never share your email/phone with anyone else.
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Events</label>
              {events.map((ev, index) => (
                <div key={index} className="d-flex mb-2 align-items-center gap-2">
                  <select
                    className="form-select bg-secondary text-white w-50"
                    value={ev.eventName}
                    onChange={(e) => handleEventChange(index, "eventName", e.target.value)}
                  >
                    {availableEvents.map((aEvent) => (
                      <option key={aEvent._id} value={aEvent.name}>
                        {aEvent.name} ({aEvent.availableTickets} available)
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    className="form-control bg-secondary text-white w-25"
                    min="1"
                    value={ev.ticketCount}
                    onChange={(e) => handleEventChange(index, "ticketCount", e.target.value)}
                    placeholder="Tickets"
                  />
                  <button type="button" className="btn btn-danger" onClick={() => handleRemoveEvent(index)}>
                    Remove
                  </button>
                </div>
              ))}
              <div>
                <button type="button" className="btn btn-outline-info mt-2" onClick={handleAddEvent}>
                  + Add Event
                </button>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Event Date</label>
              <input
                type="date"
                className="form-control bg-secondary text-white"
                value={date}
                onChange={(event) => setdate(event.target.value)}
              />
            </div>

            <div className="btn-group" role="group" aria-label="Payment Status">
              <input
                type="radio"
                class="btn-check"
                name="paymentStatus"
                id="statusUnpaid"
                value="false"
                checked={paymentStatus === false}
                onChange={() => setpaymentStatus(false)}
              />
              <label class="btn btn-outline-danger" for="statusUnpaid">
                Unpaid
              </label>

              <input
                type="radio"
                class="btn-check"
                name="paymentStatus"
                id="statusPaid"
                value="true"
                checked={paymentStatus === true}
                onChange={() => setpaymentStatus(true)}
              />
              <label class="btn btn-outline-success" for="statusPaid">
                Paid
              </label>
            </div>

            <button type="submit" className="btn btn-primary ms-5">
              Save
            </button>
          </form>

          {/* Hidden button to trigger modal */}
          <button
            type="button"
            ref={errorModalRef}
            className="d-none"
            data-bs-toggle="modal"
            data-bs-target="#errorModal"
          >
          </button>

          {/* Error Modal */}
          <div className="modal fade" id="errorModal" tabIndex="-1" aria-labelledby="errorModalLabel" aria-hidden="true">
            <div className="modal-dialog">
              <div className="modal-content text-dark">
                <div className="modal-header">
                  <h1 className="modal-title fs-5 text-danger" id="errorModalLabel">Error</h1>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  {errorMessage}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddUser;
