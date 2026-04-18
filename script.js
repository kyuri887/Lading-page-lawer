(() => {
  const header = document.querySelector(".hero__header");
  const hero = document.querySelector(".hero");

  if (!header || !hero) {
    return;
  }

  let lastScrollY = window.scrollY;
  let ticking = false;
  const lightSectionIds = new Set(["sobre", "duvidas"]);

  // Desativa o header flutuante apenas quando o scrollY está dentro
  // da própria altura do header — ponto em que o header estático nativo
  // já está visível no viewport, evitando qualquer zona sem header.
  const getHeroLimit = () => header.offsetHeight;

  const getCurrentSection = (currentScrollY) => {
    const headerHeight = header.classList.contains("is-fixed") ? header.offsetHeight : 0;
    const checkPoint = currentScrollY + headerHeight + 24;
    const sections = Array.from(document.querySelectorAll("section[id]"));

    return sections.find((section) => {
      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;

      return checkPoint >= sectionTop && checkPoint < sectionBottom;
    });
  };

  const updateHeaderContrast = (currentScrollY) => {
    const currentSection = getCurrentSection(currentScrollY);
    const isLightSection = currentSection && lightSectionIds.has(currentSection.id);

    header.classList.toggle("is-over-light", Boolean(isLightSection));
    header.classList.toggle("is-over-dark", !isLightSection);
  };

  const updateHeader = () => {
    const currentScrollY = Math.max(window.scrollY, 0);
    const isHeroSection = currentScrollY <= getHeroLimit();
    const isScrollingUp = currentScrollY < lastScrollY - 6;
    const isScrollingDown = currentScrollY > lastScrollY + 6;

    if (isHeroSection) {
      header.classList.remove("is-fixed", "is-hidden", "is-over-light", "is-over-dark");
      lastScrollY = currentScrollY;
      ticking = false;
      return;
    }

    if (isScrollingUp) {
      header.classList.add("is-fixed");
      header.classList.remove("is-hidden");
      updateHeaderContrast(currentScrollY);
    }

    if (isScrollingDown) {
      header.classList.add("is-fixed", "is-hidden");
      updateHeaderContrast(currentScrollY);
    }

    lastScrollY = currentScrollY;
    ticking = false;
  };

  const requestHeaderUpdate = () => {
    if (ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(updateHeader);
  };

  updateHeader();
  window.addEventListener("scroll", requestHeaderUpdate, { passive: true });
  window.addEventListener("resize", requestHeaderUpdate);
})();

// ─── Scrollspy: IntersectionObserver para estado ativo na navbar ──────────────
(() => {
  const navLinks = Array.from(document.querySelectorAll(".hero__nav a[href^='#']"));
  const sections = Array.from(document.querySelectorAll("section[id]"));

  if (!navLinks.length || !sections.length) {
    return;
  }

  // Mapeia id da seção → link do nav correspondente
  const linkMap = new Map();
  navLinks.forEach((link) => {
    const id = link.getAttribute("href").replace("#", "");
    linkMap.set(id, link);
  });

  // Mantém o set de seções visíveis no viewport
  const visibleSections = new Set();

  const setActiveLink = () => {
    // Encontra a seção visível mais próxima do topo da página
    let topSection = null;
    let topOffset = Infinity;

    visibleSections.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < topOffset) {
        topOffset = rect.top;
        topSection = id;
      }
    });

    // Remove active de todos e aplica no ativo
    navLinks.forEach((link) => link.classList.remove("active"));

    if (topSection && linkMap.has(topSection)) {
      linkMap.get(topSection).classList.add("active");
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id;
        if (entry.isIntersecting) {
          visibleSections.add(id);
        } else {
          visibleSections.delete(id);
        }
      });
      setActiveLink();
    },
    {
      // Considera visível quando pelo menos 12% da seção aparece na tela
      threshold: 0.12,
      // Desconta a altura aproximada do header fixo ao detectar a seção ativa
      rootMargin: "-72px 0px 0px 0px"
    }
  );

  sections.forEach((section) => {
    if (linkMap.has(section.id)) {
      observer.observe(section);
    }
  });
})();

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

(() => {
  const contactForm = document.querySelector(".contact-form");

  if (!contactForm) {
    return;
  }

  const feedback = contactForm.querySelector(".contact-form__feedback");
  const fields = Array.from(contactForm.querySelectorAll("input, textarea"));
  const formState = {
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  };

  const setFeedback = (message, type) => {
    if (!feedback) {
      return;
    }

    feedback.textContent = message;
    feedback.classList.remove("is-error", "is-success");

    if (type) {
      feedback.classList.add(`is-${type}`);
    }
  };

  const updateState = () => {
    fields.forEach((field) => {
      formState[field.name] = field.value.trim();
    });
  };

  const setFieldValidity = (field, isValid) => {
    const wrapper = field.closest(".contact-form__field");

    if (!wrapper) {
      return;
    }

    wrapper.classList.toggle("is-invalid", !isValid);
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    updateState();

    let isValid = true;

    fields.forEach((field) => {
      const hasValue = Boolean(formState[field.name]);
      const hasValidEmail = field.type !== "email" || isValidEmail(formState.email);
      const fieldIsValid = hasValue && hasValidEmail;

      setFieldValidity(field, fieldIsValid);

      if (!fieldIsValid) {
        isValid = false;
      }
    });

    if (!isValid) {
      setFeedback("Preencha todos os campos corretamente.", "error");
      return false;
    }

    setFeedback("", null);
    return true;
  };

  const submitContactForm = async (payload) => {
    // Futuramente, substitua este mock pela chamada para a Google Sheets API.
    return Promise.resolve({
      ok: true,
      payload
    });
  };

  fields.forEach((field) => {
    field.addEventListener("input", () => {
      updateState();
      setFieldValidity(field, Boolean(field.value.trim()));

      if (field.type === "email" && field.value.trim()) {
        setFieldValidity(field, isValidEmail(field.value.trim()));
      }
    });
  });

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      ...formState,
      submittedAt: new Date().toISOString(),
      source: "site-contact-section"
    };

    const submitButton = contactForm.querySelector(".contact-form__submit");

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "ENVIANDO";
    }

    try {
      await submitContactForm(payload);
      contactForm.reset();
      updateState();
      fields.forEach((field) => setFieldValidity(field, true));
      setFeedback("Mensagem preparada para envio com sucesso.", "success");
    } catch (error) {
      setFeedback("Não foi possível enviar agora. Tente novamente em instantes.", "error");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "ENVIAR";
      }
    }
  });
})();

(() => {
  const popupButton = document.querySelector("#calendly-popup-button");
  const schedule = document.querySelector("#calendly-schedule");
  const calendlyElement = popupButton || schedule;

  if (!calendlyElement) {
    return;
  }

  const calendlyUrl = calendlyElement.dataset.calendlyUrl || "";
  const isPlaceholderUrl = calendlyUrl.includes("seu-usuario");

  if (!calendlyUrl || isPlaceholderUrl) {
    calendlyElement.classList.add("is-missing-url");
    return;
  }

  const waitForCalendly = (callback) => {
    if (!window.Calendly) {
      window.setTimeout(() => waitForCalendly(callback), 120);
      return;
    }

    callback();
  };

  if (popupButton) {
    popupButton.addEventListener("click", () => {
      waitForCalendly(() => {
        window.Calendly.initPopupWidget({ url: calendlyUrl });
      });
    });

    return;
  }

  const initCalendly = () => {
    if (!window.Calendly || typeof window.Calendly.initInlineWidget !== "function") {
      window.setTimeout(initCalendly, 120);
      return;
    }

    schedule.innerHTML = "";
    schedule.classList.add("is-loaded");

    window.Calendly.initInlineWidget({
      url: calendlyUrl,
      parentElement: schedule,
      resize: false
    });
  };

  initCalendly();
})();

(() => {
  const faqSection = document.querySelector(".faq-section");

  if (!faqSection) {
    return;
  }

  const faqItems = Array.from(faqSection.querySelectorAll(".faq-item"));

  const closeItem = (item) => {
    const button = item.querySelector(".faq-item__button");

    item.classList.remove("is-open");

    if (button) {
      button.setAttribute("aria-expanded", "false");
    }
  };

  const openItem = (item) => {
    const button = item.querySelector(".faq-item__button");

    faqItems.forEach((currentItem) => {
      if (currentItem !== item) {
        closeItem(currentItem);
      }
    });

    item.classList.add("is-open");

    if (button) {
      button.setAttribute("aria-expanded", "true");
    }
  };

  faqItems.forEach((item) => {
    const questionRow = item.querySelector(".faq-item__question-row");
    const button = item.querySelector(".faq-item__button");

    if (!questionRow || !button) {
      return;
    }

    questionRow.addEventListener("click", () => {
      if (item.classList.contains("is-open")) {
        closeItem(item);
        return;
      }

      openItem(item);
    });
  });
})();
