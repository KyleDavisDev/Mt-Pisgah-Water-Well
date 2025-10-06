import * as React from "react";
import Link from "next/link";

export interface LinkProps {
  children: string | React.JSX.Element | (string | React.JSX.Element)[];
  href: string;
  inverseColors?: boolean;
  style?: React.CSSProperties | undefined;
  className?: string;
  target?: string;
}

const LinkComponent: React.FunctionComponent<LinkProps> = (props: LinkProps) => {
  return (
    <>
      <Link
        className={`decoration-0 font-(family-name:FuturaMedium) ${props.className}`}
        href={props.href}
        style={{ ...props.style }}
        target={props.target}
      >
        {props.children}
      </Link>
    </>
  );
};

export { LinkComponent as Link };
