import fastify from "fastify";
import dotenv from "dotenv";
import sensible from "@fastify/sensible";
import cors from "@fastify/cors";
import { PrismaClient } from "@prisma/client";
import cookie from "@fastify/cookie";
const COMMENT_SELECT = {
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
};
dotenv.config();
const prisma = new PrismaClient();
let app = fastify();
app.register(sensible);
app.register(cookie, { secret: process.env.COOKIE_SECRECT });
app.addHook("onRequest", (req, res, done) => {
  if (req.cookies.userId !== CURRENT_USER_ID)
    req.cookies.userId = CURRENT_USER_ID;
  res.clearCookie("userId");
  res.setCookie("userId ", CURRENT_USER_ID);
  done();
});

const CURRENT_USER_ID = (
  await prisma.user.findFirst({
    where: {
      name: "Kyle",
    },
  })
).id;

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

// app.get("/posts/:id", async (req, res) => {
//   // console.log(req.params.id);
//   return await commitToDo(
//     prisma.post
//       .findUnique({
//         where: {
//           id: req.params.id,
//         },
//         select: {
//           body: true,
//           title: true,
//           comments: {
//             orderBy: {
//               createdAt: "desc",
//             },
//             select: {
//               ...COMMENT_SELECT,
//               _count: { select: { likes: true } },
//             },
//           },
//         },
//       })
//       .then(async (post) => {
//         const likes = await prisma.like.findMany({
//           where: {
//             userId: req.cookies.userId,
//             commentId: { in: post.comments.map((comment) => comment.id) },
//           },
//         });
//         console.log(post.comments);
//         return {
//           ...post,
//           comment: post.comments.map((comment) => {
//             const { _count, ...commentFields } = comment;
//             return {
//               ...commentFields,
//               likeByMe: likes.find((like) => like.commentId === comment.id),
//               likeCount: _count.likes,
//               test: "hello",
//             };
//           }),
//         };
//       })
//   );
// });
app.get("/posts/:id", async (req, res) => {
  return await commitToDo(
    prisma.post
      .findUnique({
        where: { id: req.params.id },
        select: {
          body: true,
          title: true,
          comments: {
            orderBy: {
              createdAt: "desc",
            },
            select: {
              ...COMMENT_SELECT,
              _count: { select: { likes: true } },
            },
          },
        },
      })
      .then(async (post) => {
        const likes = await prisma.like.findMany({
          where: {
            userId: req.cookies.userId,
            commentId: { in: post.comments.map((comment) => comment.id) },
          },
        });

        return {
          ...post,
          comments: post.comments.map((comment) => {
            const { _count, ...commentFields } = comment;
            return {
              ...commentFields,
              likedByMe: likes.find((like) => like.commentId === comment.id),
              likeCount: _count.likes,
            };
          }),
        };
      })
  );
});

app.post("/posts/:id/comments", async (req, res) => {
  if (req.body.message === "" || req.body.message === null) {
    return res.send(app.httpErrors.badRequest("Message is required"));
  }
  return await commitToDo(
    prisma.comment
      .create({
        data: {
          message: req.body.message,
          userId: req.cookies.userId,
          parentId: req.body.parentId,
          postId: req.params.id,
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
      })
      .then((comment) => {
        return {
          ...comment,
          likeCount: 0,
          likeByMe: false,
        };
      })
  );
});

app.put("/posts/:postId/comments/:commentId", async (req, res) => {
  if (req.body.message === "" || req.body.message === null) {
    return res.send(app.httpErrors.badRequest("Message is required"));
  }
  const { userId } = await prisma.comment.findUnique({
    where: { id: req.params.commentId },
    select: {
      userId: true,
    },
  });
  if (userId !== req.cookies.userId) {
    return res.send(app.httpErrors.unauthorized("You don't have Permession!"));
  }
  return await commitToDo(
    prisma.comment.update({
      where: {
        id: req.params.commentId,
      },
      select: { message: true },
      data: { message: req.body.message },
    })
  );
});

app.delete("/posts/:postId/comments/:commentId", async (req, res) => {
  const { userId } = await prisma.comment.findUnique({
    where: {
      id: req.params.commentId,
    },
    select: {
      userId: true,
    },
  });
  if (userId !== req.cookies.userId) {
    return res.send(app.httpErrors.unauthorized("No Permession!"));
  }
  return await commitToDo(
    prisma.comment.delete({
      where: {
        id: req.params.commentId,
      },
      select: {
        id: true,
      },
    })
  );
});
app.listen({ port: process.env.PORT });

async function commitToDo(promise) {
  const [error, data] = await app.to(promise);
  if (error) return app.httpErrors.internalServerError(error.message);
  return data;
}
