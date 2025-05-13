import * as React from "react";
import Link from "next/link";
import styled from "../../theme/styled-components";

export interface LinkProps {
  children: string | React.JSX.Element | (string | React.JSX.Element)[];
  href: string;
  inverseColors?: boolean;
  style?: React.CSSProperties | undefined;
}

const LinkComponent: React.FunctionComponent<LinkProps> = (props: LinkProps) => {
  return (
    <>
      <Link href={props.href} legacyBehavior style={{ ...props.style }}>
        {props.children}
      </Link>
    </>
  );
};

const StyledLink = styled(LinkComponent)`
  text-decoration: none;
  font-family: FuturaMedium;
  //color: ${props => (props.inverseColors ? props.theme.siteFontColor : props.theme.primaryThemeColor)};
  color: "red";

  &:hover,
  &:focus {
    color: ${props => props.theme.primaryThemeColor};
  }
`;
StyledLink.displayName = "Link";

export { StyledLink as Link };
