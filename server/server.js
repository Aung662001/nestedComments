import fastify from "fastify";
import dotenv from "dotenv";
import sensible from "@fastify/sensible";
import cors from "@fastify/cors";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const prisma = new PrismaClient();
let app = fastify();
app.register(sensible);
app.register(cors, {
  origin: `${process.env.CLIENT_URL}`,
  credentials: true,
});
app.get("/posts", async (req, res) => {
  return await commitToDo(
    prisma.post.findMany({
      select: {
        id: true,
        title: true,
      },
    })
  );
});

app.get("/posts/:id", async (req, res) => {
  // console.log(req.params.id);
  return await commitToDo(
    prisma.post.findUnique({
      where: {
        id: req.params.id,
      },
      select: {
        body: true,
        title: true,
        comments: {
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            message: true,
            parentId: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })
  );
});

app.post("/posts/:id/comments", async (req, res) => {
  console.log(req.body.message);
  if (req.body.message === "" || req.body.message === null)
    res.send(app.httpErrors.badRequest("Message is required"));
});
app.listen({ port: process.env.PORT });

async function commitToDo(promise) {
  const [error, data] = await app.to(promise);
  if (error) return app.httpErrors.internalServerError(error.message);
  return data;
}
