import { ConfigProvider } from "antd";
import { StyleProvider } from "@ant-design/cssinjs";
import { useSelector } from "react-redux";
import { themeConfig, px2rem } from "./themeConfig";

const ThemeProvider = ({ children }) => {
  const themeMode = useSelector((state) => state.theme.theme);

  return (
    <StyleProvider transformers={[px2rem]}>
      <ConfigProvider theme={themeConfig(themeMode)}>{children}</ConfigProvider>
    </StyleProvider>
  );
};

export default ThemeProvider;
