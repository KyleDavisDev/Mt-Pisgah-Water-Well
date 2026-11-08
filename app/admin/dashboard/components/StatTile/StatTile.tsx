import * as React from "react";

export interface StatTileProps {
  header: string;
  body: string;
  footerText?: string;
  footerClassName?: string;
  accentClassName?: string;
}

const StatTile: React.FunctionComponent<StatTileProps> = props => {
  const {
    header,
    body,
    footerText,
    footerClassName = "text-gray-500",
    accentClassName = "bg-primaryThemeColor"
  } = props;

  return (
    <div className="relative overflow-hidden rounded-md border border-tableBorder bg-white p-4 shadow-sm">
      <span className={`absolute inset-x-0 top-0 h-1 ${accentClassName}`} />
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{header}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-black">{body}</p>
      {footerText && <p className={`mt-1 text-xs ${footerClassName}`}>{footerText}</p>}
    </div>
  );
};

export { StatTile };
