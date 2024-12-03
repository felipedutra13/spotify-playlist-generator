import crypto from 'crypto';
import { NextResponse } from 'next/server';

const generateRandomString = (length: number) => {
    return crypto
        .randomBytes(60)
        .toString('hex')
        .slice(0, length);
}

export async function GET() {
    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_REDIRECT_URI) {
        throw new Error("Spotify credentials are not configured!");
    }

    var state = generateRandomString(16);

    var scope = 'playlist-modify-public playlist-modify-private user-read-private user-read-email';
    const queryParams = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: scope,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        state: state
    });

    const response = NextResponse.redirect(`https://accounts.spotify.com/authorize?${queryParams.toString()}`);
    response.cookies.set('spotify_auth_state', state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 3600
    });

    return response;
}