import { theme } from "antd";
import { px2remTransformer } from "@ant-design/cssinjs";

export const px2rem = px2remTransformer({ rootValue: 14 });

export const themeConfig = (themeMode) => ({
  token: {
    fontFamily: "'Open Sans', sans-serif",
    colorPrimary: "#154074",
  },

  algorithm:
    themeMode === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
});
