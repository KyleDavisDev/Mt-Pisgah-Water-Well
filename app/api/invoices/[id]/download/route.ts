"use server";

import { cookies } from "next/headers";
import puppeteer, { Browser } from "puppeteer";
import { renderBillHtml } from "./renderInvoiceHtml";
import { withErrorHandler } from "../../../utils/handlers";
import { fetchInvoiceDetails, getUsernameFromCookie, validatePermission } from "../../../utils/utils";
import { ResourceNotFoundError } from "../../../utils/errors";
import { invoiceDetailsMapper } from "../mapper/mapInvoiceDetails"; // your own data‑fetcher

// Keep a single browser instance alive across requests (reduces cold‑start cost)
let browserPromise: Promise<Browser> | null = null;
const getBrowser = async () => {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
  }
  return browserPromise;
};

const handler = async (req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> => {
  // Validate user permissions
  const cookieStore = await cookies();
  const jwtCookie = cookieStore.get("jwt");
  const username = await getUsernameFromCookie(jwtCookie);
  await validatePermission(username, "VIEW_BILLS");

  // 1️⃣ Get the data that `BillView` expects
  const { id } = await params;
  if (!id) {
    throw new ResourceNotFoundError();
  }

  const { bill, homeowner, property, historicalInvoices } = await fetchInvoiceDetails(id);
  if (!homeowner || !property) {
    throw new ResourceNotFoundError("Homeowner and Property info not found");
  }
  const billDetails = invoiceDetailsMapper(bill, homeowner, property, historicalInvoices);

  // Render the component to static HTML
  const html = await renderBillHtml({ details: billDetails });

  // Turn HTML → PDF with a headless Chrome instance
  const browser = await getBrowser();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" }
  });

  await page.close();

  // Stream PDF to client
  const fileName = `${bill.metadata.billing_year}_${bill.metadata.billing_month}_${homeowner.name.replaceAll(" ", "")}_${property.street.replaceAll(" ", "")}.pdf`;
  const headers = new Headers({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${fileName}"`,
    "Content-Length": pdfBuffer.length.toString()
  });

  // @ts-ignore
  return new Response(pdfBuffer, { status: 200, headers });
};

export const GET = withErrorHandler(handler);
