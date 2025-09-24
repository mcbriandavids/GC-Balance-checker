GC Balance Checker (React + Electron Desktop App)

Version: 1.0
Author: IMONISA OGHENEKEVWE BRIAN
1.0

Platform: Windows 7 / 10 / 11
Table of Contents

Project Overview

Features

## Features

Installation

## Usage

Data Format

Validation Logic

Table Columns

Project Structure

Future Improvements

License

Project Overview

GC Balance Checker is a desktop application designed to validate gas chromatography (GC) data. It ensures that the sum of gas constituents (C1 → nC5) matches the reported Total Gas within a ±1% tolerance.

Built with React for the user interface and Electron for packaging, it works on Windows 7, 10, and 11.
Features

Input Options:

Copy & paste GC data directly into the app.

Import CSV or Excel (.xlsx/.xls) files.

Data Conversion & Validation:

Convert ppm components to units: 1 unit = 200 ppm.

Sum components to get Calculated Total Gas.

Compare Calculated Total Gas with Reported Total Gas within ±1% tolerance.

Results Visualization:

Row coloring:

Green → GOOD (Calculated ≈ Reported)

Red → BAD (Calculated ≠ Reported)

Status column (GOOD / BAD)

Total Gas percentage column (1% = 10,000 ppm)

Editing & Normalization:

Editable table with real-time recalculation.

Optional normalize button: scale components to match reported Total Gas.

Export:

## Requirements

Node.js >= 18.x

npm >= 9.x

Platform: Windows 7 / 10 / 11
npm >= 9.x

Windows 7 / 10 / 11

## Steps

Download or clone the project folder.

Open terminal and navigate to the project directory:

cd Gc-Balance-Checker

Install dependencies:

npm install

Run development version (React + Electron):

npm run dev

Build production desktop app:

npm run build
npm run dist

Usage

Launch the app (desktop exe or npm run dev).

Input your GC data:

Paste rows: Tab/comma/space-separated, header optional.

Upload file: CSV or Excel (.xlsx/.xls).

View the table:

Calculated Total Gas is automatically computed from components.

Row color indicates whether the calculated total matches the reported total.

Status column shows GOOD / BAD.

Normalize a row if needed (adjust components to match reported Total Gas).

Export results to CSV for documentation.

## Data Format

Expected Columns:

ReportedTotalGas, C1, C2, C3, iC4, nC4, iC5, nC5

Notes:

ReportedTotalGas → units

Components (C1–nC5) → ppm

Conversion: units = ppm / 200

Percent calculation: percent = (CalculatedTotalGas \* 200) / 10000

Example Row:

ReportedTotalGas C1 C2 C3 iC4 nC4 iC5 nC5
10 2000 400 600 200 300 150 150

## Validation Logic

Convert each component ppm → units:

units = ppm / 200

Sum all components → Calculated Total Gas.

Compare Calculated Total Gas to Reported Total Gas:

GOOD: |Calculated – Reported| ≤ 1% of reported total.

BAD: |Calculated – Reported| > 1%.

Calculate Total Gas %:

Total% = (CalculatedTotalGas \* 200) / 10000

## Table Columns

Column Name Description
Reported Total Gas (u) Total Gas as reported by the GC
C1 (ppm) – nC5 (ppm) Individual gas components in ppm
Calculated Total (u) Sum of components converted to units
Total % Calculated total as a percentage
Status GOOD / BAD based on ±1% tolerance

## Project Structure

Gc-Balance-Checker/
├── package.json # Dependencies & scripts
├── electron/
│ ├── main.js # Electron main process
│ └── preload.js # Node <-> React bridge
├── public/
│ └── index.html # React entry point
├── src/
│ ├── App.jsx # App wrapper
│ ├── components/
│ │ └── GC-Balance-Checker-Table.jsx # Table logic & UI
│ └── index.js # React DOM render
└── vite.config.js # Vite build configuration

## Future Improvements

Persistent storage (history of imports and validation results).

Printable PDF reports for QC documentation.

Enhanced UI with Tailwind or Material-UI.

Unit toggle support (ppm ↔ units).

Multi-sheet Excel import support.

## License

MIT License – free to use, modify, and distribute.

## Author

IMONISA OGHENEKEVWE BRIAN...
