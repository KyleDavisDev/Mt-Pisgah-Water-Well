import * as styledComponents from "styled-components";

const {
    default: styled,
    css,
    createGlobalStyle,
    keyframes,
    ThemeProvider
} = styledComponents;

export interface ThemeInterface {
    primaryThemeColor: string;
    primaryDarkThemeColor: string;
    primaryLightThemeColor: string;
    secondaryThemeColor: string;
    navigationTextColor: string;
    navigationIconColor: string;
    landingHeroTextColor: string;
    cardBackgroundColor: string;

    checkBoxActiveBackgroundColor: string;
    checkBoxInActiveBackgroundColor: string;
    checkBoxActiveTextColor: string;
    checkBoxInActiveTextColor: string;

    radioButtonActiveBackgroundColor: string;
    radioButtonInActiveBackgroundColor: string;
    radioButtonActiveTextColor: string;
    radioButtonInActiveTextColor: string;

    siteBackgroundColor: string;

    userCubeBackgroundColor: string;
    userCubeTextColor: string;

    formContainerBackgroundColor: string;
    maxPageWidth: string;
    footerMaxWidth: string;

    scaleP: string;
    scaleH1: string;
    scaleH2: string;
    scaleH3: string;
    scaleH4: string;
    scaleH5: string;
    scaleH6: string;
    exToSm: string;
    smToMd: string;
    mdToLg: string;
    defaultFontSize: string;

    border: string;

    inputBorder: string;

    white: string;
    grey: string;
    lightGrey: string;
    darkGrey: string;
    black: string;
}

enum colors {
    purple = "#3B4DA8",
    white = "#fff",
    grey = "#676767",
    lightGrey = "#CCCCCC",
    darkGrey = "#555",
    mustard = "#FFA816",
    darkMustard = "#c97e00",
    lightMustard = "#fff4e3",
    smoke = "#f5f5f5",
    black = "#333333"
}

enum scale {
    defaultFontSize = "16px",
    maxPageWidth = "75rem",
    footerMaxWidth = "300px",
    scaleP = "1rem",
    scaleH1 = "2.5rem",
    scaleH2 = "2.25rem",
    scaleH3 = "2rem",
    scaleH4 = "1.875rem",
    scaleH5 = "1.125rem",
    scaleH6 = "1rem",
    exToSm = "560px",
    smToMd = "768px",
    mdToLg = "1024px"
}

export const theme = {
    primaryThemeColor: colors.mustard,
    primaryDarkThemeColor: colors.darkMustard,
    primaryLightThemeColor: colors.lightMustard,
    secondaryThemeColor: colors.purple,
    navigationTextColor: colors.white,
    navigationIconColor: colors.white,
    landingHeroTextColor: colors.white,
    cardBackgroundColor: colors.white,

    checkBoxActiveBackgroundColor: colors.mustard,
    checkBoxInActiveBackgroundColor: colors.lightGrey,
    checkBoxActiveTextColor: colors.black,
    checkBoxInActiveTextColor: colors.black,

    radioButtonActiveBackgroundColor: colors.mustard,
    radioButtonInActiveBackgroundColor: colors.lightGrey,
    radioButtonActiveTextColor: colors.black,
    radioButtonInActiveTextColor: colors.black,

    siteBackgroundColor: colors.smoke,

    userCubeBackgroundColor: colors.white,
    userCubeTextColor: colors.mustard,

    formContainerBackgroundColor: colors.white,
    maxPageWidth: scale.maxPageWidth,
    footerMaxWidth: scale.footerMaxWidth,

    scaleP: scale.scaleP,
    scaleH1: scale.scaleH1,
    scaleH2: scale.scaleH2,
    scaleH3: scale.scaleH3,
    scaleH4: scale.scaleH4,
    scaleH5: scale.scaleH5,
    scaleH6: scale.scaleH6,
    exToSm: scale.exToSm,
    smToMd: scale.smToMd,
    mdToLg: scale.mdToLg,
    defaultFontSize: scale.defaultFontSize,

    border: "1px solid #ddd",

    inputBorder: "1px solid #ababab",

    white: colors.white,
    grey: colors.grey,
    lightGrey: colors.lightGrey,
    darkGrey: colors.darkGrey,
    black: colors.black
};

export { css, createGlobalStyle, keyframes, ThemeProvider };
export default styled;
