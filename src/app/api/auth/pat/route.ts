import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const PAT_COOKIE_NAME = "github_pat";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    // Validate the token by fetching the user
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Invalid token", message: "The token is invalid or expired" },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: "GitHub API error", message: "Failed to validate token" },
        { status: response.status }
      );
    }

    const user = await response.json();

    // Check if the token has the required scopes
    const scopes = response.headers.get("x-oauth-scopes") || "";
    const hasRepoScope = scopes.includes("repo") || scopes.includes("public_repo");

    if (!hasRepoScope) {
      return NextResponse.json(
        {
          error: "Insufficient permissions",
          message: "Token needs 'repo' or 'public_repo' scope to access repository data",
        },
        { status: 403 }
      );
    }

    // Store the token in a secure HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set(PAT_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: {
        login: user.login,
        name: user.name,
        avatar_url: user.avatar_url,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("PAT validation error:", error);
    return NextResponse.json(
      { error: "Internal error", message: "Failed to validate token" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(PAT_COOKIE_NAME);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PAT logout error:", error);
    return NextResponse.json(
      { error: "Internal error", message: "Failed to logout" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(PAT_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false });
    }

    // Validate the token is still valid
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!response.ok) {
      // Token is invalid, clear it
      cookieStore.delete(PAT_COOKIE_NAME);
      return NextResponse.json({ authenticated: false });
    }

    const user = await response.json();

    return NextResponse.json({
      authenticated: true,
      user: {
        login: user.login,
        name: user.name,
        avatar_url: user.avatar_url,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("PAT check error:", error);
    return NextResponse.json({ authenticated: false });
  }
}
