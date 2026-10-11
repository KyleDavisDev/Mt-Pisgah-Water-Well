import { HomeownerRepository } from "../repositories/homeownerRepository";
import { withAuthenticationHandler, withErrorHandler } from "../utils/handlers";

// NextJS quirk to make the route dynamic
export const dynamic = "force-dynamic";

const handler = async (_req: Request, _ctx: unknown) => {
  const homeowners = await HomeownerRepository.getAllHomeowners();

  return Response.json({
    homeowners: homeowners
      .sort((a, b) => a.name.localeCompare(b.name)) // sort by name
      .map(h => {
        return {
          name: h.name,
          id: h.id.toString(),
          email: h.email,
          phone: h.phone_number,
          mailingAddress: h.mailing_address,
          isActive: h.is_active ? "true" : "false"
        };
      })
  });
};

export const GET = withErrorHandler(withAuthenticationHandler(handler, ["VIEW_HOMEOWNERS"]));
