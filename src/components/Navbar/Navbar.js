import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  FaCalendarAlt,
  FaEdit,
  FaEdit as FaFullEdit,
  FaKey,
  FaSignOutAlt,
  FaUser,
  FaUserEdit,
  FaBars,
  FaTimes,
} from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/components/Navbar.css'; // Import the CSS

/**
 * Custom hook to handle dropdown open/close logic and click outside behavior
 */
const useDropdown = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const ref = useRef(null);

  const handleEscape = useCallback((event) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleEscape]);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);
  const open = useCallback(() => setIsOpen(true), []);

  return [isOpen, { ref, toggle, close, open }];
};

/**
 * DropdownMenu component for consistent dropdown behavior
 */
const DropdownMenu = ({ children, isOpen, label, onClose }) => {
  // Close dropdown when route changes
  const location = useLocation();
  useEffect(() => {
    onClose();
  }, [location, onClose]);

  if (!isOpen) return null;

  return (
    <ul className="dropdown-menu" role="menu" aria-label={`${label} submenu`}>
      {children}
    </ul>
  );
};

/**
 * NavItem component for individual navigation items
 */
const NavItem = ({ icon: Icon, label, children, className = '', ...props }) => {
  const [isOpen, { ref, toggle, close }] = useDropdown(false);
  const hasChildren = React.Children.count(children) > 0;
  const buttonId = `${label.toLowerCase().replace(/\s+/g, '-')}-dropdown`;
  const menuId = `${buttonId}-menu`;

  return (
    <li ref={ref} className={`nav-item dropdown ${isOpen ? 'open' : ''} ${className}`}>
      <button
        id={buttonId}
        className="nav-link"
        onClick={toggle}
        aria-haspopup={hasChildren ? 'true' : undefined}
        aria-expanded={hasChildren ? isOpen : undefined}
        aria-controls={hasChildren ? menuId : undefined}
        {...props}
      >
        {Icon && <Icon className="nav-icon" aria-hidden="true" />}
        <span>{label}</span>
      </button>
      {hasChildren && (
        <DropdownMenu isOpen={isOpen} label={label} id={menuId} onClose={close}>
          {React.Children.map(children, (child) => React.cloneElement(child, { onClick: close }))}
        </DropdownMenu>
      )}
    </li>
  );
};

const Navbar = ({ onLogout }) => {
  const [isMobileMenuOpen, { toggle: toggleMobileMenu, close: closeMobileMenu }] =
    useDropdown(false);

  // Memoize the logout handler to prevent unnecessary re-renders
  const handleLogout = useCallback(() => {
    onLogout();
    closeMobileMenu();
  }, [onLogout, closeMobileMenu]);

  // Close mobile menu when window is resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        // Bootstrap's lg breakpoint
        closeMobileMenu();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [closeMobileMenu]);

  // Keyboard navigation for the navbar
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
