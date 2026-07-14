import type {
  EvaluationStep,
  GenerationStep,
  LevelOption,
  PreviewItem,
} from '../types/onboarding.types';

export const topicChips = [
  'MERN interviews',
  'System Design',
  'IELTS',
  'UPSC',
  'German',
  'Data Structures',
  'Machine Learning',
  'SQL & Databases',
];

export const goalChips = [
  'Crack top companies',
  'Get first job',
  'Switch career',
  'Build fundamentals',
  'Ace competitive exam',
  'Freelance & remote work',
];

export const roadmapPreviewMap: Record<string, PreviewItem[]> = {
  default: [
    ['Foundations', 'Core concepts and fundamentals assessment'],
    ['Structured Practice', 'Curated problem sets and challenges'],
    ['Personalized Roadmap', 'A learning path shaped around your goal'],
  ],

  MERN: [
    ['JavaScript & Node.js', 'Core language fundamentals and backend building blocks'],
    ['React & UI Systems', 'Components, hooks, state management, and frontend structure'],
    ['MongoDB & APIs', 'Database modeling, Express APIs, and authentication patterns'],
  ],

  'System Design': [
    ['Scalability Fundamentals', 'Caching, load balancing, queues, and CDNs'],
    ['Database Architecture', 'SQL vs NoSQL, sharding, indexing, and replication'],
    ['Design Case Studies', 'Break down real systems like Netflix, Uber, and Twitter'],
  ],

  IELTS: [
    ['Reading & Listening', 'Comprehension strategies and speed improvement'],
    ['Writing Task 1 & 2', 'Structure, vocabulary, and high-band response patterns'],
    ['Speaking Practice', 'Fluency, confidence, and examiner-style preparation'],
  ],

  UPSC: [
    ['Foundation Subjects', 'History, polity, geography, economics, and governance'],
    ['Current Affairs Engine', 'Daily issue mapping and editorial analysis'],
    ['Answer Writing', 'Mains structure, ethics practice, and revision cycles'],
  ],

  German: [
    ['Grammar Foundation', 'Cases, verbs, genders, and sentence structure'],
    ['Vocabulary Growth', 'Core words, phrases, and everyday communication'],
    ['Fluency Practice', 'Listening, speaking, and real-life conversation training'],
  ],

  'Data Structures': [
    ['Linear Structures', 'Arrays, strings, linked lists, stacks, and queues'],
    ['Trees & Graphs', 'Traversal, recursion, shortest paths, and core patterns'],
    ['Interview Patterns', 'Sliding window, DP, backtracking, and problem solving'],
  ],

  'Machine Learning': [
    ['Math Foundations', 'Statistics, linear algebra, and probability essentials'],
    ['Core Algorithms', 'Regression, classification, clustering, and model evaluation'],
    ['Project Roadmap', 'Datasets, pipelines, experimentation, and deployment'],
  ],

  SQL: [
    ['Database Fundamentals', 'Tables, relationships, normalization, and schema thinking'],
    ['Query Mastery', 'Joins, subqueries, grouping, and window functions'],
    ['Performance Skills', 'Indexes, query tuning, and real-world database design'],
  ],
};

export const levelOptions: LevelOption[] = [
  {
    value: 'beginner',
    badge: 'Beginner',
    title: 'New to this field',
    description:
      'I need a roadmap that starts from the basics and builds a solid foundation before moving to complex concepts.',
  },
  {
    value: 'intermediate',
    badge: 'Intermediate',
    title: 'Expanding Horizons',
    description:
      'I know the basics and want to move toward stronger concepts, applied problem solving, and interview depth.',
  },
  {
    value: 'advanced',
    badge: 'Advanced',
    title: 'High-level Mastery',
    description:
      'I already have strong knowledge and want advanced refinement, deeper edge cases, and high-level mastery.',
  },
];

export const generationSteps: GenerationStep[] = [
  {
    label: 'Analysing goal',
    activeLabel: 'Analysing goal…',
  },
  {
    label: 'Mapping topics',
    activeLabel: 'Mapping topics…',
  },
  {
    label: 'Structuring roadmap',
    activeLabel: 'Structuring roadmap…',
  },
  {
    label: 'Adding resources',
    activeLabel: 'Adding resources…',
  },
  {
    label: 'Finalising',
    activeLabel: 'Finalising…',
  },
];

export const evaluationSteps: EvaluationStep[] = [
  {
    label: 'Checking completeness',
    activeLabel: 'Checking completeness…',
  },
  {
    label: 'Measuring learning depth',
    activeLabel: 'Measuring learning depth…',
  },
  {
    label: 'Assessing interview-readiness',
    activeLabel: 'Assessing interview-readiness…',
  },
  {
    label: 'Identifying gaps & strengths',
    activeLabel: 'Identifying gaps & strengths…',
  },
  {
    label: 'Compiling score',
    activeLabel: 'Compiling score…',
  },
];
