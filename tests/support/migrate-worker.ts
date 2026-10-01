// Runs migrations against the database URL given on the command line.
// Used by the unit tests to simulate parallel build workers in separate processes.
import { createClient } from "@libsql/client";
import { runMigrations } from "../../src/lib/db/migrations";

const url = process.argv[2];
const client = createClient({ url });
runMigrations(client, { isLocalFile: true })
  .then(() => {
    client.close();
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
