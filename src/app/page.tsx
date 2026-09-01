import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import WhatWeDo from "@/components/WhatWeDo";
import Team from "@/components/Team";
import Events from "@/components/Events";
import JoinUs from "@/components/JoinUs";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <WhatWeDo />
        <Team />
        <Events />
        <JoinUs />
      </main>
      <Footer />
    </>
  );
}
