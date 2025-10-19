export const Hero = () => {
  return (
    <section id="hero" className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="max-w-5xl mx-auto text-center animate-fade-in">
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold mb-6 tracking-tight">
          Capturer l'émotion,
          <br />
          révéler l'essence
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
          Photographe passionné spécialisé dans le portrait artistique et la photographie conceptuelle
        </p>
        <button
          onClick={() => {
            const element = document.getElementById("work");
            element?.scrollIntoView({ behavior: "smooth" });
          }}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Découvrir mon travail
        </button>
      </div>
    </section>
  );
};
