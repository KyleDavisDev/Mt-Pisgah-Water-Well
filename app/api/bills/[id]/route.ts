import { NextResponse } from "next/server";
import { getBillById } from "../../repositories/billRepository";
import { getHomeownerByPropertyId } from "../../repositories/homeownerRepository";
import { cookies } from "next/headers";
import { getUsernameFromCookie, validatePermission } from "../../utils/utils";
import { getPropertyById } from "../../repositories/propertiesRepository";

export async function GET(req: Request, { params }: { params: { id: string } }): Promise<Response> {
  if (req.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    // Validate user permissions
    const cookieStore = cookies();
    const jwtCookie = cookieStore.get("jwt");
    const username = await getUsernameFromCookie(jwtCookie);
    await validatePermission(username, "VIEW_BILLS");

    const bill = await getBillById(params.id);
    if (!bill) {
      return Response.json({ error: "Bill not found" }, { status: 404 });
    }

    // Fetch associated homeowner data
    const homeowner = await getHomeownerByPropertyId(bill.property_id);
    if (!homeowner) {
      return Response.json({ error: "Homeowner not found" }, { status: 404 });
    }

    // Get property address from homeowner data
    const property = await getPropertyById(bill.property_id);
    if (!property) {
      return Response.json({ error: "Property information not found" }, { status: 404 });
    }

    return Response.json({
      bill,
      homeownerName: homeowner.name,
      propertyAddress: property.address
    });
  } catch (error) {
    console.error("Error processing bill request:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
