# Contributing to MedAI Advanced

We love your input! We want to make contributing to MedAI Advanced as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## Pull Requests

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Code Style

### Frontend (React/TypeScript)
- Use TypeScript for all new code
- Follow React functional component patterns
- Use Tailwind CSS for styling
- Follow the existing component structure

### Backend (Python)
- Follow PEP 8 style guidelines
- Use type hints where possible
- Document functions with docstrings
- Follow the existing FastAPI patterns

## Any contributions you make will be under the MIT Software License

In short, when you submit code changes, your submissions are understood to be under the same [MIT License](LICENSE) that covers the project.

## Report bugs using GitHub's [issues](https://github.com/yourusername/medai-advanced/issues)

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/yourusername/medai-advanced/issues/new).

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Use a Consistent Coding Style

### JavaScript/TypeScript
```typescript
// Good
const analyzeSymptoms = async (symptoms: string): Promise<AnalysisResult> => {
  // Implementation
}

// Component naming
const AIResultCard: React.FC<AIResultCardProps> = ({ condition, severity }) => {
  // Implementation
}
```

### Python
```python
# Good
def analyze_symptoms(symptoms: str) -> Dict[str, Any]:
    """Analyze medical symptoms using AI models."""
    # Implementation
    pass

class MedicalAnalyzer:
    """Medical AI analysis coordinator."""
    
    def __init__(self) -> None:
        self.models = {}
```

## Medical AI Guidelines

When contributing to medical AI functionality:

1. **Accuracy First**: Ensure any medical logic is evidence-based
2. **Safety**: Always include appropriate disclaimers
3. **Testing**: Test with diverse symptom scenarios
4. **Documentation**: Document medical terminology and logic clearly
5. **Validation**: Consider medical validation for critical features

## Code Review Process

1. All code changes require review
2. Medical-related changes require additional scrutiny
3. Performance changes should include benchmarks
4. UI changes should include screenshots

## Community Guidelines

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Remember this is healthcare-related software - accuracy and safety matter

## Getting Help

- Join our [Discussions](https://github.com/yourusername/medai-advanced/discussions)
- Check existing [Issues](https://github.com/yourusername/medai-advanced/issues)
- Read the [Documentation](docs/README.md)

## Recognition

Contributors will be recognized in:
- README acknowledgments
- Release notes
- Contributor list

Thank you for contributing to advancing AI in healthcare! 🏥✨
