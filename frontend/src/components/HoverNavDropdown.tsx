import { useState } from "react";
import { NavDropdown } from "react-bootstrap";
import { Link } from "react-router-dom";

interface HoverNavDropdownProps {
  title: string;
  items: { label: string; to: string }[];
  id: string;
}

const HoverNavDropdown: React.FC<HoverNavDropdownProps> = ({ title, items, id }) => {
    const [show, setShow] = useState(false);
    let timeoutId: NodeJS.Timeout;
    
    const handleMouseEnter = () => {
      clearTimeout(timeoutId);
      setShow(true);
    };
    
    const handleMouseLeave = () => {
      timeoutId = setTimeout(() => setShow(false), 50);
    };

    const handleItemClick = () => {
        setShow(false);
    };

    return (
        <NavDropdown
            title={title}
            id={id}
            show={show}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="hover-dropdown"
            >
            {items.map((item, idx) => (
                <NavDropdown.Item as={Link} to={item.to} key={idx} onClick={handleItemClick}>
                {item.label}
                </NavDropdown.Item>
            ))}
        </NavDropdown>
    );
};

export default HoverNavDropdown;
