import {
  portfolio,
  personal,
  experience,
  education,
  featuredProject,
  L,
  type Lang,
} from './data/portfolio'

export type { Lang }

const project = featuredProject

function buildLang(lang: Lang) {
  const aboutPs = L(portfolio.about.paragraphs, lang)
  const isFa = lang === 'fa'

  return {
    nav: {
      home: isFa ? 'خانه' : 'Home',
      about: isFa ? 'درباره من' : 'About',
      projects: isFa ? 'پروژه‌ها' : 'Projects',
      skills: isFa ? 'مهارت‌ها' : 'Skills',
      experience: isFa ? 'سوابق' : 'Experience',
      contact: isFa ? 'ارتباط با من' : 'Contact',
      downloadCV: 'Resume & Portfolio',
    },
    langToggle: isFa
      ? { label: 'EN', ariaLabel: 'تغییر زبان به انگلیسی' }
      : { label: 'فارسی', ariaLabel: 'Switch language to Persian' },
    hero: {
      badge: personal.badge,
      greeting: L(portfolio.hero.greeting, lang),
      name: L(personal.nameDisplay, lang),
      title: personal.title,
      headline: personal.headline,
      bio: L(portfolio.hero.bio, lang),
      cta1: L(portfolio.hero.cta1, lang),
      cta2: L(portfolio.hero.cta2, lang),
    },
    about: {
      label: isFa ? 'درباره من' : 'About Me',
      h1: 'Full-Stack',
      h1accent: 'Developer',
      p1: aboutPs[0],
      p2: aboutPs[1],
      p3: aboutPs[2],
      infoFocus: personal.focusArea,
      infoFocusLabel: isFa ? 'حوزه تخصصی' : 'Focus Area',
      infoLoc: L(personal.location, lang),
      infoLocLabel: isFa ? 'موقعیت مکانی' : 'Location',
      infoEdu: education.academic.title,
      infoEduLabel: isFa ? 'تحصیلات' : 'Education',
      infoLang: L(personal.languages, lang),
      infoLangLabel: isFa ? 'زبان‌ها' : 'Languages',
      values: portfolio.about.values.map((v) => ({
        title: L(v.title, lang),
        desc: L(v.desc, lang),
      })),
    },
    projects: {
      label: isFa ? 'پروژه‌ها' : 'Projects',
      h1: isFa ? 'پروژه' : 'Featured',
      h1accent: isFa ? 'ویژه' : 'Project',
      sub: isFa
        ? 'یک اپلیکیشن فول‌استک واقعی برای استفاده عملیاتی.'
        : 'A real-world full-stack application built for operational use.',
      featured: 'Featured Project',
      number: project?.number ?? 'Project 01',
      shRole: project?.role ?? personal.title,
      shSubtitle: project?.subtitle ?? '',
      shDesc: project ? L(project.description, lang) : '',
      featuresLabel: isFa ? 'قابلیت‌های کلیدی' : 'Key Features',
      features: project?.features ?? [],
    },
    skills: {
      label: isFa ? 'مهارت‌ها' : 'Skills',
      h1: isFa ? 'مجموعه مهارت‌های' : 'Technical',
      h1accent: isFa ? 'فنی' : 'Skillset',
      sub: isFa
        ? 'فناوری‌های اصلی برای توسعه فول‌استک و اپلیکیشن‌های وب.'
        : 'Core technologies for full-stack and web application development.',
      cats: portfolio.skills.map((s) => L(s.label, lang)),
    },
    experience: {
      label: isFa ? 'سوابق و تحصیلات' : 'Experience & Education',
      h1: isFa ? 'مسیر' : 'My',
      h1accent: isFa ? 'من' : 'Journey',
      expTitle: isFa ? 'سابقه کاری' : 'Professional Experience',
      role: experience.role,
      org: experience.organization,
      current: L(experience.status, lang),
      roleDesc: L(experience.description, lang),
      highlights: L(experience.highlights, lang),
      eduTitle: 'Education & Technical Training',
      eduSub: isFa
        ? 'تحصیل علوم کامپیوتر و آموزش عملی توسعه نرم‌افزار.'
        : 'Computer Science education and practical software development training.',
      academicLabel: 'Academic Education',
      trainingLabel: 'Technical Training',
      academic: {
        title: education.academic.title,
        institution: education.academic.institution,
        dates: education.academic.dates,
        status: education.academic.status,
        desc: L(education.academic.description, lang),
      },
      training: education.training.map((item) => ({
        title: item.title,
        institution: item.institution,
        dates: item.dates,
        desc: L(item.description, lang),
        skills: item.skills,
      })),
      viewLinkedIn: isFa ? 'مشاهده در LinkedIn' : 'View on LinkedIn',
    },
    cta: {
      h1: isFa ? 'بیایید چیزی' : "Let's Build",
      h1accent: isFa ? 'بسازیم' : 'Something',
      sub: L(portfolio.cta.sub, lang),
      btn1: isFa ? 'ارتباط با من' : 'Contact Me',
      btn2: isFa ? 'مشاهده LinkedIn' : 'View LinkedIn',
    },
    contact: {
      label: isFa ? 'ارتباط با من' : 'Contact',
      h1: isFa ? 'در' : "Let's",
      h1accent: isFa ? 'ارتباط باشیم' : 'Connect',
      sub: L(portfolio.cta.sub, lang),
      name: isFa ? 'نام' : 'Name',
      namePh: isFa ? 'نام شما' : 'Your name',
      email: isFa ? 'ایمیل' : 'Email',
      emailPh: 'your@email.com',
      subject: isFa ? 'موضوع' : 'Subject',
      subjectPh: isFa ? 'موضوع پیام' : 'Your subject',
      message: isFa ? 'پیام' : 'Message',
      messagePh: isFa ? 'پیام شما...' : 'Your message...',
      send: isFa ? 'ارسال پیام' : 'Send Message',
      sending: isFa ? 'در حال ارسال...' : 'Sending...',
      successMsg: isFa
        ? 'پیام با موفقیت ارسال شد. به‌زودی با شما تماس می‌گیرم.'
        : "Message sent successfully. I'll get back to you soon.",
      errorMsg: isFa
        ? 'ارسال پیام با خطا مواجه شد. لطفاً دوباره تلاش کنید.'
        : 'Something went wrong. Please try again.',
    },
    footer: { copy: isFa ? 'تمامی حقوق محفوظ است.' : 'All rights reserved.' },
    trail: {
      home: isFa ? 'خانه' : 'Home',
      about: isFa ? 'درباره من' : 'About',
      projects: isFa ? 'پروژه‌ها' : 'Projects',
      skills: isFa ? 'مهارت‌ها' : 'Skills',
      experience: isFa ? 'سوابق' : 'Experience',
      contact: isFa ? 'ارتباط با من' : 'Contact',
      goto: isFa ? 'رفتن به بخش' : 'Go to',
    },
  }
}

export const t = {
  en: buildLang('en'),
  fa: buildLang('fa'),
}
