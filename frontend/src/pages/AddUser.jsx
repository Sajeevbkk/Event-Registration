import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function createEventRow() {
  return {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`,
    event: "",
    ticketCount: 1,
    date: "",
  };
}

function AddUser() {
  const [userName, setUserName] = useState("");
  const [contact, setContact] = useState("");
  const [events, setEvents] = useState([]);
  const [eventRows, setEventRows] = useState([createEventRow()]);
  const [paymentStatus, setPaymentStatus] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3000/events")
      .then((response) => response.json())
      .then((data) => {
        setEvents(data);
      })
      .catch((error) => console.error("Error loading events:", error));
  }, []);

  const availableEventCount = events.filter(
    (eventItem) => eventItem.ticketsAvailable > 0,
  ).length;

  function getSelectedEvent(eventName) {
    return events.find((eventItem) => eventItem.name === eventName);
  }

  function isEventSelectedInOtherRow(rowId, eventName) {
    return eventRows.some(
      (eventRow) => eventRow.id !== rowId && eventRow.event === eventName,
    );
  }

  function updateEventRow(rowId, fieldName, value) {
    setEventRows((currentRows) =>
      currentRows.map((eventRow) =>
        eventRow.id === rowId
          ? {
              ...eventRow,
              [fieldName]: value,
            }
          : eventRow,
      ),
    );
  }

  function handleEventChange(rowId, eventName) {
    const selectedEvent = getSelectedEvent(eventName);

    setEventRows((currentRows) =>
      currentRows.map((eventRow) => {
        if (eventRow.id !== rowId) {
          return eventRow;
        }

        const currentTicketCount = Number(eventRow.ticketCount);
        const nextTicketCount =
          selectedEvent && currentTicketCount > selectedEvent.ticketsAvailable
            ? Math.max(1, selectedEvent.ticketsAvailable)
            : eventRow.ticketCount;

        return {
          ...eventRow,
          event: eventName,
          ticketCount: nextTicketCount,
        };
      }),
    );
  }

  function addEventRow() {
    setEventRows((currentRows) => [...currentRows, createEventRow()]);
  }

  function removeEventRow(rowId) {
    setEventRows((currentRows) =>
      currentRows.length === 1
        ? currentRows
        : currentRows.filter((eventRow) => eventRow.id !== rowId),
    );
  }

  function validateEventRows() {
    const selectedEventNames = new Set();

    for (const eventRow of eventRows) {
      const selectedEvent = getSelectedEvent(eventRow.event);
      const ticketNumber = Number(eventRow.ticketCount);

      if (!eventRow.event) {
        return "Please select an event for each row.";
      }

      if (selectedEventNames.has(eventRow.event)) {
        return "Please select each event only once.";
      }

      if (!Number.isInteger(ticketNumber) || ticketNumber < 1) {
        return "Ticket count must be at least 1 for each event.";
      }

      if (!selectedEvent) {
        return "Please select a valid prebuilt event.";
      }

      if (ticketNumber > selectedEvent.ticketsAvailable) {
        return "Not enough tickets available for one of the selected events.";
      }

      selectedEventNames.add(eventRow.event);
    }

    return "";
  }

  function saveUser(event) {
    event.preventDefault();

    const validationMessage = validateEventRows();

    if (validationMessage) {
      alert(validationMessage);
      return;
    }

    fetch("http://localhost:3000/registrations/bulk", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        userName: userName,
        contact: contact,
        paymentStatus: paymentStatus,
        events: eventRows.map((eventRow) => ({
          event: eventRow.event,
          ticketCount: Number(eventRow.ticketCount),
          date: eventRow.date,
        })),
      }),
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to save the registrations.");
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
          <h2 className="mb-4">Add User</h2>

          <form onSubmit={saveUser}>
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

            <div className="d-flex justify-content-between align-items-center mb-2">
              <h3 className="h5 mb-0">Events</h3>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={addEventRow}
                disabled={
                  events.length === 0 || eventRows.length >= availableEventCount
                }
              >
                Add Event
              </button>
            </div>

            {eventRows.map((eventRow, index) => {
              const selectedEvent = getSelectedEvent(eventRow.event);

              return (
                <div
                  className="border border-secondary rounded p-3 mb-3"
                  key={eventRow.id}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="h6 mb-0">Event {index + 1}</h4>
                    {eventRows.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => removeEventRow(eventRow.id)}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label
                        className="form-label"
                        htmlFor={`eventSelect-${eventRow.id}`}
                      >
                        Event
                      </label>
                      <select
                        id={`eventSelect-${eventRow.id}`}
                        className="form-select bg-secondary text-white"
                        value={eventRow.event}
                        onChange={(event) =>
                          handleEventChange(eventRow.id, event.target.value)
                        }
                        required
                      >
                        <option value="" disabled>
                          Select an event
                        </option>
                        {events.map((eventItem) => {
                          const usedInAnotherRow = isEventSelectedInOtherRow(
                            eventRow.id,
                            eventItem.name,
                          );

                          return (
                            <option
                              key={eventItem._id}
                              value={eventItem.name}
                              disabled={
                                usedInAnotherRow ||
                                eventItem.ticketsAvailable <= 0
                              }
                            >
                              {eventItem.name} ({eventItem.ticketsAvailable}{" "}
                              tickets left)
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label
                        className="form-label"
                        htmlFor={`ticketCountInput-${eventRow.id}`}
                      >
                        Number of Tickets
                      </label>
                      <input
                        id={`ticketCountInput-${eventRow.id}`}
                        type="number"
                        placeholder="Ticket Count"
                        className="form-control bg-secondary text-white"
                        value={eventRow.ticketCount}
                        min="1"
                        max={
                          selectedEvent
                            ? selectedEvent.ticketsAvailable
                            : undefined
                        }
                        onChange={(event) =>
                          updateEventRow(
                            eventRow.id,
                            "ticketCount",
                            event.target.value,
                          )
                        }
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label
                        className="form-label"
                        htmlFor={`eventDateInput-${eventRow.id}`}
                      >
                        Event Date
                      </label>
                      <input
                        id={`eventDateInput-${eventRow.id}`}
                        type="date"
                        className="form-control bg-secondary text-white"
                        value={eventRow.date}
                        onChange={(event) =>
                          updateEventRow(
                            eventRow.id,
                            "date",
                            event.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              );
            })}

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
              disabled={events.length === 0}
            >
              Save
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddUser;
