import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "octokit";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "No token provided" },
        { status: 400 }
      );
    }

    const octokit = new Octokit({ auth: token });
    const { data: user } = await octokit.rest.users.getAuthenticated();

    // Check scopes
    const scopeResponse = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const scopes = scopeResponse.headers.get("X-OAuth-Scopes");

    return NextResponse.json({
      valid: true,
      user: {
        login: user.login,
        name: user.name,
        avatar_url: user.avatar_url,
      },
      scopes,
    });
  } catch (error) {
    return NextResponse.json(
      { valid: false, error: "Invalid token" },
      { status: 401 }
    );
  }
}

