# PeptiForge — Peptide Sequence Generator & Docking Platform


## PeptiForge: An AI-Powered Peptide Engineering & CDMO Platform

### Features
- **Peptide Generator**: Input therapeutic targets (diabetic, PDC, antifungal, etc.) and generate optimized peptide sequences with unnatural amino acid support
- **Docking Score Engine**: Tweakable multi-parameter scoring model evaluating binding affinity, stability, specificity, solubility, and membrane permeability
- **Sequence Alignment Viewer**: Needleman-Wunsch pairwise and progressive multiple sequence alignment with interactive color-coded visualization
- **CSV Export**: One-click export of sequences, scores, and alignment data
- **PostgreSQL Database**: Supabase-powered scalable database storing peptides, docking scores, datasets, projects, activity logs, and service tokens with full-text search
- **Global Search Bar**: Instant search across CDMO services, peptide synthesis journals, external databases, and platform pages (Cmd+K shortcut)
- **Resources & Databases Page**: Curated references from DBAASP, APD, Prof. Raghava's bioinformatics portal, Ralph Weissleder's research, PDB, PubChem, and UniProt
- **User Authentication**: Secure sign-up and login with protected dashboards
- **Backend API**: Cloudflare Workers + Supabase for persistent storage and API access
- **Activity Profile**: Track generation history, saved peptides, statistics, and project progress
- **Peptide CDMO Services**: Low-cost custom peptide synthesis and global delivery led by Venkatramaiah Bommena, PhD (Peptide Chemistry, BITS-Pilani Hyderabad)
- **Version Control**: Automatic version tracking on peptide sequence changes with full history

### Design
- Dark, scientific theme with deep navy and teal accents — inspired by molecular visualization tools
- Clean card-based layout with subtle grid backgrounds evoking protein structures
- Smooth transitions and hover effects on interactive elements
- Professional typography optimized for displaying amino acid sequences (monospace for sequence data)

### Pages / Screens
- **Landing Page**: Hero section with quick-start peptide generation, features grid, CDMO services section with contact CTA, and database highlights
- **Generator Dashboard**: Therapeutic target selection, unnatural amino acid picker, scoring parameter sliders, sequence settings
- **Results View**: Generated peptide cards with docking scores, sortable/filterable, expanded score details, CSV export
- **Alignment Viewer**: Multi-sequence input, interactive alignment visualization with color-coded residues, consensus bar, export
- **Resources & Databases**: Curated peptide databases (DBAASP, APD, PDB, PubChem, UniProt), bioinformatics tools (Prof. Raghava's portal), research profiles, peptide science journals
- **User Auth Pages**: Login and registration with email/password
- **User Profile**: Stats dashboard, activity chart, saved peptides, favorites

### App Icon
- A stylized peptide helix motif with teal and deep navy gradient, featuring a molecular bond pattern and the letter "P" integrated into the helix structure
