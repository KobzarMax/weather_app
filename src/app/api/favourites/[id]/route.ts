const DB_URL = process.env.DB_URL || "http://localhost:4000";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const r = await fetch(`${DB_URL}/favourites/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  return new Response(null, { status: r.status });
}
