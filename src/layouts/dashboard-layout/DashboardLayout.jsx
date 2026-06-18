import React, { useEffect, useState } from "react";
import { Layout, Button } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { SideNavigation } from "../../components";
import "../../styles/components/layout/_layout.scss";

const { Header, Content } = Layout;

const DashboardLayout = ({ children, showSidebar = true, showTopNav = true }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);

  // ✅ Load user info from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("easybus_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      localStorage.removeItem("easybus_user");
    }
  }, []);

  // ✅ Handle sign out
  const handleSignout = () => {
    localStorage.removeItem("easybus_token");
    localStorage.removeItem("easybus_user");
    window.location.href = "/login";
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      {showTopNav && (
        <Header className="top-nav">
          {/* LEFT: menu + logo */}
          <div className="top-left">
            {showSidebar && (
              <div
                className="side-nav-button"
                onClick={() => setCollapsed(!collapsed)}
              >
                <MenuOutlined />
              </div>
            )}
            <div className="logo">EasyBus</div>
          </div>

          {/* RIGHT: username + signout */}
          <div className="top-right">
            <span className="username">
              {user?.name ? user.name : user?.phone ? user.phone : "User"}
            </span>
            <Button type="link" className="signout-btn" onClick={handleSignout}>
              Sign out
            </Button>
          </div>
        </Header>
      )}

      {/* Main Layout */}
      <main className="main-layout">
        {/* Sidebar */}
        {showSidebar && (
          <aside className={`app-side-bar ${collapsed ? "collapsed" : "expanded"}`}>
            <SideNavigation collapsed={collapsed} />
          </aside>
        )}

        {/* Content */}
        <div
          className={`display-area ${
            showSidebar ? (collapsed ? "collapsed" : "expanded") : "no-sidebar"
          }`}
          style={{
            width: showSidebar ? undefined : "100%",
            marginLeft: showSidebar ? undefined : 0,
          }}
        >
          <Content className="childern-content">{children}</Content>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
