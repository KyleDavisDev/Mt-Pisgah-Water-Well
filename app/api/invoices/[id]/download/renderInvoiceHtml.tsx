"use server";

import fs from "fs";
import path from "path";

import BillViewContent from "../../../../admin/dashboard/invoices/view/[id]/BillViewContent";
import { InvoiceDetails } from "../types";

export const renderToStaticMarkup = async (element: any): Promise<any> => {
  const { renderToString } = await import("react-dom/server");

  return Promise.resolve(renderToString(element));
};

// Helper that discovers the dev‑time CSS URL from the rendered page itself.
// This is a pretty hacky method... Should revisit this at some point to include less magic strings.
async function discoverDevCssUrl(): Promise<string> {
  const res = await fetch(`http://localhost:${process.env.PORT || 3000}/account/login`);
  const html = await res.text();
  const match = html.match(/<link rel="stylesheet" href=".*\.css\?v=\d+"/);
  if (!match) throw new Error("Unable to locate dev CSS file");

  const link = match[0].split("href=")[1];
  const linkWithoutQuotes = link.replaceAll('"', "");
  return `http://localhost:${process.env.PORT || 3000}${linkWithoutQuotes}`;
}

const getTailwindCss = async (): Promise<string> => {
  if (process.env.NODE_ENV === "production") {
    const cssDir = path.join(process.cwd(), ".next", "static", "css");
    return fs
      .readdirSync(cssDir)
      .filter(f => f.endsWith(".css"))
      .map(f => fs.readFileSync(path.join(cssDir, f), "utf8"))
      .join("\n");
  }

  const cssUrl = await discoverDevCssUrl();
  console.log(cssUrl);
  const res = await fetch(cssUrl);
  if (!res.ok) throw new Error(`Failed to fetch dev CSS (${cssUrl})`);
  return await res.text();
};

interface renderBillHtmlProps {
  details: InvoiceDetails;
}

export const renderBillHtml = async (props: renderBillHtmlProps): Promise<string> => {
  // Render the component to plain HTML (no React data‑attrs)
  const body = await renderToStaticMarkup(<BillViewContent billDetails={props.details} />);

  // console.log(body);
  let temp = await getTailwindCss();

  // Wrap it in a minimal document so the PDF engine sees a full page.

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <style>${temp}</style>
      </head>
      <body class="antialiased bg-white">${body}</body>
    </html>
  `;
};
