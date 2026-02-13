# Contributing

Thank you for considering contributing to the ArcGIS Basemap Styles Service v2 Playground!

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/esri-basemap-styles-service-v2-playground.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `npm install`
5. Make your changes
6. Run tests: `npm test`
7. Commit your changes: `git commit -m "feat: add amazing feature"`
8. Push to your fork: `git push origin feature/your-feature-name`
9. Open a Pull Request

## Development Workflow

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test additions or updates

### Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>

[optional body]

[optional footer]
```

**Types**:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Build process, dependencies, etc.

**Examples**:
```
feat: add worldview parameter control
fix: resolve cache TTL issue
docs: update template contribution guide
```

### Code Style

- Run `npm run lint` before committing
- Follow existing code patterns
- Write clear, self-documenting code
- Add comments for complex logic
- Use React functional components and hooks
- Prefer Calcite Design System components

### Testing

- Write tests for new features
- Ensure all tests pass: `npm test`
- Maintain test coverage above 80%
- Test edge cases and error scenarios

## Contributing Templates

We welcome community contributions for:
- New library templates (OpenLayers, CesiumJS, etc.)
- Library version updates
- Template improvements

### Adding a New Template

1. Create HTML file: `src/templates/html/[library-name].html`
   - Use standard placeholders like `{{styleUrl}}`, `{{center}}`, `{{zoom}}`
   - Include real, working HTML code (not JS template literals)
   - Add security comments about API key best practices
   - Link to documentation and examples

2. Create config file: `src/templates/config/[library-name].json`
   ```json
   {
     "name": "Library Name",
     "version": "X.Y.Z",
     "cdnJS": "https://...",
     "cdnCSS": "https://...",
     "docs": "https://...",
     "attribution": "auto"
   }
   ```

3. Add to registry in `src/templates/index.js`

4. Test with multiple styles and parameter combinations

5. Submit PR with:
   - Example output HTML
   - Screenshot of generated code working
   - Note on library version tested

### Template Requirements

Each template MUST:
- Generate a fully functional standalone HTML file
- Include proper library CDN links with specific versions
- Show exact map state from playground
- Include Esri attribution (automatic with MapLibre, requires Esri Leaflet plugin for Leaflet)
- Add security comments about API key scoping and rotation
- Add helpful comments for customization
- Reference examples from developers.arcgis.com

## Pull Request Process

1. Update documentation for any new features
2. Add tests for your changes
3. Ensure all tests pass
4. Update CHANGELOG.md under [Unreleased]
5. Request review from maintainers
6. Address review feedback
7. Maintainer will merge when approved

## Pull Request Checklist

- [ ] Code follows project style guidelines
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] No merge conflicts
- [ ] Commit messages follow conventions

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Assume good intentions
- Respect differing viewpoints

### Unacceptable Behavior

- Harassment or discriminatory language
- Personal attacks
- Trolling or insulting comments
- Publishing others' private information

## Questions?

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Tag issues appropriately (`bug`, `feature`, `question`, `template`, etc.)

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing! 🎉
