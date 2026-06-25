import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function EditUser() {
  const [userName, setUserName] = useState("");
  const [ticketCount, setTicketCount] = useState(1);
  const [contact, setContact] = useState("");
  const [events, setEvents] = useState([]);
  const [eventvar, setEvent] = useState("");
  const [originalEventName, setOriginalEventName] = useState("");
  const [originalTicketCount, setOriginalTicketCount] = useState(0);
  const [date, setDate] = useState("");
  const [paymentStatus, setPaymentStatus] = useState(false);

  const { id } = useParams();

  useEffect(() => {
    Promise.all([
      fetch(`http://localhost:3000/registrations/${id}`).then((response) =>
        response.json(),
      ),
      fetch("http://localhost:3000/events").then((response) =>
        response.json(),
      ),
    ])
      .then(([userData, eventData]) => {
        setUserName(userData.userName || "");
        setTicketCount(userData.ticketCount || 1);
        setOriginalTicketCount(Number(userData.ticketCount) || 0);
        setContact(userData.contact || "");
        setEvent(userData.event || "");
        setOriginalEventName(userData.event || "");
        setDate(userData.date || "");
        setPaymentStatus(userData.paymentStatus === true);
        setEvents(eventData);
      })
      .catch((error) => console.error("Error loading registration:", error));
  }, [id]);

  const selectedEvent = events.find((eventItem) => eventItem.name === eventvar);
  const ticketLimit = selectedEvent
    ? selectedEvent.ticketsAvailable +
      (eventvar === originalEventName ? originalTicketCount : 0)
    : undefined;

  function handleEventChange(event) {
    const eventName = event.target.value;
    const nextEvent = events.find((eventItem) => eventItem.name === eventName);
    const nextTicketLimit = nextEvent
      ? nextEvent.ticketsAvailable +
        (eventName === originalEventName ? originalTicketCount : 0)
      : 0;

    setEvent(eventName);

    if (Number(ticketCount) > nextTicketLimit) {
      setTicketCount(Math.max(1, nextTicketLimit));
    }
  }

  function updateUser(event) {
    event.preventDefault();

    const ticketNumber = Number(ticketCount);

    if (!selectedEvent) {
      alert("Please select a valid prebuilt event.");
      return;
    }

    if (!Number.isInteger(ticketNumber) || ticketNumber < 1) {
      alert("Ticket count must be at least 1.");
      return;
    }

    if (ticketLimit !== undefined && ticketNumber > ticketLimit) {
      alert("Not enough tickets available for this event.");
      return;
    }

    fetch(`http://localhost:3000/registrations/${id}`, {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        userName: userName,
        ticketCount: ticketNumber,
        contact: contact,
        event: eventvar,
        date: date,
        paymentStatus: paymentStatus,
      }),
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to update registration.");
        }

        return data;
      })
      .then(() => {
        window.location.href = "/";
      })
      .catch((error) => {
        alert(error.message);
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
          <h2 className="mb-4">Edit User</h2>

          <form onSubmit={updateUser}>
            <div className="mb-3">
              <label className="form-label" htmlFor="userNameInput">
                Name of user
              </label>
              <input
                id="userNameInput"
                type="text"
                placeholder="User Name"
                className="form-control bg-secondary text-white"
                value={userName}
                onChange={(event) => setUserName(event.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="ticketCountInput">
                Number of Tickets
              </label>
              <input
                id="ticketCountInput"
                type="number"
                placeholder="Ticket Count"
                className="form-control bg-secondary text-white"
                value={ticketCount}
                min="1"
                max={ticketLimit}
                onChange={(event) => setTicketCount(event.target.value)}
                required
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
                onChange={(event) => setContact(event.target.value)}
              />
              <div id="contactHelp" className="form-text text-white-50">
                We'll never share your email/phone with anyone else.
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="eventSelect">
                Event
              </label>
              <select
                id="eventSelect"
                className="form-select bg-secondary text-white"
                value={eventvar}
                onChange={handleEventChange}
                required
              >
                <option value="" disabled>
                  Select an event
                </option>
                {eventvar && !selectedEvent && (
                  <option value={eventvar} disabled>
                    {eventvar} (not available)
                  </option>
                )}
                {events.map((eventItem) => (
                  <option
                    key={eventItem._id}
                    value={eventItem.name}
                    disabled={
                      eventItem.ticketsAvailable <= 0 &&
                      eventItem.name !== originalEventName
                    }
                  >
                    {eventItem.name} (
                    {eventItem.ticketsAvailable +
                      (eventItem.name === originalEventName
                        ? originalTicketCount
                        : 0)}{" "}
                    tickets left)
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="eventDateInput">
                Event Date
              </label>
              <input
                id="eventDateInput"
                type="date"
                className="form-control bg-secondary text-white"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>

            <div className="btn-group" role="group" aria-label="Payment Status">
              <input
                type="radio"
                className="btn-check"
                name="paymentStatus"
                id="statusUnpaid"
                value="false"
                checked={paymentStatus === false}
                onChange={() => setPaymentStatus(false)}
              />
              <label className="btn btn-outline-danger" htmlFor="statusUnpaid">
                Unpaid
              </label>

              <input
                type="radio"
                className="btn-check"
                name="paymentStatus"
                id="statusPaid"
                value="true"
                checked={paymentStatus === true}
                onChange={() => setPaymentStatus(true)}
              />
              <label className="btn btn-outline-success" htmlFor="statusPaid">
                Paid
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary ms-5"
              disabled={!selectedEvent || events.length === 0}
            >
              Save
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditUser;
