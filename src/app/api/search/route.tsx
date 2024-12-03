import { playlistController } from "../../../server/controllers/playlistController";

export async function POST(request: Request) {
  return await playlistController.search(request);
}