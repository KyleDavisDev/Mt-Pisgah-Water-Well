import * as React from "react";
import localFont from 'next/font/local'

import {
    ThemeProvider,
    theme,
    createGlobalStyle
} from "../../theme/styled-components";
import Meta from "../Meta/Meta";

const AvenirNextReg = localFont({
  src: '../../theme/fonts/AvenirNext-Regular.ttf',
  display: 'swap',
});
const FuturaMedium = localFont({
  src: "../../theme/fonts/Futura-Medium.ttf",
  display: 'swap',
})

// const AvenirNextReg = "../../theme/fonts/AvenirNext-Regular.ttf";
// const FuturaMedium = "../../theme/fonts/Futura-Medium.ttf";

interface IPageProps {
    children?: any;
}

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: FuturaMedium;
    src: url('${FuturaMedium}') format('truetype');
    font-weight: normal;
      font-style: normal;
  }
  @font-face {
    font-family: AvenirNextReg;
    src: url('${AvenirNextReg}') format('truetype');
    font-weight: normal;
      font-style: normal;
  }
  /* Define the "system" font family */
  @font-face {
    font-family: System;
    font-style: normal;
    font-weight: 300;
    src: local(".SFNSText-Light"), local(".HelveticaNeueDeskInterface-Light"), local(".LucidaGrandeUI"), local("Ubuntu Light"), local("Segoe UI Light"), local("Roboto-Light"), local("DroidSans"), local("Tahoma");
  }

  body {
    margin: 0px;
    min-height: 100vh;
  }

  a {
    font-family: AvenirNextReg !important;
  }

  html {
    background-color: #fbfbfb;
    font-family: AvenirNextReg;
    font-size: 16px;
  }

  h1,h2,h3,h4,h5,h6 {
    margin: 0px;
    font-family: FuturaMedium;
  }

  #__next {
    display: flex;
    flex-direction:column;
    justify-content: flex-start;
    min-height: 100vh;

    footer {
      margin-top: auto;
    }
  }


`;

const Page: React.FunctionComponent<IPageProps> = props => {
    return (
        <ThemeProvider theme={theme}>
            <GlobalStyle />
            <Meta />
            {props.children}
        </ThemeProvider>
    );
};

export default Page;
