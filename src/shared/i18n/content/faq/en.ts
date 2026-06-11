import type { FaqCategory, FaqItem } from "./be";

export const faqCategoriesEn: Record<FaqCategory, string> = {
  general: "General",
  account: "Account",
  features: "Features",
  content: "Content",
};

export const faqItemsEn: FaqItem[] = [
  {
    category: "general",
    question: "What is Poetry?",
    answer:
      "Poetry is an online platform for reading and enjoying poetry. We have collected a wide range of poems by classic and modern authors so you can discover new works and revisit favorites.",
  },
  {
    category: "general",
    question: "How do I use the site?",
    answer:
      "It's simple! On the home page you'll find poem categories. Choose a category, then a collection, and open any poem. You can also use search and filters to find works quickly.",
  },
  {
    category: "general",
    question: "Is the site free?",
    answer:
      "Yes, Poetry is completely free! You can read all poems without limits or subscriptions.",
  },
  {
    category: "account",
    question: "Why do I need to register?",
    answer:
      "Registration lets you save poems to favorites, leave comments, and get personal recommendations. Without an account you can still read all poems, but without extra features.",
  },
  {
    category: "account",
    question: "How do I change profile details?",
    answer:
      'After signing in, click your name in the top right and choose "Profile settings". There you can change your name, email, and password.',
  },
  {
    category: "account",
    question: "I forgot my password — what should I do?",
    answer:
      "Use the password recovery option on the sign-in page. If you still have trouble, contact us through the feedback form.",
  },
  {
    category: "features",
    question: 'What is "Favorites"?',
    answer:
      'Favorites is your personal collection of poems you liked. Click the heart icon on a poem page to add it. All saved poems are available under "Favorites" in the profile menu.',
  },
  {
    category: "features",
    question: "How do comments work?",
    answer:
      "Each poem has a comments section. Click the comment icon to read the discussion or add your review. You need to be signed in to comment.",
  },
  {
    category: "features",
    question: "What are the background videos on poems?",
    answer:
      "Some poems include atmospheric videos that set the mood and help you immerse yourself in the work. You can pause the video or mute the sound.",
  },
  {
    category: "content",
    question: "How do you choose poems?",
    answer:
      "Our team carefully selects works based on literary value, popularity, and relevance. We aim to represent diverse poetic directions and eras.",
  },
  {
    category: "content",
    question: "Can I suggest a poem?",
    answer:
      "Yes! We welcome suggestions. Contact us through the feedback form with the title and author. We'll review your request.",
  },
];
