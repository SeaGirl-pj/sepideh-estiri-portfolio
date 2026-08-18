import raw from './portfolio.json'

export type Lang = 'en' | 'fa'

type Localized<T> = { en: T; fa: T }

export const portfolio = raw

export const personal = portfolio.personal
export const resumeMeta = portfolio.resume
export const skills = portfolio.skills
export const experience = portfolio.experience
export const education = portfolio.education
export const projects = portfolio.projects
export const featuredProject = portfolio.projects.find((p) => p.featured) ?? portfolio.projects[0]

export function L<T>(value: Localized<T>, lang: Lang): T {
  return value[lang]
}

export function socialLinks() {
  return [
    { label: 'GitHub', href: personal.github.url, value: personal.github.label },
    { label: 'LinkedIn', href: personal.linkedin.url, value: personal.linkedin.label },
    { label: 'Email', href: `mailto:${personal.email}`, value: personal.email },
  ] as const
}

/** Concise English resume payload derived only from portfolio.json */
export function getResumeData() {
  const project = featuredProject
  return {
    personal: {
      name: personal.name,
      title: personal.title,
      headline: personal.headline,
      location: personal.location.en,
      email: personal.email,
      linkedinUrl: personal.linkedin.url,
      linkedinLabel: personal.linkedin.label,
      githubUrl: personal.github.url,
      githubLabel: personal.github.label,
    },
    summary: portfolio.resume.summary,
    skills: portfolio.skills.map((s) => ({
      label: s.resumeLabel,
      items: s.items,
    })),
    experience: {
      role: experience.role,
      organization: experience.organization,
      status: experience.status.en,
      description: experience.description.en,
      highlights: experience.highlights.en,
    },
    education: {
      academic: {
        title: education.academic.title,
        institution: education.academic.institution,
        dates: education.academic.dates,
        status: education.academic.status,
        description: education.academic.description.en,
      },
      training: education.training.map((t) => ({
        title: t.title,
        institution: t.institution,
        dates: t.dates,
        description: t.description.en,
        skills: t.skills,
      })),
    },
    project: project
      ? {
          name: project.name,
          subtitle: project.subtitle,
          role: project.role,
          featuredLabel: 'Featured Project',
          organization: project.organization,
          context: project.context,
          description: project.description.en,
          features: project.features,
          technologies: project.technologies,
          featuredImage: project.images.find((i) => i.role === 'featured')?.src
            ?? project.images[0]?.src,
          screenshots: project.pdfScreenshots,
        }
      : null,
    filename: portfolio.resume.filename,
    publicPath: portfolio.resume.publicPath,
  }
}
