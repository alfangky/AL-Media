class AIChat {
  constructor() {
    this.messages = [];
    this.initializeElements();
    this.bindEvents();
    this.commonResponses = {
      greeting: [
        "Hello! How can I help you today?",
        "Hi there! What can I do for you?",
        "Greetings! How may I assist you?",
      ],
      farewell: [
        "Goodbye! Have a great day!",
        "See you later! Take care!",
        "Farewell! Feel free to return if you need more help!",
      ],
      unknown: [
        "I'm not sure I understand. Could you please rephrase that?",
        "I'm still learning. Could you try asking in a different way?",
        "I'm not quite sure about that. Could you provide more details?",
      ],
    };

    // Enhanced knowledge base
    this.universalKnowledge = {
      // Science
      "what is gravity":
        "Gravity is a fundamental force of nature that attracts objects with mass towards each other. It's what keeps planets in orbit and makes objects fall to Earth.",
      "what is energy":
        "Energy is the ability to do work. It exists in many forms like kinetic (motion), potential (stored), thermal (heat), electrical, and chemical energy.",
      "what is matter":
        "Matter is anything that has mass and takes up space. It exists in three main states: solid, liquid, and gas.",

      // Technology
      "how does internet work":
        "The Internet is a global network of computers connected through cables and wireless signals, using protocols like TCP/IP to communicate and share data.",
      "what is ai":
        "Artificial Intelligence (AI) is technology that enables computers to simulate human intelligence through learning, reasoning, and problem-solving.",

      // Space
      "what is a black hole":
        "A black hole is a region in space where gravity is so strong that nothing, not even light, can escape from it once it passes the event horizon.",
      "what is the solar system":
        "The Solar System consists of the Sun and celestial objects bound to it by gravity: planets, dwarf planets, moons, asteroids, comets, and more.",

      // History
      "who was albert einstein":
        "Albert Einstein (1879-1955) was a theoretical physicist who developed the theory of relativity. He's famous for the equation E=mc².",
      "what is world war 2":
        "World War II (1939-1945) was a global conflict involving most nations. It was fought between the Allies and Axis powers.",

      // Philosophy
      "meaning of life":
        "The meaning of life is a philosophical and spiritual question that has been debated throughout history. Different cultures and individuals have various perspectives on this profound question.",

      // General Knowledge
      "how does photosynthesis work":
        "Photosynthesis is the process where plants convert sunlight, water, and carbon dioxide into glucose and oxygen, providing energy for the plant.",
      "what is climate change":
        "Climate change refers to long-term shifts in global weather patterns and temperatures, largely caused by human activities like burning fossil fuels.",
    };
  }

  initializeElements() {
    this.chatMessages = document.querySelector(".chat-messages");
    this.inputArea = document.querySelector("textarea");
    this.sendButton = document.querySelector(".send-btn");
    this.voiceButton = document.querySelector(".voice-btn");
    this.thinkingIndicator = document.querySelector(".thinking-indicator");
    this.exampleQueries = document.querySelector(".example-queries");
    this.contextMenu = document.querySelector(".context-menu");
  }

  bindEvents() {
    this.sendButton?.addEventListener("click", () => this.handleUserInput());
    this.inputArea?.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.handleUserInput();
      }
    });

    this.exampleQueries?.addEventListener("click", (e) => {
      if (e.target.classList.contains("query-btn")) {
        this.handleExampleQuery(e.target.textContent);
      }
    });

    document.addEventListener("contextmenu", (e) => {
      const messageContent = e.target.closest(".message-content");
      if (messageContent) {
        e.preventDefault();
        this.showContextMenu(e, messageContent);
      }
    });

    document.addEventListener("click", () => {
      this.contextMenu?.classList.remove("visible");
    });
  }

  async handleUserInput() {
    const userInput = this.inputArea.value.trim();
    if (!userInput) return;

    const timestamp = new Date().toLocaleTimeString();
    this.addMessage("user", userInput, timestamp);
    this.inputArea.value = "";

    this.showThinking(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response = await this.processUserInput(userInput);
    this.showThinking(false);
    this.addMessage("ai", response, timestamp);
  }

  async processUserInput(input) {
    const lowerInput = input.toLowerCase();

    // Check for universal knowledge questions first
    const universalResponse = this.checkUniversalKnowledge(lowerInput);
    if (universalResponse) {
      return universalResponse;
    }

    // Check for translation request
    if (lowerInput.includes("translate")) {
      return this.handleTranslation(input);
    }

    // Check for math expressions
    if (this.containsMathExpression(input)) {
      return this.handleMathProblem(input);
    }

    // Check for time questions
    if (this.isTimeQuestion(lowerInput)) {
      return this.handleTimeQuestion();
    }

    // Handle basic questions
    return this.generateResponse(input);
  }

  checkUniversalKnowledge(input) {
    // Check exact matches first
    if (this.universalKnowledge[input]) {
      return this.universalKnowledge[input];
    }

    // Check partial matches
    for (const [question, answer] of Object.entries(this.universalKnowledge)) {
      if (input.includes(question)) {
        return answer;
      }
    }

    return null;
  }

  containsMathExpression(input) {
    // Enhanced math detection
    const mathPatterns = [
      /[\d+\-*/()^√π]/, // Basic operators and numbers
      /\b(plus|minus|times|divided by)\b/i, // Word operators
      /\b(solve|calculate|compute|evaluate|what is)\b.*\d/i, // Math commands with numbers
      /\b\d+\s*(\+|\-|\*|\/|\^)\s*\d+\b/, // Number operator number pattern
    ];

    return mathPatterns.some((pattern) => pattern.test(input));
  }

  handleMathProblem(input) {
    try {
      // Convert word operators to symbols
      input = input
        .toLowerCase()
        .replace(/plus/g, "+")
        .replace(/minus/g, "-")
        .replace(/times/g, "*")
        .replace(/divided by/g, "/");

      // Extract numbers and operators
      const mathExpression = input.match(/[\d+\-*/().^\s]+/g)?.join("") || "";

      if (!mathExpression) {
        throw new Error("No valid math expression found");
      }

      const result = this.evaluateMathExpression(mathExpression);
      return `The result is: ${result}`;
    } catch (error) {
      return "I'm sorry, I couldn't process that mathematical expression. Please try using simple operators (+, -, *, /) and numbers.";
    }
  }

  evaluateMathExpression(expression) {
    try {
      if (expression.includes("function") || expression.includes("eval")) {
        throw new Error("Invalid expression");
      }
      return Function(`"use strict"; return (${expression})`)();
    } catch (error) {
      throw new Error("Invalid mathematical expression");
    }
  }

  handleTranslation(input) {
    const regex = /translate\s+"([^"]+)"\s+(?:from\s+(\w+)\s+)?to\s+(\w+)/i;
    const match = input.match(regex);

    if (!match) {
      return 'Please format your translation request like this: Translate "hello" to Spanish';
    }

    const [, text, , targetLang] = match;
    const cleanText = text.toLowerCase().trim();

    if (
      translationDatabase[cleanText] &&
      translationDatabase[cleanText][targetLang]
    ) {
      return `Translation: "${translationDatabase[cleanText][targetLang]}"`;
    }

    return `I'm sorry, I don't have the translation for "${text}" to ${targetLang}. I only know basic words and phrases at the moment.`;
  }

  isTimeQuestion(input) {
    return (
      input.includes("time") ||
      input.includes("what hour") ||
      input.includes("current time")
    );
  }

  handleTimeQuestion() {
    return `The current time is ${new Date().toLocaleTimeString()}`;
  }

  generateResponse(input) {
    const lowerInput = input.toLowerCase();

    // Check for greetings
    if (lowerInput.match(/\b(hi|hello|hey|greetings)\b/)) {
      return this.getRandomResponse("greeting");
    }

    // Check for farewells
    if (lowerInput.match(/\b(goodbye|bye|see you|farewell)\b/)) {
      return this.getRandomResponse("farewell");
    }

    // Default response
    return this.getRandomResponse("unknown");
  }

  getRandomResponse(type) {
    const responses = this.commonResponses[type];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  addMessage(type, content, timestamp) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${type}-message`;

    const contentDiv = document.createElement("div");
    contentDiv.className = "message-content";
    contentDiv.textContent = content;

    const timestampDiv = document.createElement("div");
    timestampDiv.className = "message-timestamp";
    timestampDiv.textContent = timestamp;

    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(timestampDiv);
    this.chatMessages.appendChild(messageDiv);

    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  showThinking(show) {
    if (show) {
      this.thinkingIndicator?.classList.remove("hidden");
    } else {
      this.thinkingIndicator?.classList.add("hidden");
    }
  }

  showContextMenu(event, messageElement) {
    const { clientX, clientY } = event;
    const menu = this.contextMenu;
    if (!menu) return;

    menu.style.left = `${clientX}px`;
    menu.style.top = `${clientY}px`;
    menu.classList.add("visible");
    menu.dataset.messageContent = messageElement.textContent;
  }

  handleExampleQuery(query) {
    if (this.inputArea) {
      this.inputArea.value = query;
      this.handleUserInput();
    }
  }
}

// Initialize the chat application
document.addEventListener("DOMContentLoaded", () => {
  window.aiChat = new AIChat();
});
document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.querySelector(".hamburger");
  const mobileMenu = document.querySelector(".mobile-menu");
  const navItems = document.querySelectorAll(".nav-item");

  // Toggle mobile menu
  hamburger.addEventListener("click", function () {
    mobileMenu.classList.toggle("active");
    const isExpanded = mobileMenu.classList.contains("active");
    hamburger.setAttribute("aria-expanded", isExpanded);
  });

  // Handle active state for nav items
  navItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      // Remove active class from all items
      navItems.forEach((navItem) => navItem.classList.remove("active"));
      // Add active class to clicked item
      this.classList.add("active");
    });
  });

  // Close mobile menu when clicking outside
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".mobile-menu") && !e.target.closest(".hamburger")) {
      mobileMenu.classList.remove("active");
      hamburger.setAttribute("aria-expanded", "false");
    }
  });

  // Handle keyboard navigation
  navItems.forEach((item) => {
    item.addEventListener("keydown", function (e) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        this.click();
      }
    });
  });
});
