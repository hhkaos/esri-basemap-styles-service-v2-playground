# Init Skill

Initialize a vibe coding project with comprehensive documentation, custom skills, git configuration, and GitHub Actions.

## Usage

```bash
/init [project-name]
```

Or simply ask Claude:
```
Initialize a new vibe coding project
Set up my project for vibe coding
```

## What It Does

The `/init` skill sets up a complete project structure optimized for AI-assisted development (vibe coding). It will:

1. **Ask for your preferences** using interactive questions
2. **Create custom skills** based on your needs
3. **Generate documentation** files
4. **Configure git** with AI-aware commit conventions
5. **Set up CI/CD** with GitHub Actions

## Interactive Setup

The skill will ask you about:

### Custom Skills
- **`/ship`** - Run tests, update docs, commit, and push
- **`/release`** - Create versioned releases with tags
- **`/review-spec`** - Interactively review and refine your project spec

### Documentation
- `docs/SPEC.md` - Project specification
- `docs/CHECKLIST.md` - Feature and task tracking
- `docs/TODO.md` - Roadmap tracking
- `CLAUDE.md` - AI assistant context and guidelines
- `CHANGELOG.md` - Version history
- `CONTRIBUTING.md` - Contribution guidelines
- `LICENSE.md` - Project license
- `SECURITY.md` - Security policy

### Git Configuration
- AI vs Human commit tracking
  - `git ch "message"` - Human commits
  - `git cai "message"` - AI commits (prefixed, different author)
- Global or local aliases

### GitHub Actions
- Deploy to GitHub Pages
- CI/CD testing pipeline

### Project Settings
- Conventional Commits
- Pre-commit hooks (Husky)

## Templates

All templates are in the `templates/` directory:

- [CLAUDE.md.template](templates/CLAUDE.md.template) - AI assistant context
- [SPEC.md.template](templates/SPEC.md.template) - Project specification
- [CHECKLIST.md.template](templates/CHECKLIST.md.template) - Task tracking
- [TODO.md.template](templates/TODO.md.template) - Roadmap
- [CHANGELOG.md.template](templates/CHANGELOG.md.template) - Version history
- [CONTRIBUTING.md.template](templates/CONTRIBUTING.md.template) - Contribution guide
- [SECURITY.md.template](templates/SECURITY.md.template) - Security policy
- [ship-skill.template](templates/ship-skill.template) - Ship skill definition
- [release-skill.template](templates/release-skill.template) - Release skill definition
- [review-spec-skill.template](templates/review-spec-skill.template) - Review spec skill definition
- [deploy-workflow.template](templates/deploy-workflow.template) - GitHub Pages deployment
- [test-workflow.template](templates/test-workflow.template) - CI testing
- [LICENSE-MIT.template](templates/LICENSE-MIT.template) - MIT license
- [gitignore.template](templates/gitignore.template) - Git ignore rules

## Example Workflow

After initialization, your workflow might look like:

1. **Plan**: Define your idea in `docs/SPEC.md`
2. **Review**: Run `/review-spec` to refine the specification
3. **Code**: Build features, tracked in `docs/TODO.md`
4. **Ship**: Use `/ship` to commit changes with proper documentation
5. **Release**: Use `/release` to tag versions and publish releases

## Benefits of Vibe Coding Setup

- **AI-Aware**: CLAUDE.md keeps Claude informed about your project
- **Documented**: Comprehensive docs from day one
- **Traceable**: Distinguish AI vs human contributions
- **Professional**: Industry-standard workflows and conventions
- **Automated**: Custom skills reduce repetitive tasks

## Customization

After initialization, you can customize:
- Edit `CLAUDE.md` with project-specific guidelines
- Modify skill templates to match your workflow
- Adjust git aliases and commit conventions
- Configure GitHub Actions for your stack

## Files Created

Depending on your choices, the init skill creates:

```
your-project/
├── .claude/
│   ├── CLAUDE.md
│   └── skills/
│       ├── ship/SKILL.md
│       ├── release/SKILL.md
│       └── review-spec/SKILL.md
├── .github/
│   └── workflows/
│       ├── deploy.yml
│       └── test.yml
├── docs/
│   ├── SPEC.md
│   ├── CHECKLIST.md
│   └── TODO.md
├── .gitignore
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE.md
└── SECURITY.md
```

## Next Steps

After running `/init`:

1. Review and customize `CLAUDE.md`
2. Fill out `docs/SPEC.md` or run `/review-spec`
3. Start coding!
4. Use `/ship` when ready to commit
5. Use `/release` when ready to publish

---

Happy vibe coding! 🚀
