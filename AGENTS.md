# Agent Instructions

## Hard security rule: never access credentials

This repository contains real database credentials that point at production and non-production systems. Treat every secret as production.

**Never read, print, copy, grep, search, diff, or otherwise inspect any credentials or secrets.** This includes, at minimum:

- `.env`, `.env.local`, `.env.production.local`, and any other `.env*` file
- `.idea/dataSources/` and any IDE/connection configuration that may contain credentials
- Any file or output containing passwords, API keys, tokens, connection strings, or private keys

Do not attempt to work around this by piping, redacting, or reading only "just the keys." Reading the file is the violation.

**Never load env files into a process.** Do not run `source .env*`, `set -a; . ./.env*`, `dotenv`, or any equivalent. Do not start scripts or tests in a way that pulls credentials from these files.

**Never connect to any external service or database** (production or non-production) using credentials found in this repository or environment. This includes read-only queries. Schema introspection is still access.

If a task appears to require credentials or a live connection:

1. Stop.
2. Tell the user exactly what is needed and why.
3. Ask them to provide non-secret values or run the command themselves.
4. Continue with placeholders or mocked data in the meantime.

If a secret is exposed to you by accident, do not repeat it, do not write it anywhere, and immediately tell the user to rotate it.

This rule applies to every agent, subagent, and tool invocation. Pass it down verbatim when delegating.
