import * as React from "react";

import "./global.css";
import Meta from "./components/Meta/Meta";

export default function RootLayout(props: any) {
  return (
    <html lang="en">
      <Meta />
      <body>{props.children}</body>
    </html>
  );
}
