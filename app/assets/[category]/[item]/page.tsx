import { Card, Section } from '@/components';

export default function AssetPage({ params }: { params: { category: string; item: string } }) {
  return (
    <Section title="Global Asset Universe">
      <Card>
        <p>
          {params.category} / {params.item}
        </p>
        <p>Asset metadata, previews, and storage-backed delivery will connect here.</p>
      </Card>
    </Section>
  );
}
