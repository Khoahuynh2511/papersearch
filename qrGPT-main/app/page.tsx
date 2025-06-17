import CTA from '@/components/CTA';
import GradientWrapper from '@/components/GradientWrapper';
import Hero from '@/components/Hero';
import FeatureHighlights from '@/components/FeatureHighlights';

export default function Home() {
  return (
    <>
      <Hero />
      <FeatureHighlights />
      <GradientWrapper></GradientWrapper>
      <CTA />
    </>
  );
}
