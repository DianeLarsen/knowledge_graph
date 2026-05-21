// captureAnalysisUtils.ts

export function parseCaptureAnalysis(analysisJson: string) {
  return JSON.parse(analysisJson);
}

export function toggleIndexValue(index: number, values: number[]) {
  return values.includes(index)
    ? values.filter((value) => value !== index)
    : [...values, index];
}
