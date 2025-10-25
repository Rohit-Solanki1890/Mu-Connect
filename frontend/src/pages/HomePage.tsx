import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';

export function HomePage() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl overflow-hidden bg-brand-gradient text-white p-8 shadow-card">
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight">Marwadi Connect Pro</h1>
        <p className="mt-2 text-white/90 max-w-2xl">Connect with peers, share knowledge, join rooms, blog your journey, and play games together — all in one modern, real-time platform for Marwadi students.</p>
        <div className="mt-6 flex gap-3">
          <Link to="/register"><Button size="lg">Get Started</Button></Link>
          <Link to="/feed"><Button size="lg" variant="secondary" className="bg-white/20 border-white text-white">Explore Feed</Button></Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card><CardBody>
          <div className="text-lg font-semibold">Realtime Rooms</div>
          <p className="text-sm opacity-80">Chat, screenshare, and play games together live.</p>
        </CardBody></Card>
        <Card><CardBody>
          <div className="text-lg font-semibold">Express Yourself</div>
          <p className="text-sm opacity-80">Post updates and publish long-form blogs with ease.</p>
        </CardBody></Card>
        <Card><CardBody>
          <div className="text-lg font-semibold">For Marwadi Students</div>
          <p className="text-sm opacity-80">Built for your campus community. Ready to demo.</p>
        </CardBody></Card>
      </section>
    </div>
  );
}



