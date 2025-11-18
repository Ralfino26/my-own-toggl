import ProjectList from '@/components/ProjectList';
import { SparklesCore } from '@/components/ui/sparkles';

export default function Home() {
  return (
    <div className="min-h-screen relative bg-black dark:bg-black overflow-hidden">
      <div className="absolute inset-0 z-0">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
      </div>
      <main className="relative z-10 container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <ProjectList />
      </main>
    </div>
  );
}
