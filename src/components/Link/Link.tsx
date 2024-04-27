import * as React from "react";
import Link from "next/link";
import styled from "../../theme/styled-components";

export interface LinkProps {
  children: string | React.JSX.Element | (string | React.JSX.Element)[];
  href: string;
  className?: string;
  target?: "_blank" | "_self";
  inverseColors?: boolean;
}

const LinkComponent: React.FunctionComponent<LinkProps> = (
  props: LinkProps,
) => {
  return (
    <>
      {props.target === "_blank" ? (
        <a href={props.href} target="_blank" className={props.className}>
          {props.children}
        </a>
      ) : (
        <Link href={props.href} legacyBehavior>
          <a className={props.className} target="_self">
            {props.children}
          </a>
        </Link>
      )}
    </>
  );
};

const StyledLink = styled(LinkComponent)`
  text-decoration: none;
  font-family: FuturaMedium;
  color: ${(props) =>
    props.inverseColors
      ? props.theme.siteFontColor
      : props.theme.primaryThemeColor};

  &:hover,
  &:focus {
    color: ${(props) => props.theme.secondaryThemeColor};
  }
`;
StyledLink.displayName = "Link";

export { StyledLink as Link };
