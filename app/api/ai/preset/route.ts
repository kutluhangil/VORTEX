// Agent 7 (Curator) implements the full AI preset generation logic
export async function GET() {
  const enabled = Boolean(process.env.ANTHROPIC_API_KEY);
  return Response.json({ enabled });
}

export async function POST() {
  // TODO: Agent 7
  return Response.json({ error: "Not implemented" }, { status: 501 });
}
