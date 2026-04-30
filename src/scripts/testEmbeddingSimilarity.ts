import { getEmbedding, cosineSimilarity } from "@/lib/ai/embeddings";


async function main() {
  const taskA = `
Research bonding activities suitable for 6-year-old children.
Find activities that promote connection and enjoyment for both parent and child.
Priority: high
`;

  const taskB = `
Research age-appropriate activities for 6-year-olds.
Find activities that a 6-year-old child enjoys and that the parent will also enjoy participating in.
Priority: high
`;

  const taskC = `
Clean the bathroom counter and tub this weekend.
Focus on removing clutter and scrubbing the tub.
Priority: high
`;

  const embeddingA = await getEmbedding(taskA);
  const embeddingB = await getEmbedding(taskB);
  const embeddingC = await getEmbedding(taskC);

  console.log(
    "A vs B similar task score:",
    cosineSimilarity(embeddingA, embeddingB),
  );
  console.log(
    "A vs C different task score:",
    cosineSimilarity(embeddingA, embeddingC),
  );
}

main().catch(console.error);
