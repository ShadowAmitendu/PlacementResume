import { ResumeData } from '../types/resume';
import { DEFAULT_RESUME_DATA } from './themes';

export interface ResumeTemplateOption {
  id: string;
  name: string;
  badge: string;
  description: string;
  buildData: () => ResumeData;
}

export const RESUME_TEMPLATES: ResumeTemplateOption[] = [
  {
    id: 'placement-standard',
    name: 'Campus Placement Standard (1-Page)',
    badge: 'Classic',
    description: 'Traditional placement format with academics table, skills, projects table, profile, and declaration.',
    buildData: () => JSON.parse(JSON.stringify(DEFAULT_RESUME_DATA)),
  },
  {
    id: 'software-tech',
    name: 'Software / Tech Projects-First',
    badge: 'SDE / Tech',
    description: 'Clean single-page developer layout featuring structured Experience/Projects blocks and a Technical Skills Grid.',
    buildData: () => ({
      version: 4,
      meta: {
        theme: 'navy',
        font: "'Inter', sans-serif",
        tableStyle: 'latex',
        marker: '▸ ',
        showDeclaration: false,
        showLinkIcons: true,
        photo: null,
        showPhoto: false,
        zoom: 1,
        margin: 'compact',
        lineHeight: 'tight',
        fitSignatureToPage: true,
      },
      header: {
        fullName: 'Aarav Sharma',
        degreeTitle: 'B.Tech in Computer Science & Engineering',
        universityCompany: 'National Institute of Technology',
        location: 'Bengaluru, Karnataka, India',
        email: 'aarav.sharma@example.com',
        phone: '+91 98765 43210',
        links: [
          { id: 'tpl-gh', text: 'github.com/aaravsharma', url: 'https://github.com/aaravsharma', icon: 'github' },
          { id: 'tpl-li', text: 'linkedin.com/in/aarav', url: 'https://linkedin.com/in/aarav', icon: 'linkedin' },
          { id: 'tpl-pf', text: 'Portfolio', url: 'https://aarav.dev', icon: 'globe' },
        ],
      },
      sections: [
        {
          id: 'tpl-sde-edu',
          type: 'table',
          title: 'Education',
          headers: ['Degree', 'Institution', 'Year', 'CGPA / %'],
          rows: [
            ['B.Tech (CSE)', 'National Institute of Technology', '2022 – 2026', '8.94 / 10.0'],
            ['Class XII (CBSE)', 'Delhi Public School', '2022', '95.6%'],
          ],
          colWidths: [22, 42, 18, 18],
          showColBorders: false,
        },
        {
          id: 'tpl-sde-skills',
          type: 'keyvalue',
          title: 'Technical Skills',
          labelWidthPct: 24,
          pairs: [
            { id: 'kv-1', label: 'Languages', value: 'C++, TypeScript, Python, Java, SQL' },
            { id: 'kv-2', label: 'Frameworks', value: 'React, Next.js, Node.js, Express, Tailwind CSS, Spring Boot' },
            { id: 'kv-3', label: 'Databases & Cloud', value: 'PostgreSQL, Redis, MongoDB, Docker, AWS (EC2, S3)' },
            { id: 'kv-4', label: 'CS Fundamentals', value: 'Data Structures & Algorithms, DBMS, Operating Systems, Computer Networks' },
          ],
        },
        {
          id: 'tpl-sde-exp',
          type: 'entries',
          title: 'Experience',
          entries: [
            {
              id: 'ent-1',
              heading: 'Software Engineering Intern',
              subheading: 'CloudScale Technologies',
              dateRange: 'May 2025 – Jul 2025',
              location: 'Bengaluru, Remote',
              bullets: [
                'Engineered a Redis-backed query cache in Node.js, reducing p95 API latency by 42% across 180k daily requests.',
                'Built automated PostgreSQL migration checks and TypeScript API contracts in CI/CD pipelines, cutting staging rollbacks by 60%.',
              ],
            },
          ],
        },
        {
          id: 'tpl-sde-proj',
          type: 'entries',
          title: 'Key Projects',
          entries: [
            {
              id: 'ent-2',
              heading: 'Distributed Code Runner & Judge',
              subheading: 'Go, Docker, Redis Streams, React',
              dateRange: 'Jan 2025 – Apr 2025',
              location: 'GitHub',
              bullets: [
                'Architected isolated Docker execution sandboxes with cgroup CPU/memory limits processing 50+ concurrent submissions.',
                'Implemented WebSocket streaming status updates and automated test-case diff reporting in React.',
              ],
            },
            {
              id: 'ent-3',
              heading: 'Campus Placement Portal & Resume Engine',
              subheading: 'TypeScript, React, PDF.js, Fluent UI',
              dateRange: 'Aug 2024 – Nov 2024',
              location: 'Live Demo',
              bullets: [
                'Designed a client-side A4 typesetting engine with lossless PDF metadata embedding and drag-and-drop editing.',
              ],
            },
          ],
        },
        {
          id: 'tpl-sde-ach',
          type: 'list',
          title: 'Achievements & Coding Profiles',
          listType: 'bullet',
          items: [
            'Solved 550+ algorithmic problems on LeetCode (Knight, 1920+ rating) and Codeforces (Specialist).',
            'Finalist (Top 1%) among 4,000+ teams in Smart India Hackathon 2024.',
          ],
        },
      ],
      declaration: {
        text: 'I hereby declare that the information furnished above is true and accurate to the best of my knowledge.',
        place: 'Bengaluru',
        date: 'November 2026',
        signature: 'Aarav Sharma',
        signatureImage: null,
      },
    }),
  },
  {
    id: 'research-cv',
    name: 'Research / Academic CV',
    badge: 'Research',
    description: 'Scholarly Computer Modern serif layout tailored for MS/PhD applications, labs, publications, and grants.',
    buildData: () => ({
      version: 4,
      meta: {
        theme: 'classic',
        font: "'CMU Serif', 'Computer Modern Serif', serif",
        tableStyle: 'latex',
        marker: '● ',
        showDeclaration: true,
        showLinkIcons: false,
        photo: null,
        showPhoto: false,
        zoom: 1,
        margin: 'normal',
        lineHeight: 'normal',
        fitSignatureToPage: true,
      },
      header: {
        fullName: 'Meera Krishnan',
        degreeTitle: 'B.Tech Honours in Electrical & Computer Engineering',
        universityCompany: 'Indian Institute of Technology',
        location: 'Chennai, Tamil Nadu, India',
        email: 'meera.krishnan@example.edu',
        phone: '+91 98111 22334',
        links: [
          { id: 'res-gs', text: 'Google Scholar', url: 'https://scholar.google.com', icon: 'globe' },
          { id: 'res-gh', text: 'GitHub', url: 'https://github.com/meerak', icon: 'github' },
        ],
      },
      sections: [
        {
          id: 'res-interests',
          type: 'text',
          title: 'Research Interests:',
          content: 'Machine Learning Systems, Efficient Transformer Inference, Edge Hardware Co-Design, and Computer Vision.',
        },
        {
          id: 'res-edu',
          type: 'table',
          title: 'Academic Qualifications:',
          headers: ['Program', 'Institution', 'Duration', 'Performance'],
          rows: [
            ['B.Tech (Honours)', 'Indian Institute of Technology Madras', '2022 – 2026', 'CGPA: 9.35 / 10'],
            ['Senior Secondary (XII)', 'National Public School', '2022', '97.4%'],
          ],
          colWidths: [22, 38, 18, 22],
        },
        {
          id: 'res-exp',
          type: 'entries',
          title: 'Research Experience:',
          entries: [
            {
              id: 'res-e1',
              heading: 'Undergraduate Research Fellow',
              subheading: 'Vision & Learning Lab (Advisor: Prof. R. Nair)',
              dateRange: 'May 2024 – Present',
              location: 'Chennai',
              bullets: [
                'Developed 4-bit mixed-precision KV-cache quantization kernels in PyTorch & Triton, reducing GPU VRAM usage by 58% with <0.4% perplexity drop.',
                'Co-authored workshop manuscript submitted to ICML 2025 Efficient Systems Workshop.',
              ],
            },
          ],
        },
        {
          id: 'res-pub',
          type: 'list',
          title: 'Publications & Patents:',
          listType: 'numbered',
          items: [
            'M. Krishnan, R. Nair, "Adaptive Token Pruning for Edge Vision Transformers," Workshop Proceedings, 2025.',
          ],
        },
        {
          id: 'res-skills',
          type: 'keyvalue',
          title: 'Technical Stack & Coursework:',
          labelWidthPct: 26,
          pairs: [
            { id: 'rkv-1', label: 'Tools & Libraries', value: 'PyTorch, JAX, Triton, CUDA, NumPy, Weights & Biases' },
            { id: 'rkv-2', label: 'Graduate Courses', value: 'Deep Learning, Convex Optimization, Statistical Learning Theory, Computer Architecture' },
          ],
        },
      ],
      declaration: {
        text: 'I hereby affirm that all academic and research details listed above are authentic.',
        place: 'Chennai',
        date: 'November 2026',
        signature: 'Meera Krishnan',
        signatureImage: null,
      },
    }),
  },
  {
    id: 'internship-fresher',
    name: 'Internship / First-Year Fresher',
    badge: 'Fresher',
    description: 'Ideal for sophomores and pre-final year students emphasizing coursework, technical clubs, and coursework projects.',
    buildData: () => ({
      version: 4,
      meta: {
        theme: 'teal',
        font: "'Calibri', 'Segoe UI', sans-serif",
        tableStyle: 'word-clean',
        marker: '◆ ',
        showDeclaration: false,
        showLinkIcons: true,
        photo: null,
        showPhoto: false,
        zoom: 1,
        margin: 'normal',
        lineHeight: 'normal',
        fitSignatureToPage: true,
      },
      header: {
        fullName: 'Rohan Verma',
        degreeTitle: 'B.Tech Sophomore (Information Technology)',
        universityCompany: 'Vellore Institute of Technology',
        location: 'Pune, Maharashtra, India',
        email: 'rohan.verma@example.com',
        phone: '+91 97654 32109',
        links: [
          { id: 'fr-gh', text: 'GitHub', url: 'https://github.com/rohanv', icon: 'github' },
          { id: 'fr-li', text: 'LinkedIn', url: 'https://linkedin.com/in/rohanv', icon: 'linkedin' },
        ],
      },
      sections: [
        {
          id: 'fr-obj',
          type: 'text',
          title: 'Objective:',
          content: 'Enthusiastic Computer Science undergraduate seeking a Summer Software Development Internship to apply full-stack development and problem-solving skills.',
        },
        {
          id: 'fr-edu',
          type: 'table',
          title: 'Education:',
          headers: ['Qualification', 'School / University', 'Year', 'Score'],
          rows: [
            ['B.Tech in Information Technology', 'Vellore Institute of Technology', '2024 – 2028', '9.12 CGPA'],
            ['Class XII (HSC)', 'Fergusson Junior College', '2024', '93.2%'],
          ],
          colWidths: [28, 38, 16, 18],
        },
        {
          id: 'fr-proj',
          type: 'entries',
          title: 'Projects:',
          entries: [
            {
              id: 'fp-1',
              heading: 'Campus Mess Feedback & Analytics App',
              subheading: 'React, Firebase, Tailwind CSS',
              dateRange: 'Sep 2025 – Oct 2025',
              location: 'Campus Project',
              bullets: [
                'Built mobile-first QR survey app used by 600+ hostel students to rate daily meals and track food waste reduction.',
              ],
            },
            {
              id: 'fp-2',
              heading: 'Pathfinding Algorithm Visualizer',
              subheading: 'TypeScript, HTML5 Canvas',
              dateRange: 'Jun 2025',
              location: 'GitHub',
              bullets: [
                'Visualized Dijkstra, A*, BFS, and DFS on interactive weighted mazes with step-by-step speed controls.',
              ],
            },
          ],
        },
        {
          id: 'fr-skills',
          type: 'keyvalue',
          title: 'Skills & Coursework:',
          labelWidthPct: 26,
          pairs: [
            { id: 'fkv-1', label: 'Programming', value: 'Python, C++, JavaScript, HTML/CSS, SQL' },
            { id: 'fkv-2', label: 'Core Coursework', value: 'Object-Oriented Programming, Data Structures, Discrete Mathematics' },
          ],
        },
        {
          id: 'fr-pos',
          type: 'list',
          title: 'Positions of Responsibility & Extracurriculars:',
          listType: 'bullet',
          items: [
            'Core Committee Member, ACM Student Chapter — organized hands-on Git & Web Dev workshop for 250+ freshmen.',
            'Winner, Intra-College Ideathon 2025 among 45 participating teams.',
          ],
        },
      ],
      declaration: {
        text: 'I hereby declare that the above information is true to the best of my knowledge.',
        place: 'Pune',
        date: 'November 2026',
        signature: 'Rohan Verma',
        signatureImage: null,
      },
    }),
  },
];
