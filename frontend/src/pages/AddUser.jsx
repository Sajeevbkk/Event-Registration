import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function AddUser() {
  const [userName, setuserName] = useState("");
  const [ticketCount, setticketCount] = useState(0);
  const [contact, setcontact] = useState("");
  const [paymentStatus, setpaymentStatus] = useState(false);
  const [date, setdate] = useState("");

  function saveUser(event) {
    event.preventDefault();

    fetch("http://localhost:3000/registrations", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        userName: userName,
        ticketCount: Number(ticketCount),
        contact: contact,
        paymentStatus: paymentStatus,
        date: date,
      }),
    })
      .then((response) => response.json())
      .then(() => {
        window.location.href = "/";
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

            <div class="mb-3">
              <label class="form-label">Number of Tickets</label>
              <input
                type="number"
                placeholder="Ticket Count"
                className="form-control bg-secondary"
                value={ticketCount}
                onChange={(event) => setticketCount(event.target.value)}
              />
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
        </div>
      </div>
    </div>
  );
}

export default AddUser;
