# fastify-reply-ext

A really basic plugin for Fastify that adds reply helpers for all the status
codes. This has a few uses;

- Remembering / autocompleting names of the HTTP responses is easier than
  remembering the numbers
- Make your error responses consistently shaped

For example,

```ts
reply.badRequest();
```

is the same as

```ts
reply.code(400).send({ statusCode: 400, message: 'Bad Request' });
```

## Getting started

```ts
import { fastify } from 'Fastify';
import { replyExtPlugin } from '@robcresswell/fastify-reply-ext';

const server = fastify();
await server.register(replyExtPlugin);
```

See [Fastify's plugin docs](https://www.fastify.io/docs/master/Plugins/) for
more information
