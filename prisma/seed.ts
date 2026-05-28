import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import "dotenv/config";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const u1 = await prisma.user.upsert({
    where: { sessionKey: "test-session-1" },
    update: {},
    create: { sessionKey: "test-session-1", anonName: "새벽고양이#1234" },
  });
  const u2 = await prisma.user.upsert({
    where: { sessionKey: "test-session-2" },
    update: {},
    create: { sessionKey: "test-session-2", anonName: "달빛여우#5678" },
  });
  const u3 = await prisma.user.upsert({
    where: { sessionKey: "test-session-3" },
    update: {},
    create: { sessionKey: "test-session-3", anonName: "안개토끼#9012" },
  });

  const yesterday = "2026-05-27";
  const posts = [
    {
      userId: u1.id, dawnDate: yesterday,
      content: "잠이 안 와서 그냥 누워있다가 일어났어. 창밖에 아무것도 없는데 왜 이렇게 무서운지 모르겠다. 그냥 이 새벽이 빨리 지나갔으면.",
      mood: "불안", musicTitle: "Good Night", musicArtist: "The Weeknd",
    },
    {
      userId: u2.id, dawnDate: yesterday,
      content: "오늘 하루 되게 이상했어. 별로 나쁜 일도 없었는데 내내 슬펐다. 이런 날이 가끔 있는데, 이유를 모르겠을 때가 제일 힘들어.",
      mood: "슬픔", musicTitle: "Liability", musicArtist: "Lorde",
    },
    {
      userId: u3.id, dawnDate: yesterday,
      content: "사실 오늘 엄청 좋은 일이 있었는데 말할 사람이 없어서 여기에 씀. 오래 기다리던 게 드디어 됐어. 지금 엄청 설레.",
      mood: "설렘",
    },
    {
      userId: u1.id, dawnDate: "2026-05-26",
      content: "요즘 계속 같은 꿈을 꿔. 잘 모르는 공간인데 익숙한 느낌. 꿈에서 깨면 항상 뭔가 그리운 기분이 드는데 뭘 그리워하는지 모르겠어.",
      mood: "그리움", musicTitle: "Motion Picture Soundtrack", musicArtist: "Radiohead",
    },
    {
      userId: u2.id, dawnDate: "2026-05-26",
      content: "아무 생각 없이 음악만 듣다가 새벽 세시가 됐다. 이런 날이 좋은 건지 나쁜 건지 잘 모르겠는데, 지금 이 순간은 꽤 평온한 것 같기도.",
      mood: "평온", musicTitle: "Breathe (2 AM)", musicArtist: "Anna Nalick",
    },
  ];

  for (const p of posts) {
    const createdAt = new Date(`${p.dawnDate}T02:30:00+09:00`);
    await prisma.post.create({ data: { ...p, createdAt } });
  }

  console.log("Seed complete: 5 posts created");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
