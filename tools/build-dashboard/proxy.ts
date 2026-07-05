import { NextResponse, type NextRequest } from "next/server";

// Basic Auth gate (Next 16 "proxy" convention). Active only when
// DASHBOARD_PASSWORD is set — otherwise the dashboard is open (its data all
// comes from a PUBLIC repo). Set the env var on Vercel to lock it for you + Max:
//   vercel env add DASHBOARD_PASSWORD production
export function proxy(req: NextRequest) {
  const password = process.env.DASHBOARD_PASSWORD;
  if (!password) return NextResponse.next();

  const expectedUser = process.env.DASHBOARD_USER ?? "fuelwell";
  const header = req.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    try {
      const [user, pass] = atob(header.slice(6)).split(":");
      if (user === expectedUser && pass === password) {
        return NextResponse.next();
      }
    } catch {
      // fall through to 401
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="FuelWell Build Status", charset="UTF-8"',
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
