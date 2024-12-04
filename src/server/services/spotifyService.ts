import { cookies } from 'next/headers';

const AUTH_URL = "https://accounts.spotify.com/api/token";
const API_URL = "https://api.spotify.com/v1";

function formatURI(ids: string[]) {
    return ids.map(id => `spotify:track:${id}`);
}

class SpotifyService {
    async generateAccessToken() {
        if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
            throw new Error("Spotify credentials are not configured!");
        }

        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', process.env.SPOTIFY_CLIENT_ID);
        params.append('client_secret', process.env.SPOTIFY_CLIENT_SECRET);

        let accessToken = null;

        try {
            const response = await fetch(AUTH_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params
            });

            const data = await response.json();
            accessToken = data.access_token;
        } catch (err) {
            throw new Error(`Erro ao obter token do Spotify: ${err}`);
        }

        return accessToken;
    }

    async refreshToken() {
        if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
            throw new Error("Spotify credentials are not configured!");
        }

        const cookieStore = cookies();
        const refreshToken = cookieStore.get('spotify_refresh_token')?.value;

        if (!refreshToken) {
            throw new Error("No refresh_token provided!");
        }

        const params = new URLSearchParams();
        params.append('grant_type', 'refresh_token');
        params.append('refresh_token', refreshToken);
        params.append('client_id', process.env.SPOTIFY_CLIENT_ID);

        let data = null;

        try {
            const response = await fetch(AUTH_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')
                },
                body: params
            });

            data = await response.json();
        } catch (err) {
            throw new Error(`Erro ao obter token do Spotify: ${err}`);
        }

        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresAt: (Date.now() + (data.expires_in * 1000)).toString()
        };
    }

    async createPlaylistForUser(title: string) {
        const cookieStore = cookies();
        const accessToken = cookieStore.get('spotify_access_token')?.value;

        if (!title) {
            throw new Error("No playlist title provided!");
        }

        if (!accessToken) {
            throw new Error("No access token provided!");
        }

        const userInfo = await this.getUserInfo();

        if (!userInfo || !userInfo.id) {
            throw new Error("No 'id' available for the user!");
        }

        let response;
        try {
            response = await fetch(`${API_URL}/users/${userInfo.id}/playlists?`, {
                method: 'POST',
                headers: {
                    'Authorization': "Bearer " + accessToken,
                },
                body: JSON.stringify({
                    "name": title,
                    "public": false
                })
            });
        } catch (err) {
            throw new Error(`Error while creating playlist: ${err}`);
        }

        response = await response.json();
        return response;
    }

    async search(track: string, artist: string) {
        const accessToken = "Bearer " + await this.generateAccessToken();

        const query = `track:${track} artist:${artist}`;

        let response;
        try {
            response = await fetch(`${API_URL}/search?` + new URLSearchParams({
                type: 'track',
                q: query,
                limit: "1",
            }).toString(), {
                method: 'GET',
                headers: {
                    'Authorization': accessToken,
                }
            });
        } catch (err) {
            throw new Error(`Error while searching ${err}`);
        }

        response = await response.json();

        return response;
    }

    async getUserInfo() {
        const cookieStore = cookies();
        const accessToken = cookieStore.get('spotify_access_token')?.value;

        if (!accessToken) {
            throw new Error("No access token provided!");
        }

        let response;
        try {
            response = await fetch(`${API_URL}/me`, {
                method: 'GET',
                headers: {
                    'Authorization': "Bearer " + accessToken,
                }
            });
        } catch (err) {
            throw new Error(`Error while getting user data: ${err}`);
        }

        response = await response.json();

        return response;
    }

    async addItemsToPlaylist(playlistId: string, songsId: string[]) {
        const cookieStore = cookies();
        const accessToken = cookieStore.get('spotify_access_token')?.value;

        if (!accessToken) {
            throw new Error("No access token provided!");
        }

        if (!playlistId) {
            throw new Error("No 'playlistId' provided!");
        }

        let response;
        try {
            response = await fetch(`${API_URL}/playlists/${playlistId}/tracks`, {
                method: 'POST',
                headers: {
                    'Authorization': "Bearer " + accessToken,
                },
                body: JSON.stringify({
                    "uris": formatURI(songsId)
                })
            });
        } catch (err) {
            throw new Error(`Error while adding items to playlist: ${err}`);
        }

        response = await response.json();

        return response;
    }
}

export default SpotifyService;