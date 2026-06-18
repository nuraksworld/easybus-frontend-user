import { Menu, Button } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import NavItems from "./NavItems";
import "../../../styles/components/layout/_layout.scss";


const SideNavigation = ({ collapsed }) => {
  const navigate = useNavigate(); 
  const location = useLocation(); 

  return (
    <Menu
      theme="dark"
      mode="inline"
      inlineCollapsed={collapsed}
      selectedKeys={[location.pathname.replace("/", "")]}
      items={NavItems}
      onClick={(e) => navigate(`/${e.key}`)}
    />
  );
};

export default SideNavigation;