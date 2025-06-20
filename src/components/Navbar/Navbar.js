import PropTypes from 'prop-types';
import React, { useCallback, useEffect } from 'react';
import {
  FaBars,
  FaCalendarAlt,
  FaEdit,
  FaEdit as FaFullEdit,
  FaKey,
  FaSignOutAlt,
  FaTimes,
  FaUser,
  FaUserEdit,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../../styles/components/Navbar.css';
import NavItem from './NavItem';

const useDropdown = (initialState = false) => {
  const [isOpen, setIsOpen] = React.useState(initialState);
  const toggle = React.useCallback(() => setIsOpen((prev) => !prev), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  return [isOpen, { toggle, close }];
};

const Navbar = ({ onLogout }) => {
  const [isMobileMenuOpen, { toggle: toggleMobileMenu, close: closeMobileMenu }] =
    useDropdown(false);

  const handleLogout = useCallback(() => {
    onLogout();
    closeMobileMenu();
  }, [onLogout, closeMobileMenu]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        closeMobileMenu();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [closeMobileMenu]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        closeMobileMenu();
      }
    },
    [closeMobileMenu]
  );

  return (
    <nav
      className="navbar"
      role="navigation"
      aria-label="Main navigation"
      onKeyDown={handleKeyDown}
    >
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" aria-label="Home">
          <img src="/logo192.png" alt="" className="navbar-logo" aria-hidden="true" />
          <span>Patient Journey</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleMobileMenu}
          aria-expanded={isMobileMenuOpen}
          aria-label="Toggle navigation"
          aria-controls="navbarNav"
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
        <div className={`navbar-collapse ${isMobileMenuOpen ? 'open' : ''}`} id="navbarNav">
          <ul className="navbar-nav" role="menubar">
            <NavItem icon={FaEdit} label="Edit">
              <li role="none">
                <Link
                  to="/info"
                  state={{ action: 'quickEdit' }}
                  className="dropdown-item"
                  role="menuitem"
                >
                  <FaUserEdit className="dropdown-icon" aria-hidden="true" />
                  <span>Quick Edit</span>
                </Link>
              </li>
              <li role="none">
                <Link
                  to="/info"
                  state={{ action: 'fullEdit' }}
                  className="dropdown-item"
                  role="menuitem"
                >
                  <FaFullEdit className="dropdown-icon" aria-hidden="true" />
                  <span>Full Edit</span>
                </Link>
              </li>
            </NavItem>
            <NavItem icon={FaCalendarAlt} label="Appointments">
              <li role="none">
                <Link to="/appointments" className="dropdown-item" role="menuitem">
                  <FaCalendarAlt className="dropdown-icon" aria-hidden="true" />
                  <span>Create Appointment</span>
                </Link>
              </li>
              <li role="none">
                <Link to="/view-appointments" className="dropdown-item" role="menuitem">
                  <FaCalendarAlt className="dropdown-icon" aria-hidden="true" />
                  <span>View Appointments</span>
                </Link>
              </li>
            </NavItem>
            <NavItem icon={FaUser} label="User">
              <li role="none">
                <Link
                  to="/info"
                  state={{ action: 'changePassword' }}
                  className="dropdown-item"
                  role="menuitem"
                >
                  <FaKey className="dropdown-icon" aria-hidden="true" />
                  <span>Change Password</span>
                </Link>
              </li>
              <li role="none">
                <button onClick={handleLogout} className="dropdown-item" role="menuitem">
                  <FaSignOutAlt className="dropdown-icon" aria-hidden="true" />
                  <span>Logout</span>
                </button>
              </li>
            </NavItem>
          </ul>
        </div>
      </div>
    </nav>
  );
};

Navbar.propTypes = {
  onLogout: PropTypes.func.isRequired,
};

export default React.memo(Navbar);
