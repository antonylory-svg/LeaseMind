import { projectSafePresentationSynthetic } from './safePresentationSyntheticViewModel.js';

export interface SafePresentationSyntheticPreviewProps {
  input: unknown;
}

export default function SafePresentationSyntheticPreview({ input }: SafePresentationSyntheticPreviewProps) {
  const view = projectSafePresentationSynthetic(input);

  if (view.kind === 'blocked') return <>{view.presentation}</>;

  return (
    <section>
      <p>{view.watermark}</p>
      <h1>{view.heading}</h1>
      <p>{view.message}</p>
    </section>
  );
}
