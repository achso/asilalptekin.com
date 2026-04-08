export interface CaseStudySection {
  title: string;
  content: string | string[];
}

export interface ProjectContent {
  problem: string;
  solution: string;
  impact: string;
}

export interface ProjectData {
  id: string;
  slug: string;
  title: string;
  description: string;
  statusBadge?: string;
  role: string;
  year: string;
  company?: string;
  type?: string;
  platform?: string;
  imageColor: string;
  imageSrc?: string;
  content: ProjectContent;
  overview?: string;
  sections?: CaseStudySection[];
  technicalNarrative?: {
    challenge: string;
    makerSolution: {
      intro: string;
      points: { title: string; description: string }[];
    };
    impact: string;
    accessibilityNote?: string;
    makerNotes?: { title: string; text: string }[];
  };
}

export const projects: ProjectData[] = [
  {
    id: "1",
    slug: "craftapp",
    title: "CraftApp",
    description: "A conversational mobile app for solar installation workers that took first-time-correct rates from 65% to 95%.",
    statusBadge: "Shipped & Highly Adopted",
    role: "UX/UI Designer",
    company: "Enpal",
    type: "Case study",
    year: "2022",
    platform: "Android",
    imageColor: "#e5e7eb",
    imageSrc: "/craftapp/banner-craftapp.png",
    content: {
      problem: "Technicians needed a way to document complex installations quickly without losing focus on the physical task.",
      solution: "Noodled on a simplified UI optimized for one-handed, on-the-go usage. Leveraged user research to identify and eliminate friction in the documentation flow.",
      impact: "Shipped a tool that directly boosted field team productivity and significantly reduced time-to-completion for installations.",
    },
    overview: "Picture a technician balancing on a pitched roof. In one hand, they’re juggling a smartphone; in the other, a crumpled paper checklist. They are squinting through midday sun glare at a blurry WhatsApp photo, waiting for a Quality Assurance manager sitting 100 miles away to manually approve their work through a clunky third-party software. This disconnected chaos was the \"before\" state of our field operations.\n\nTo fix it, I designed the CraftApp ecosystem: a single-handed Android co-pilot for the technicians, paired with a real-time Web App for the back-office QA team. By bridging the gap between the roof and the office, we took our First Time Correct (FTC) rate from a bottlenecked 65% to a highly scalable 95%.",
    sections: [
      {
        title: "Context & Role",
        content: [
          "During the peak of the energy crisis, Enpal was in hypergrowth, rapidly scaling its mission to democratize renewable energy. However, surging installation volumes put massive pressure on our CraftOS fulfillment domain.",
          "**My Role:** I was the founding product designer for the CraftApp ecosystem. I owned the end-to-end design lifecycle for both the native mobile app (field) and the companion web dashboard (back office).",
          "**The Team:** I collaborated closely with 3–4 Product Managers, over 20 Engineers, and our Data Team."
        ]
      },
      {
        title: "The Broken Experience",
        content: [
          "Before CraftApp, the communication loop between the field and the office was fundamentally broken.",
          "The technicians in the field relied on localized Airtable templates, paper checklists, and unstructured WhatsApp chats. Meanwhile, the back-office QA managers were trapped using Praxedo, a legacy Field Service Management tool. Praxedo was rigid, required heavy manual data entry, and couldn't process the real-time, high-fidelity visual documentation we needed for bank compliance.",
          "Because the field and the office were speaking different digital languages, our First Time Correct rate sat at just 65%. Every failed review stalled our revenue pipeline and forced technicians into unpaid, two-hour drives back to sites just to retake a single photo."
        ]
      },
      {
        title: "Research That Reframed the Problem",
        content: [
          "To understand the friction on both sides of the platform, my research converged across three streams:",
          "**Field Ride-Alongs (Contextual Inquiry):** Watching teams on-site revealed intense \"environmental friction.\" Technicians were balancing on scaffolding, losing cell connection in pitch-black basements, and navigating complex technical specs across a multinational workforce.",
          "**Back-Office Shadowing:** I sat with the QA managers wrestling with Praxedo. They were drowning in batch reviews, constantly switching tabs between WhatsApp photos and Praxedo forms, trying to make sense of undocumented exceptions.",
          "**Quantitative Analysis:** Data showed our 65% FTC failures were heavily clustered around \"destructive steps\"—specifically, early electrical configurations.",
          "**The Reframing & Our Design Vision:** Initially, our instinct was to solve this by mirroring the professional task-management tools we used internally, like Jira. However, I quickly realized that while Jira is great for desk-bound engineers, its dense, ticket-based structure is far too technical for a monteur balancing on a roof. I noticed the tool they relied on most organically was WhatsApp.",
          "This sparked our guiding vision: we needed to leverage the mental model of instant messaging and document sharing. The app shouldn't feel like filling out a complex database form; it needed to feel as frictionless as sending a photo to a colleague and getting an instant reply."
        ]
      },
      {
        title: "Constraints as Design Strategy",
        content: [
          "When designing for operations, edge cases are the use cases.",
          "**The One-Handed Rule (Mobile):** Because technicians work on scaffolding, every primary action on the app had to be reachable by a thumb.",
          "**The Sunlight/Darkness Paradox (Mobile):** High contrast UI for rooftop glare, paired with offline-first architecture for basement \"blackout zones.\"",
          "**Cognitive Load (Web):** The QA web dashboard had to allow managers to review hundreds of photos an hour without visual fatigue.",
          "**Visual-First Language:** Our workforce consisted heavily of Polish and Syrian technicians; relying on dense German or English text was a guaranteed failure point."
        ]
      },
      {
        title: "Key Design Decisions",
        content: [
          "**Decision 1: The “Traffic Light” Live Approval System**\n*The Problem:* Batch reviews in Praxedo meant technicians didn't know they made a mistake until days later.\n*The Decision:* Leaning into our \"instant messaging\" vision, I replaced the batch model with a real-time, step-by-step approval loop. Technicians saw a live Traffic Light (Green/Yellow/Red) on their mobile app, while the QA manager controlled the light from the new custom Web Dashboard.\n*The Rationale:* This provided immediate psychological safety for the field. Just like seeing \"read receipts\" in a chat app, if the app showed a green light, the technician knew they could pack up and get paid. For the office, it turned a backlog of paperwork into a smooth, continuous flow of single-task approvals.",
          "**Decision 2: Visual-First Reference Patterns (“Ghost UI”)**\n*The Problem:* Long-form text instructions failed instantly in extreme weather and across language barriers.\n*The Decision:* I swapped text for high-fidelity reference photos and overlaid a \"Ghost-UI\" directly into the technician's mobile camera view.\n*The Rationale:* A visual of a correctly mounted bracket is a universal language. The ghost overlay served as an alignment guide, drastically lowering cognitive load and making quality self-evident before the photo was even sent to the back office.",
          "**Decision 3: Destructive Step Logic (Smart Defaults)**\n*The Problem:* Errors in early-stage electrical settings instantly voided bank validations, rendering the installation worthless.\n*The Decision:* I hard-coded these high-risk \"destructive\" steps with system-locked defaults. To deviate, a technician had to explicitly trigger an \"Exception\" flag, which instantly alerted the back-office web dashboard for a mandatory override review.\n*The Rationale:* We made the right answer the default. This preserved the technician's agency on the ground while protecting the company against its most expensive errors."
        ]
      },
      {
        title: "Impact & Results",
        content: [
          "Replacing Praxedo and Airtable with our custom two-sided ecosystem triggered compounding operational savings:",
          "**The Core Metric:** We improved the First Time Correct rate from 65% to 95%. For every 100 installations, 30 crews no longer had to waste time on rework trips.",
          "**Operational Efficiency:** Approval turnaround times shrank from days to minutes. QA managers processed approvals 3x faster in the custom web app than they did in Praxedo.",
          "**Human Impact:** Job stress plummeted. Technicians trusted the \"digital safety net,\" and their commission-based take-home pay increased directly due to the reduction in rework.",
          "**Scalability:** By automating routine approvals via smart defaults, we scaled our installation volume by over 40% without needing to proportionally scale the QA team."
        ]
      },
      {
        title: "Reflection: Designing the AI Co-Pilot",
        content: "Building a two-sided platform that achieved a 95% FTC rate was a massive win, but looking forward, I see the path to eliminating that final 5%.\n\nIf I were to evolve this ecosystem today, I would focus on turning the web platform into an AI-assisted hub. I would implement Predictive Caching on the mobile side, using algorithmic route data to pre-download assets before a technician enters a dead zone. More importantly, I would integrate On-Device Computer Vision to act as a \"first pass\" for the QA team. By having the AI instantly flag a missing screw or loose cable the moment the shutter clicks, we could reserve the human back-office QA team solely for complex exception handling—making the remaining margin of error structurally impossible to fail."
      }
    ],
    technicalNarrative: {
      challenge: "Field technicians (Monteurs) were struggling with a documentation process that felt like an administrative hurdle rather than a tool. The existing workflow was fragmented, requiring high cognitive load while performing physical installations in demanding environments. I needed to design an interface that was \"invisible\"—allowing for high-frequency usage without distracting from the task at hand.",
      makerSolution: {
        intro: "I noodled on a mobile-first UI optimized for one-handed, on-the-go interactions. I leveraged field observations and user research to identify the exact moments where documentation stalled.",
        points: [
          {
            title: "Simplified Documentation",
            description: "Streamlined complex installation steps into a linear, high-contrast task flow to reduce cognitive load."
          },
          {
            title: "System Logic",
            description: "Leveraged the CraftOS design system to ensure mobile-to-web consistency, saving engineering bandwidth during the 0-1 build."
          },
          {
            title: "Performance",
            description: "Optimized tap targets and input methods for technicians wearing gloves or working in low-light conditions."
          }
        ]
      },
      impact: "The application saw immediate high adoption across field teams. By removing the administrative friction, we directly boosted field productivity and significantly reduced the average time-to-completion for renewable energy installations.",
      accessibilityNote: "High-contrast UI and large tap targets were prioritized to ensure usability for technicians working outdoors in direct sunlight or wearing protective gloves.",
      makerNotes: [
        { title: "Technical Collaboration", text: "Leveraging Web Development background to coordinate with engineers on camera API constraints." },
        { title: "System Stewardship", text: "Tokenizing the Ant Design library to ensure mobile-to-web consistency across the CraftOS ecosystem." }
      ]
    }
  },
  {
    id: "2",
    slug: "route-planner",
    title: "Route Planner",
    description: "Coming Soon",
    role: "UX/UI Designer",
    company: "Enpal",
    type: "Case study",
    year: "2024",
    imageColor: "#252525",
    content: {
      problem: "",
      solution: "",
      impact: "",
    },
  },
];

