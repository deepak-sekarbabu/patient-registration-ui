import PropTypes from 'prop-types';
import React from 'react';
import DropdownMenu from './DropdownMenu';

const useDropdown = (initialState = false) => {
  const [isOpen, setIsOpen] = React.useState(initialState);
  const ref = React.useRef(null);

  const handleEscape = React.useCallback((event) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  React.useEffect(() => {
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

  const toggle = React.useCallback(() => setIsOpen((prev) => !prev), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  const open = React.useCallback(() => setIsOpen(true), []);

  return [isOpen, { ref, toggle, close, open }];
};

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

NavItem.propTypes = {
  icon: PropTypes.elementType,
  label: PropTypes.string.isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
};

export default NavItem;
