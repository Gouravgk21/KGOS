import neo4j from 'neo4j-driver';

const neo4jUri = process.env.NEO4J_URI || 'bolt://localhost:7687';
const neo4jUser = process.env.NEO4J_USER || 'neo4j';
const neo4jPassword = process.env.NEO4J_PASSWORD || 'password';

// Initialize the driver lazily to prevent connection errors during static build
let driverInstance: any = null;

export function getNeo4jDriver() {
  if (!driverInstance) {
    driverInstance = neo4j.driver(neo4jUri, neo4j.auth.basic(neo4jUser, neo4jPassword));
  }
  return driverInstance;
}

export async function runCypher(query: string, params: Record<string, any> = {}) {
  const driver = getNeo4jDriver();
  const session = driver.session();
  try {
    const result = await session.run(query, params);
    return result.records.map((record: any) => record.toObject());
  } catch (error) {
    console.error('Neo4j Cypher Execution Error:', error);
    throw error;
  } finally {
    await session.close();
  }
}
