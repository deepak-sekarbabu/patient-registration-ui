import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DropdownMenu = ({ children, isOpen, label, onClose, id }) => {
  const location = useLocation();
  useEffect(() => {
    onClose();
  }, [location, onClose]);

  if (!isOpen) return null;

  return (
    <ul className="dropdown-menu" role="menu" aria-label={`${label} submenu`} id={id}>
      {children}
    </ul>
  );
};

DropdownMenu.propTypes = {
  children: PropTypes.node.isRequired,
  isOpen: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  id: PropTypes.string,
};

export default DropdownMenu;
