# Education Domain Expert Notes: Search & RAG (B12)

## 1. Educational Search and RAG Overview

Education is a natural fit for Search & RAG: students ask questions, and answers exist in textbooks, lectures, and course materials. The challenge is making this knowledge accessible through intelligent search.

### Core Use Cases
- **Course content search**: Find relevant lectures, slides, and readings across a curriculum
- **Q&A over textbooks**: "Explain the law of supply and demand with examples" over economics textbook
- **Assignment help**: Search past exams, solutions, and rubrics for study guidance
- **Research discovery**: Find relevant papers and references across institutional repositories
- **Administrative search**: Policy documents, enrollment procedures, financial aid information

## 2. Vietnamese Education Landscape

### Regulatory Context
- **MOET (Bo Giao Duc va Dao Tao)**: Ministry of Education and Training; governs all education policy
- **CDIO framework**: Adopted by many Vietnamese universities for engineering education
- **National curriculum**: Standardized K-12 curriculum (Chuong Trinh Giao Duc Pho Thong 2018)
- **University autonomy**: Growing but still limited; MOET approval needed for programs
- **Digital transformation**: Circular 09/2021 mandates digital transformation in education

### Scale
- 430+ universities and colleges
- 24M+ K-12 students
- 2M+ university students
- 1.2M+ teachers and lecturers
- Rapidly growing demand for quality educational content in Vietnamese

## 3. E-Learning Platforms in Vietnam

### Topica EdTech Group
- Largest Vietnamese e-learning company
- Operates Topica Uni (online MBA), Topica Native (English learning)
- 500K+ learners across platforms
- Potential integration: RAG Q&A over their course materials

### FUNiX
- FPT University's online education arm
- Mentor-based model with self-paced online courses
- Tech-focused curriculum (programming, data science, AI)
- Search use case: Help students find relevant lessons across course library

### Coursera / edX (Vietnam Presence)
- Growing Vietnamese learner base (~500K on Coursera)
- Vietnamese subtitles and translations available for popular courses
- Opportunity: Vietnamese-language RAG over translated course content

### Hoc Mai / VioEdu
- K-12 focused online learning platforms
- Video lessons aligned with Vietnamese national curriculum
- Search use case: Students asking questions about specific curriculum topics

### Other Players
- Manabie (K-12 adaptive learning)
- Marathon Education (exam prep)
- Elsa Speak (English pronunciation — AI-native)

## 4. Student Question Answering with RAG

### Architecture for Education RAG
```
[Student Question] -> [Query Understanding] -> [Curriculum-Aware Retrieval]
                                                        |
                                          [Textbook Chunks] + [Lecture Notes] + [Past Exams]
                                                        |
                                              [LLM Generation with Pedagogical Prompt]
                                                        |
                                          [Answer with Explanation + Sources + Follow-up Questions]
```

### Pedagogical Prompt Engineering
- Do NOT just give the answer — guide the student through reasoning
- Provide step-by-step explanations appropriate to grade level
- Reference specific textbook pages/sections for further reading
- Suggest related topics for deeper understanding
- Adapt language complexity to student level (grade 6 vs university)

### Example RAG Prompt
```
You are a Vietnamese educational tutor. Given the student's question and the
following textbook excerpts, provide a clear explanation that:
1. Explains the concept at the appropriate grade level
2. Gives a concrete example
3. References the source material
4. Suggests one follow-up question for deeper learning
Answer in Vietnamese unless the student asks in English.
```

## 5. Curriculum-Aligned RAG

### Chunking by Curriculum Structure
- **K-12**: Chunk by Bai Hoc (lesson), Mon Hoc (subject), Lop (grade)
- **University**: Chunk by course, module, lecture, topic
- **Metadata**: Subject, grade/year, semester, textbook edition, MOET curriculum code
- **Cross-references**: Link related topics across subjects and grade levels

### Curriculum Knowledge Graph
- Map relationships: topic -> prerequisites, related topics, learning objectives
- Enable queries like "What should I study before learning calculus?"
- Track curriculum changes across years (2018 curriculum reform impact)

### Content Sources for Indexing
- Official MOET textbooks (Sach Giao Khoa)
- University lecture notes and slides (with permission)
- Past examination papers (De Thi)
- Educational videos transcripts
- Wikipedia Vietnamese (for supplementary reference)

## 6. Technical Considerations for Education Search

### Vietnamese Academic Language
- Academic Vietnamese differs from conversational Vietnamese
- Mathematical notation and formulas need special handling in chunks
- Science terms often have both Vietnamese and English/Latin equivalents
- Historical dates and events require precise matching

### Multi-Modal Content
- Textbooks contain diagrams, charts, and formulas
- OCR quality for scanned Vietnamese textbooks varies significantly
- Consider image-text embedding models for diagram search
- LaTeX/MathML handling for mathematical content

### Access Control
- Students should only access materials for enrolled courses
- Exam answers restricted until after exam period
- Teacher-only materials separated from student-accessible content
- Institutional licensing for textbook content

## 7. Market Size and Opportunity

### Vietnam EdTech Market
- Market size: $100-150M (2025), projected $300M+ by 2028
- 70% smartphone penetration among students drives mobile learning
- COVID-19 accelerated online learning adoption permanently
- Government budget: 20% of national budget allocated to education

### Search & RAG Opportunity in Education
- **K-12 tutoring**: AI tutor answering curriculum questions ($30-50M TAM)
- **University search**: Institutional knowledge management ($10-20M TAM)
- **Exam prep**: Past exam search and Q&A ($15-25M TAM)
- **Teacher tools**: Lesson planning and resource discovery ($10-15M TAM)

### Revenue Models
- Freemium app: Free basic search, paid AI tutoring ($3-5/month)
- Institutional license: University-wide deployment ($5K-50K/year)
- API for EdTech platforms: Per-query pricing ($0.01-0.05/query)
- Content partnerships: Revenue share with textbook publishers

## 8. Recommendations

1. Education is the second-highest-value B12 vertical in Vietnam after legal (larger market, lower willingness to pay per user)
2. Start with K-12 exam prep — highest demand, clearest content structure, most engaged users
3. Pedagogical prompt engineering is critical: the RAG system must teach, not just answer
4. Curriculum-aligned metadata (grade, subject, lesson) must be embedded in every chunk
5. Partner with textbook publishers (NXB Giao Duc) for authorized content access
6. Vietnamese academic language requires careful handling — test with actual students
7. Mobile-first design is mandatory: 80%+ of Vietnamese students access learning on phones
8. Consider gamification: streak tracking, difficulty progression, achievement badges alongside search
