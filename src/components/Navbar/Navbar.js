import React, { useEffect, useRef, useState } from 'react';
import {
  FaCalendarAlt,
  FaEdit,
  FaEdit as FaFullEdit,
  FaKey,
  FaSignOutAlt,
  FaUser,
  FaUserEdit,
} from 'react-icons/fa';
import { Link } from 'react-router-dom'; // Import Link
import '../../styles/components/Navbar.css'; // Import the CSS

const Navbar = ({ onLogout }) => {
  // Add onLogout prop
  const [editOpen, setEditOpen] = useState(false);
  const [appointmentsOpen, setAppointmentsOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false); // For the main navbar toggle on mobile

  const toggleEdit = () => setEditOpen(!editOpen);
  const toggleAppointments = () => setAppointmentsOpen(!appointmentsOpen);
  const toggleUser = () => setUserOpen(!userOpen);
  const toggleNav = () => setNavOpen(!navOpen);

  // Close dropdowns when clicking outside
  const useOutsideAlerter = (ref, closeFunction) => {
    useEffect(() => {
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          closeFunction();
        }
      }
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [ref, closeFunction]);
  };

  const editRef = useRef(null);
  const appointmentsRef = useRef(null);
  const userRef = useRef(null);

  useOutsideAlerter(editRef, () => setEditOpen(false));
  useOutsideAlerter(appointmentsRef, () => setAppointmentsOpen(false));
  useOutsideAlerter(userRef, () => setUserOpen(false));

  return (
    <nav className="navbar">
      <a className="navbar-brand" href="#home">
        <img src="/logo192.png" alt="Patient Journey Logo" className="navbar-logo" />
        <span>Patient Journey</span>
      </a>
      <button
        className="navbar-toggler"
        type="button"
        onClick={toggleNav}
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className={`navbar-collapse ${navOpen ? 'open' : ''}`} id="navbarNav">
        <ul className="navbar-nav">
          <li ref={editRef} className={`nav-item dropdown ${editOpen ? 'open' : ''}`}>
            <button
              className="nav-link dropdown-toggle"
              onClick={toggleEdit}
              aria-expanded={editOpen}
            >
              <FaEdit className="nav-icon" />
              <span>Edit</span>
            </button>
            <ul className="dropdown-menu" aria-labelledby="editDropdown">
              <li>
                <Link
                  to="/info"
                  state={{ action: 'quickEdit' }}
                  className="dropdown-item"
                  onClick={() => setEditOpen(false)}
                >
                  <FaUserEdit className="dropdown-icon" />
                  <span>Quick Edit</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/info"
                  state={{ action: 'fullEdit' }}
                  className="dropdown-item"
                  onClick={() => setEditOpen(false)}
                >
                  <FaFullEdit className="dropdown-icon" />
                  <span>Full Edit</span>
                </Link>
              </li>
            </ul>
          </li>
          <li
            ref={appointmentsRef}
            className={`nav-item dropdown ${appointmentsOpen ? 'open' : ''}`}
          >
            <button
              className="nav-link dropdown-toggle"
              onClick={toggleAppointments}
              aria-expanded={appointmentsOpen}
            >
              <FaCalendarAlt className="nav-icon" />
              <span>Appointments</span>
            </button>
            <ul className="dropdown-menu" aria-labelledby="appointmentsDropdown">
              <li>
                <Link
                  to="/appointments"
                  className="dropdown-item"
                  onClick={() => setAppointmentsOpen(false)}
                >
                  <FaCalendarAlt className="dropdown-icon" />
                  <span>Create Appointment</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/view-appointments"
                  className="dropdown-item"
                  onClick={() => setAppointmentsOpen(false)}
                >
                  <FaCalendarAlt className="dropdown-icon" />
                  <span>View Existing Appointments</span>
                </Link>
              </li>
            </ul>
          </li>
          <li ref={userRef} className={`nav-item dropdown ${userOpen ? 'open' : ''}`}>
            <button
              className="nav-link dropdown-toggle"
              onClick={toggleUser}
              aria-expanded={userOpen}
            >
              <FaUser className="nav-icon" />
              <span>User</span>
            </button>
            <ul className="dropdown-menu" aria-labelledby="userDropdown">
              <li>
                <Link
                  to="/info"
                  state={{ action: 'changePassword' }}
                  className="dropdown-item"
                  onClick={() => setUserOpen(false)}
                >
                  <FaKey className="dropdown-icon" />
                  <span>Change Password</span>
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    onLogout();
                    setUserOpen(false);
                  }}
                  className="dropdown-item"
                >
                  <FaSignOutAlt className="dropdown-icon" />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
