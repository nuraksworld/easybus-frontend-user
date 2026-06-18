import React, { useState } from "react";
import { Layout, Button } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { SideNavigation } from "../../components";
import "../../styles/components/layout/_layout.scss";



const { Header, Content, Footer } = Layout;

const DashboardLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Header className="top-nav">
        {/* LEFT: menu + logo */}
        <div className="top-left">
          <div className="side-nav-button" onClick={() => setCollapsed(!collapsed)}>
            <MenuOutlined />
          </div>
          <div className="logo">MSCRM</div>
        </div>

        {/* RIGHT: username + signout */}
<div className="top-right">
  <span className="username">admin</span>
  <Button
    type="link"
    className="signout-btn"
    onClick={() => {
      // clear auth info
      localStorage.removeItem("token");
      localStorage.removeItem("admin"); // if you store username/role
      
      // (optional) show feedback
      // message.success("Signed out");
      
      // redirect to login
      window.location.href = "/login";
    }}
  >
    Signout
  </Button>
</div>

      </Header>


      {/* Main Layout */}
      <main className="main-layout">
        {/* Sidebar */}
        <aside className={`app-side-bar ${collapsed ? "collapsed" : "expanded"}`}>
          <SideNavigation collapsed={collapsed} />
        </aside>

        {/* Content */}
        <div className={`display-area ${collapsed ? "collapsed" : "expanded"}`}>
          <Content className="childern-content">{children}</Content>
          {/* <Footer className="text-center">
            © {new Date().getFullYear()} MSCRM. All Rights Reserved.
          </Footer> */}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
