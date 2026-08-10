import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function buildAppleAppSiteAssociation(teamID: string, bundleID = "com.fuelwell.app") {
  return {
    applinks: {
      apps: [],
      details: [
        {
          appIDs: [`${teamID}.${bundleID}`],
          components: [
            { "/": "/callback", comment: "FuelWell OAuth callback" },
            { "/": "/native-auth/*", comment: "FuelWell native authentication bridge" },
          ],
        },
      ],
    },
  };
}

export function GET() {
  const teamID = process.env.FUELWELL_APPLE_TEAM_ID?.trim();
  const bundleID = process.env.FUELWELL_APP_IDENTIFIER?.trim() || "com.fuelwell.app";

  if (!teamID) {
    return NextResponse.json(
      { error: "FUELWELL_APPLE_TEAM_ID is required for universal links." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json(buildAppleAppSiteAssociation(teamID, bundleID), {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "Content-Type": "application/json",
    },
  });
}
