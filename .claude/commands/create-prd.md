---
description: Create a Product Requirements Document from conversation
argument-hint: [output-filename]
---

# Create PRD: Generate Product Requirements Document

## Overview

Generate a comprehensive Product Requirements Document (PRD) based on the current conversation context and requirements discussed.

## Output File

Write the PRD to: `$ARGUMENTS` (default: `PRD.md`)

## PRD Structure

Create a well-structured PRD with the following sections:

### Required Sections

**1. Executive Summary**
- Concise product overview (2-3 paragraphs)
- Core value proposition
- MVP goal statement

**2. Mission**
- Product mission statement
- Core principles (3-5 key principles)

**3. Target Users**
- Primary user personas
- Technical comfort level
- Key user needs and pain points

**4. MVP Scope**
- **In Scope:** Core functionality for MVP (use ✅ checkboxes)
- **Out of Scope:** Features deferred to future phases (use ❌ checkboxes)

**5. User Stories**
- Primary user stories (5-8 stories)
- Format: "As a [user], I want to [action], so that [benefit]"
- Include concrete examples

**6. Core Architecture & Patterns**
- High-level architecture approach
- Directory structure
- Key design patterns
- Technology-specific patterns

**7. Tools/Features**
- Detailed feature specifications
- Tool designs with purpose and operations

**8. Technology Stack**
- Backend/Frontend technologies with versions
- Dependencies and libraries
- Third-party integrations

**9. Security & Configuration**
- Authentication/authorization approach
- Configuration management
- Security scope

**10. API Specification** (if applicable)
- Endpoint definitions
- Request/response formats
- Example payloads

**11. Success Criteria**
- MVP success definition
- Functional requirements (checkboxes)
- Quality indicators

**12. Implementation Phases**
- Break down into 3-4 phases
- Each phase: Goal, Deliverables, Validation

**13. Future Considerations**
- Post-MVP enhancements
- Advanced features for later

**14. Risks & Mitigations**
- 3-5 key risks with mitigation strategies

## Instructions

### 1. Extract Requirements
- Review entire conversation history
- Identify explicit requirements and implicit needs
- Note technical constraints and preferences
- Capture user goals and success criteria

### 2. Synthesize Information
- Organize requirements into sections
- Fill in reasonable assumptions where details missing
- Maintain consistency across sections
- Ensure technical feasibility

### 3. Write the PRD
- Use clear, professional language
- Include concrete examples
- Use markdown formatting
- Add code snippets for technical sections

### 4. Quality Checks
- ✅ All required sections present
- ✅ User stories have clear benefits
- ✅ MVP scope is realistic
- ✅ Technology choices justified
- ✅ Implementation phases actionable
- ✅ Success criteria measurable

## Style Guidelines

- **Tone:** Professional, clear, action-oriented
- **Format:** Markdown with headings, lists, code blocks, tables
- **Checkboxes:** Use ✅ for in-scope, ❌ for out-of-scope
- **Specificity:** Prefer concrete examples over abstract descriptions

## Output Confirmation

After creating the PRD:
1. Confirm file path
2. Provide brief summary
3. Highlight assumptions made
4. Suggest next steps

## Notes

- If critical information missing, ask clarifying questions first
- Adapt section depth based on available details
- For technical products, emphasize architecture
- For user-facing products, emphasize user stories
