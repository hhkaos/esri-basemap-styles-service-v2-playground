---
name: init
description: Initialize a vibe coding project with documentation, skills, git configuration, and GitHub Actions. Use when the user wants to set up a new project structure for AI-assisted development.
argument-hint: [project-name]
user-invocable: true
allowed-tools: Bash, Write, Read, Edit, Glob, Grep, AskUserQuestion
---

# Initialize Vibe Coding Project

Set up a comprehensive project structure optimized for vibe coding with Claude.

## Step 1: Gather Requirements

Use AskUserQuestion to ask the user what they want to set up:

1. **Custom Skills**: Which custom skills would they like?
   - `/ship` - Ensure tests pass, update CHANGELOG.md and TODO.md, stage changes, generate commit message, commit, and push
   - `/release` - Create versioned release with changelog, git tag, and GitHub Release
   - `/review-spec` - Review project specification in detail with Q&A, update SPEC.md

2. **Documentation Files**: Which documentation files to create?
   - `docs/SPEC.md` - Project specification (with initial interactive setup)
   - `docs/CHECKLIST.md` - Feature and task tracking
   - `docs/TODO.md` - Roadmap and progress tracking
   - `CLAUDE.md` - Claude Code context (code style, tech stack, conventions, known mistakes)
   - `CHANGELOG.md` - Track unreleased changes and version history
   - `CONTRIBUTING.md` - Contribution guidelines
   - `LICENSE.md` - Project license
   - `SECURITY.md` - Security policy

3. **Git Configuration**:
   - Set up git aliases to differentiate AI-generated commits from human commits?
     - `git ch "message"` - Human commits
     - `git cai "message"` - AI commits (prefixed with "AI:", different author)

4. **GitHub Actions**:
   - Deploy to GitHub Pages?
   - Set up CI/CD for testing?

5. **Commit Convention**:
   - Use Conventional Commits (feat, fix, docs, refactor, test, chore)?
   - Use Husky pre-commit hooks?

## Step 2: Create Directory Structure

```
.
├── .claude/
│   ├── CLAUDE.md
│   └── skills/
│       ├── ship/
│       ├── release/
│       └── review-spec/
├── .github/
│   └── workflows/
│       ├── deploy.yml (if requested)
│       └── test.yml (if requested)
├── docs/
│   ├── SPEC.md
│   ├── CHECKLIST.md
│   └── TODO.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE.md
└── SECURITY.md
```

## Step 3: Create Files Based on User Choices

### Always Create:
- `CLAUDE.md` using the template from [templates/CLAUDE.md.template](templates/CLAUDE.md.template)

### Conditionally Create:

#### If `/ship` skill requested:
Create `.claude/skills/ship/SKILL.md` with:
- Pre-flight test validation
- CHANGELOG.md update (add to [Unreleased] section)
- TODO.md update (mark completed items)
- Stage files by name (never `git add .`)
- Generate conventional commit message
- Commit and push

#### If `/release` skill requested:
Create `.claude/skills/release/SKILL.md` with:
1. Move CHANGELOG.md [Unreleased] → [vX.Y.Z]
2. Update package.json version (if exists)
3. Create git tag
4. Push tag
5. Create GitHub Release with changelog

#### If `/review-spec` skill requested:
Create `.claude/skills/review-spec/SKILL.md` to:
- Read docs/SPEC.md
- Ask in-depth questions about implementation, UI/UX, concerns, tradeoffs
- Update SPEC.md with answers

#### Documentation Files:
- `docs/SPEC.md` - If requested, help user write initial specification
- `docs/CHECKLIST.md` - Feature checklist template
- `docs/TODO.md` - Roadmap template
- `CHANGELOG.md` - With [Unreleased] section
- `CONTRIBUTING.md` - Contribution guidelines
- `LICENSE.md` - Ask user for license preference (MIT, Apache 2.0, GPL-3.0, etc.)
- `SECURITY.md` - Security policy template

#### Git Aliases:
If requested, set up:
```bash
git config alias.ch '!f() { git commit -m "$1"; }; f'
git config alias.cai '!f() { git commit -m "AI: $1" --author="AI Assistant <ai@example.com>"; }; f'
```

Ask if they want global (`--global`) or local (repository-only) aliases.

#### GitHub Actions:
- **Deploy to Pages**: Create `.github/workflows/deploy.yml`
- **Test CI**: Create `.github/workflows/test.yml`

## Step 4: Interactive SPEC.md Setup

If user wants `docs/SPEC.md`:
1. Create the file with basic template
2. Ask user about their project idea
3. Fill in initial specification
4. Offer to run `/review-spec` immediately to refine it

## Step 5: Update CLAUDE.md

Ensure CLAUDE.md includes:
- Git conventions section with commit types
- Custom skills documentation
- Documentation maintenance rules
- Security rules (what never to commit)
- AI vs Human commit convention if using git aliases

## Step 6: Summary

After setup, provide:
- List of files created
- Git aliases configured (if any)
- Next steps:
  - Review CLAUDE.md and customize
  - Fill out SPEC.md (or run /review-spec)
  - Start coding
  - Use /ship to commit changes
  - Use /release when ready to tag a version

## Templates

All templates are in the `templates/` directory:
- [CLAUDE.md.template](templates/CLAUDE.md.template)
- [SPEC.md.template](templates/SPEC.md.template)
- [CHECKLIST.md.template](templates/CHECKLIST.md.template)
- [TODO.md.template](templates/TODO.md.template)
- [CHANGELOG.md.template](templates/CHANGELOG.md.template)
- [CONTRIBUTING.md.template](templates/CONTRIBUTING.md.template)
- [SECURITY.md.template](templates/SECURITY.md.template)
- [ship-skill.template](templates/ship-skill.template)
- [release-skill.template](templates/release-skill.template)
- [review-spec-skill.template](templates/review-spec-skill.template)

## Important Notes

- Ask user preferences BEFORE creating files
- Use AskUserQuestion with multiple questions to gather all info at once
- Create a .gitignore if one doesn't exist
- Never commit sensitive files (*.pem, .env, private keys)
- Always stage files by name, never use `git add -A`
