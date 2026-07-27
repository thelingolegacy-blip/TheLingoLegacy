import { Card } from '@/components';

export default function Profile({ params }: { params: { id: string } }) {
  return (
    <Card>
      <p className="ll-eyebrow">Identity profile</p>
      <h1>Profile: {params.id}</h1>
      <p>Avalon identity, session history, honor names, and OS role mapping will render here.</p>
    </Card>
  );
}
