(() => {
  const aboutSection = document.querySelector(".about-history");
  const rightPhoto = document.querySelector(".lawyer-profile__photo--from-right");
  const leftPhoto = document.querySelector(".lawyer-profile__photo--from-left");
  const firstProfile = document.querySelector(".lawyer-profile--text-left");
  const secondProfile = document.querySelector(".lawyer-profile--image-left");

  if (!aboutSection || !rightPhoto || !leftPhoto || !firstProfile || !secondProfile) {
    return;
  }

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    const animatePhoto = ({ photo, trigger, fromX }) => {
      gsap.fromTo(
        photo,
        {
          x: fromX, // Distancia inicial do deslocamento.
          autoAlpha: 0,
          scale: 0.97,
          rotate: fromX.startsWith("-") ? -1.4 : 1.4,
          filter: "blur(6px)"
        },
        {
          x: 0,
          autoAlpha: 1,
          scale: 1,
          rotate: 0,
          filter: "blur(0px)",
          ease: "expo.out",
          scrollTrigger: {
            trigger,
            start: "top 88%", // Ponto do viewport em que a animacao comeca.
            end: "top 48%",
            scrub: 0.9, // Quanto menor, mais rapido acompanha o scroll.
            invalidateOnRefresh: true
          }
        }
      );
    };

    animatePhoto({
      photo: rightPhoto,
      trigger: firstProfile,
      fromX: "34vw"
    });

    animatePhoto({
      photo: leftPhoto,
      trigger: secondProfile,
      fromX: "-34vw"
    });

    ScrollTrigger.refresh();
    return;
  }

  const setupFallbackPhoto = (photo, fromX) => {
    photo.style.opacity = "0";
    photo.style.filter = "blur(6px)";
    photo.style.transform = `translateX(${fromX}) scale(0.97)`;
    photo.style.transition = "transform 900ms cubic-bezier(0.16, 1, 0.3, 1), opacity 620ms ease, filter 900ms ease";
  };

  setupFallbackPhoto(rightPhoto, "34vw");
  setupFallbackPhoto(leftPhoto, "-34vw");

  const fallbackObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const photo = entry.target.querySelector(".lawyer-profile__photo");

      if (photo) {
        photo.style.opacity = "1";
        photo.style.filter = "blur(0)";
        photo.style.transform = "translateX(0) scale(1)";
      }

      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.08,
    rootMargin: "0px 0px -18% 0px"
  });

  fallbackObserver.observe(firstProfile);
  fallbackObserver.observe(secondProfile);
})();
