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
