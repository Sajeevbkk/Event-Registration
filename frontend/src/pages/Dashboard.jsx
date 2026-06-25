import { Link } from "react-router-dom";

function Dashboard({ users, events }) {
  const totalUsers = new Set(users.map((u) => u.userName)).size;
  const totalRegistrations = users.length;
  const totalEvents = events.length;

  return (
    <div className="container-fluid min-vh-100 d-flex flex-column align-items-center justify-content-center p-4">
      <div
        className="liquid-glass p-5 text-center w-100"
        style={{ maxWidth: "800px" }}
      >
        <h1 className="display-4 fw-bold mb-4 text-white">
          Event Management Dashboard
        </h1>
        <p className="lead mb-5 text-light">
          Welcome to the modern Event Management experience. Manage your events
          and registrations with ease.
        </p>

        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <div
              className="p-4 rounded"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <h3 className="fs-1 fw-bold text-white">{totalUsers}</h3>
              <p className="text-light mb-0">Unique Users</p>
            </div>
          </div>
          <div className="col-md-4">
            <div
              className="p-4 rounded"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <h3 className="fs-1 fw-bold text-white">{totalRegistrations}</h3>
              <p className="text-light mb-0">Total Registrations</p>
            </div>
          </div>
          <div className="col-md-4">
            <div
              className="p-4 rounded"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <h3 className="fs-1 fw-bold text-white">{totalEvents}</h3>
              <p className="text-light mb-0">Available Events</p>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-center gap-3">
          <Link
            to="/registrations"
            className="btn btn-light btn-lg px-4"
            style={{
              background: "rgba(255,255,255,0.9)",
              color: "#1e3c72",
              fontWeight: "bold",
            }}
          >
            View Registrations
          </Link>
          <Link
            to="/create"
            className="btn btn-outline-light btn-lg px-4 border-2"
          >
            Add New User
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
