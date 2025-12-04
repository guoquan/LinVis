# Agent Notes for linear-vis Project

This document tracks decisions, thoughts, and progress made by the AI agent during the development of the 3D linear algebra visualization tool.

## Project Goal:
Develop a web-based interactive 3D visualization tool for teaching linear algebra concepts:
- Visualize the span of a set of vectors.
- Determine if a new vector lies within the span.
- Allow observation from different angles in a 3D space.
- Demonstrate linear combinations, linear dependence/independence, and rank of a set of vectors.

## Technical Stack Proposed:
- **Frontend:** React (Vite)
- **3D Engine:** Three.js via @react-three/fiber, @react-three/drei
- **Math Library:** mathjs
- **Styling:** CSS Modules / Tailwind CSS

## Current Plan:
1.  **Project Initialization and Basic 3D Environment Setup**
    *   Set up React + TypeScript project (using Vite).
    *   Configure 3D canvas with AxesHelper and GridHelper.
    *   Add OrbitControls for camera manipulation.
2.  **Vector Object Component (`VectorArrow`)**
3.  **Core Math Logic Implementation**
4.  **Span Visualization Rendering**
5.  **UI Interaction Panel Development**