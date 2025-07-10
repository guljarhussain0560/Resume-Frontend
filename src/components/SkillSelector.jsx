import { useState } from "react";

// Step 1: Define all raw skills (duplicates allowed here)
const RAW_SKILLS = [
// --- Technical / Programming ---
"HTML", "CSS", "JavaScript", "TypeScript", "React", "Vue", "Angular", "Next.js", "Nuxt.js", "Svelte", "SolidJS", "Tailwind CSS", "Bootstrap", "Bulma", "Material-UI", "Chakra UI",
"Node.js", "Express", "Django", "Flask", "FastAPI", "Spring Boot", "Laravel", "Ruby on Rails", "ASP.NET Core", "Phoenix (Elixir)",
"Python", "Java", "C", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin", "Scala", "Perl", "Elixir", "Haskell", "Julia", "Dart",
"MySQL", "PostgreSQL", "MongoDB", "SQLite", "Oracle", "Redis", "Firebase", "Cassandra", "Elasticsearch", "CockroachDB", "DynamoDB", "InfluxDB", "Neo4j", "Supabase",
"Docker", "Kubernetes", "Jenkins", "GitHub Actions", "Travis CI", "CircleCI", "GitLab CI", "ArgoCD", "Ansible", "Terraform", "Packer", "Vagrant",
"AWS", "Azure", "Google Cloud", "Heroku", "Netlify", "Vercel", "Cloudflare", "DigitalOcean", "Render", "Linode",
"Linux", "Ubuntu", "Nginx", "Apache", "Caddy", "Bash", "Zsh", "Fish", "PowerShell", "tmux", "Vim", "Emacs", "VS Code",
"GraphQL", "REST APIs", "WebSockets", "OAuth", "OpenAPI", "gRPC", "JSON:API", "tRPC", "Redux", "Zustand", "Recoil", "RxJS", "MobX",
"Webpack", "Rollup", "Vite", "Parcel", "Babel", "ESLint", "Prettier", "SASS", "LESS", "SCSS", "PostCSS", "Tailwind CLI",
"CI/CD", "Unit Testing", "Integration Testing", "TDD", "BDD", "Jest", "Mocha", "Chai", "Vitest", "Testing Library", "Cypress", "Playwright", "Selenium",
"Postman", "Insomnia", "Swagger", "Figma", "Adobe XD", "Sketch", "Zeplin", "InVision", "Framer", "Storybook", "Lottie",


  // --- Data / AI / Research ---
  "Data Analysis", "Data Cleaning", "Exploratory Data Analysis", "Data Visualization",
  "Pandas", "NumPy", "SciPy", "Matplotlib", "Seaborn", "Plotly", "Tableau", "Power BI",
  "Machine Learning", "Deep Learning", "Scikit-learn", "TensorFlow", "Keras", "PyTorch", "OpenCV",
  "Hadoop", "Apache Spark", "Kafka", "Hive", "Pig",
  "R", "MATLAB", "Stata", "SPSS", "SAS", "SQL", "NoSQL",
  "Natural Language Processing", "Computer Vision", "Reinforcement Learning", "Model Deployment",
  "LaTeX", "Academic Writing", "Statistical Modeling", "Hypothesis Testing", "Survey Design", "Experimental Design",

  // --- Business / Management ---
  "Project Management", "Agile", "Scrum", "Kanban", "Lean", "Product Management",
  "Business Analysis", "Market Research", "Financial Modeling", "Budgeting", "Forecasting", "KPI Tracking",
  "OKRs", "Strategic Planning", "Risk Management", "Quality Assurance", "Six Sigma", "Operations Management",
  "HR Management", "Recruitment", "Employee Onboarding", "Payroll Management", "Conflict Resolution",
  "Leadership", "Team Building", "Stakeholder Management", "Change Management", "Decision Making",

  // --- Marketing / Communication ---
  "Digital Marketing", "SEO", "SEM", "Content Writing", "Copywriting", "Email Marketing",
  "Social Media Management", "Influencer Marketing", "Brand Management", "Google Ads", "Facebook Ads",
  "Analytics", "Google Analytics", "A/B Testing", "Conversion Optimization",
  "Public Relations", "Speech Writing", "Presentation Skills", "Public Speaking", "Storytelling", "Press Releases",

  // --- Soft Skills / Languages ---
  "Time Management", "Problem Solving", "Critical Thinking", "Adaptability", "Creativity", "Attention to Detail",
  "Teamwork", "Collaboration", "Empathy", "Emotional Intelligence", "Resilience", "Conflict Resolution",
  "Negotiation", "Persuasion", "Interpersonal Skills", "Cultural Awareness", "Decision Making", "Accountability",

  // --- Communication / Languages ---
  "English", "Spanish", "French", "German", "Mandarin", "Hindi", "Arabic", "Bengali", "Portuguese", "Russian", "Japanese",
  "Sign Language", "Transcription", "Translation", "Technical Writing", "Academic Writing", "Blogging",

  // --- Creative / Design / Media ---
  "Graphic Design", "UX Design", "UI Design", "Animation", "Motion Graphics", "Video Editing", "Sound Design",
  "Photography", "Illustration", "3D Modeling", "AutoCAD", "Blender", "Adobe Photoshop", "Adobe Illustrator", "Adobe Premiere Pro",

  // --- Education / Training ---
  "Instructional Design", "Curriculum Development", "E-learning", "Tutoring", "Training & Development", "Mentoring",
  "Workshop Facilitation", "Public Speaking", "Course Creation", "Assessment Design", "Learning Management Systems (LMS)",

  // --- Others / General ---
  "Customer Service", "Sales", "CRM", "Microsoft Excel", "Microsoft Word", "Google Workspace", "Notion", "Slack", "Trello",
  "Remote Collaboration", "Scheduling", "Bookkeeping", "Basic Accounting", "Legal Research", "Event Planning", "Travel Management"
];

// Step 2: Remove duplicates and sort
const ALL_SKILLS = Array.from(new Set(RAW_SKILLS)).sort((a, b) => a.localeCompare(b));

export default function SkillSelector({ selectedSkills, setSelectedSkills }) {
  const [search, setSearch] = useState("");

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
    setSearch(""); // clear input after selecting
  };

  const filteredSkills = ALL_SKILLS.filter(
    (skill) =>
      skill.toLowerCase().includes(search.toLowerCase()) &&
      !selectedSkills.includes(skill)
  );

  const removeSkill = (skill) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skill));
  };

  return (
    <div className="space-y-2">
      {/* Selected Skills as tags */}
      <div className="flex flex-wrap gap-2">
        {selectedSkills.map((skill) => (
          <span
            key={skill}
            className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
          >
            {skill}
            <button
              onClick={() => removeSkill(skill)}
              className="text-red-600 hover:text-red-800"
              title="Remove"
            >
              &times;
            </button>
          </span>
        ))}
      </div>

      {/* Search box */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search or type to add skill..."
        className="w-full p-2 border border-gray-300 rounded"
      />

      {/* Matching suggestions */}
      {search && filteredSkills.length > 0 && (
        <ul className="border rounded max-h-40 overflow-y-auto bg-white shadow mt-1">
          {filteredSkills.map((skill) => (
            <li
              key={skill}
              onClick={() => toggleSkill(skill)}
              className="p-2 cursor-pointer hover:bg-blue-100"
            >
              {skill}
            </li>
          ))}
        </ul>
      )}

      {/* Message when no match */}
      {search && filteredSkills.length === 0 && (
        <p className="text-sm text-gray-500">No matching skills found.</p>
      )}
    </div>
  );
}
