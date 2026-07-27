import { Button, Card } from '@/components';

export default function Login() {
  return (
    <Card>
      <p className="ll-eyebrow">Identity</p>
      <h1>Login to Lingo Legacy OS</h1>
      <p>Authenticate to unlock protected wallet, XP, and admin operations.</p>
      <Button>Authenticate</Button>
    </Card>
  );
}
