#!/usr/bin/env -S node -r ts-node/register/transpile-only

import { promises as fsp } from 'fs';
import { STATUS_CODES } from 'http';
import * as path from 'path';

function msgToFuncName(message: string) {
  const [firstWord, ...rest] = message.split(' ');

  return (firstWord.toLowerCase() + rest.join('')).replace(/[ \-']/g, '');
}

async function build() {
  const typeDefs: string[] = [];
  const decorators: string[] = [];

  Object.entries(STATUS_CODES).forEach(([code, httpErrMsg]) => {
    if (!httpErrMsg) return;

    const statusCode = parseInt(code, 10);
    const funcName = msgToFuncName(httpErrMsg);

    typeDefs.push(`    ${funcName}: (customErrMsg?: string) => void;`);
    decorators.push(`    fastify.decorateReply(
      '${funcName}',
      async function (this: FastifyReply, customMessage?: string) {
        return this.code(${statusCode}).send({
          statusCode: ${statusCode},
          message: customMessage ?? "${httpErrMsg}",
        });
      },
    );`);
  });

  const template = `import type { FastifyReply } from 'fastify';
import fastifyPlugin from 'fastify-plugin';

declare module 'fastify' {
  export interface FastifyReply {
${typeDefs.join('\n')}
  }
}

export const replyExtPlugin = fastifyPlugin(
  async function (fastify) {
${decorators.join('\n\n')}
  },
  { name: 'fastify-reply-ext' },
);
`;

  await fsp.writeFile(path.join(__dirname, 'reply-plugin.ts'), template, {
    encoding: 'utf-8',
  });
}

build().catch((error: unknown) => {
  console.log(error);
});
