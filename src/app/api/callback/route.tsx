import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_REDIRECT_URI || !process.env.SPOTIFY_CLIENT_SECRET) {
        throw new Error("Spotify credentials are not configured!");
    }

    const { searchParams, origin } = new URL(request.url);
    const query = {
        code: searchParams.get("code"),
        state: searchParams.get("state"),
    };

    const cookieStore = cookies();
    const storedState = cookieStore.get('spotify_auth_state')?.value;

    if (!query.code || !query.state) {
        return new Response(JSON.stringify({
            error: {
                message: "Error, try again later!",
            }
        }), { status: 400 });
    }

    if (query.state === null || query.state !== storedState) {
        return NextResponse.redirect('/error?message=state_mismatch');
    }

    const response = NextResponse.redirect(`${origin}/`);
    response.cookies.delete('spotify_auth_state');

    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')
        },
        body: new URLSearchParams({
            code: query.code,
            redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
            grant_type: 'authorization_code'
        })
    });

    const tokenData = await tokenResponse.json();

    response.cookies.set('spotify_access_token', tokenData.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 3600
    });

    response.cookies.set('spotify_refresh_token', tokenData.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 3600
    });
    
    response.cookies.set('spotify_token_expires_at', (Date.now() + (tokenData.expires_in * 1000)).toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 3600
    });

    return response;
}