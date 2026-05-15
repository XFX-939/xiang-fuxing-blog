import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

type LikesStore = Record<string, number>;

const slugPattern = /^[a-z0-9-]+$/;
let writeQueue = Promise.resolve();

function getStorePath() {
  if (process.env.LIKES_STORE_PATH) {
    return process.env.LIKES_STORE_PATH;
  }

  return path.join(process.cwd(), "data", "likes.json");
}

async function readStore(): Promise<LikesStore> {
  const storePath = getStorePath();

  try {
    const raw = await fs.readFile(storePath, "utf8");
    const parsed = JSON.parse(raw) as LikesStore;

    return Object.fromEntries(
      Object.entries(parsed)
        .filter(([slug, count]) => slugPattern.test(slug) && Number.isFinite(count))
        .map(([slug, count]) => [slug, Math.max(0, Math.floor(Number(count)))])
    );
  } catch (error: any) {
    if (error?.code === "ENOENT") {
      return {};
    }

    throw error;
  }
}

async function writeStore(store: LikesStore) {
  const storePath = getStorePath();
  const directory = path.dirname(storePath);
  const tempPath = `${storePath}.tmp`;

  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(tempPath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
  await fs.rename(tempPath, storePath);
}

function invalidSlugResponse() {
  return NextResponse.json({ error: "Invalid article slug." }, { status: 400 });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") ?? "";

  if (!slugPattern.test(slug)) {
    return invalidSlugResponse();
  }

  const store = await readStore();

  return NextResponse.json(
    { slug, count: store[slug] ?? 0 },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { slug?: string } | null;
  const slug = body?.slug ?? "";

  if (!slugPattern.test(slug)) {
    return invalidSlugResponse();
  }

  const operation = writeQueue.then(async () => {
    const store = await readStore();
    const count = (store[slug] ?? 0) + 1;
    store[slug] = count;
    await writeStore(store);

    return { slug, count };
  });

  writeQueue = operation.then(
    () => undefined,
    () => undefined
  );

  const result = await operation;

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
