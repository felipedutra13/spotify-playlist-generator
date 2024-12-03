import SpotifyService from "../services/spotifyService";
import GeminiService from "../services/geminiService";

const spotifyService = new SpotifyService();
const geminiService = new GeminiService();

interface Song {
    track: string;
    artist: string;
}

async function getSongsId(songs: Song[]) {
    const ids: any = [];

    await Promise.all(
        songs.map(async song => {
            const songData = await spotifyService.search(song.track, song.artist);
            if (songData?.tracks?.items?.[0]?.id) {
                ids.push(songData.tracks.items[0].id);
            }
        }));

    return ids;
}

function cleanJsonResponse(geminiResponse: string): Song[] {
    return JSON.parse(geminiResponse.replace(/^```json\n?/, '')
        .replace(/\n?```\n?$/, '')
        .trim());
}

function formatContent(content: string, numberOfSongs: string) {
    return `Me indique ${numberOfSongs} músicas no contexto de ${content}.
    Usando o JSON schema abaixo, e não adicione nenhum texto adicional além do JSON.

    [
        {
             track: "string",
            artist: "string"
        }
    ]`
}

async function search(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = {
        track: searchParams.get("track"),
        artist: searchParams.get("artist"),
    };

    if (!query.track || !query.artist) {
        return new Response(JSON.stringify({
            error: {
                message: "Provide a valid data to search the track!",
            }
        }), { status: 400 });
    }

    try {
        const searchResponse = await spotifyService.search(query.track, query.artist);
        return new Response(JSON.stringify(searchResponse), { status: 201 });
    } catch (err) {
        return new Response(JSON.stringify({
            error: {
                message: "Failed to search!",
            }
        }), { status: 400 });
    }
}

async function createPlaylist(req: Request) {
    const { content, numberOfSongs, title } = await req.json();

    if (!content || !numberOfSongs || !title) {
        return new Response(JSON.stringify({
            error: "No parameters found!"
        }), {
            status: 400
        });
    }

    const geminiRequest = formatContent(content, numberOfSongs);

    const songs = cleanJsonResponse(await geminiService.run(geminiRequest));

    const songsId = await getSongsId(songs);

    const playlist = await spotifyService.createPlaylistForUser(title);

    await spotifyService.addItemsToPlaylist(playlist.id, songsId);

    return new Response(null, {
        status: 200
    });
}

export const playlistController = {
    search,
    createPlaylist
};