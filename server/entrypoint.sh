#!/bin/sh
set -e

echo "Running migrations..."
npx ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:run -d src/config/data-source.ts

echo "Starting server..."
exec node dist/src/main
