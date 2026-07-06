import { pipeline } from '@xenova/transformers'

// multilingual-e5-small: nhỏ (~470MB tải lần đầu, cache lại sau đó),
// hỗ trợ tiếng Việt tốt, đủ nhanh để chạy CPU cho vài chục câu.
const MODEL_ID = 'Xenova/multilingual-e5-small'

let extractorPromise = null

function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = pipeline('feature-extraction', MODEL_ID)
  }
  return extractorPromise
}

/**
 * E5 models yêu cầu prefix "query: " cho câu hỏi và "passage: " cho tài liệu
 * để đạt chất lượng retrieval tốt nhất.
 */
export async function embed(text, { isQuery = false } = {}) {
  const extractor = await getExtractor()
  const prefixed = (isQuery ? 'query: ' : 'passage: ') + text
  const output = await extractor(prefixed, { pooling: 'mean', normalize: true })
  return Array.from(output.data)
}

export function cosineSimilarity(a, b) {
  let dot = 0
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i]
  // Vectors đã normalize=true nên dot product = cosine similarity
  return dot
}
