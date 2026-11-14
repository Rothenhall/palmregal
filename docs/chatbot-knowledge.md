# Chatbot knowledge base and human handoff

## Knowledge base (Admin, Knowledge)

- Admins upload PDF or Word (.docx) files (up to 4 MB each) or paste a plain-text note. Old .doc files are not supported (the page says to save as .docx). Scanned PDFs have no text layer; paste the text as a note.
- Extraction runs on the server: `unpdf` for PDF (pure JavaScript build of PDF.js, no native binaries, works on Vercel functions) and `mammoth` for .docx (pure JavaScript). The file type is checked from its first bytes, not just the extension. Only the extracted text is kept, as chunks of about 1,000 characters with 150 overlap, in Redis under `<prefix>chat:kb:*`. The upload is a route handler (`/admin/knowledge/upload/`) because server actions cap bodies at 1 MB; every upload and action checks `auth()`.
- Limits: 25 documents, 400,000 characters in total, 120,000 per document, 20,000 per note.
- Each guest message is scored against the enabled chunks with BM25 (Unicode-aware tokens, so romanized and native-script text both work as long as the words match). The best 3 chunks (at most 3,000 characters) go into the system prompt next to the website facts. If nothing scores well, only the document titles are mentioned, so the model can say it has more material without paying for the text. The chunk index is cached in memory for 60 seconds per server instance.
- Cost: at most about 800 extra input tokens per message.
- Limitation: keyword matching misses synonyms and cross-language questions (a Hindi question against an English document). Upgrade path when the knowledge base grows beyond a few dozen pages: Upstash Vector (managed semantic search, same dashboard as the Redis database). Embed each chunk at upload time, query with the guest message, and replace `knowledgeFor()` in `src/lib/chat/kb.ts`; nothing else changes.

## Human handoff

- The guest is never left stuck. A low-key "Talk to our team" link is always in the chat header, and a chip is shown when the chat opens.
- The model ends a reply with `[[HANDOFF:human|unknown|frustrated]]` when the guest asks for a person, the answer is not in the facts or documents, or the guest is frustrated. The server strips the marker from the text (also while streaming), stores the reason on the conversation, and sends a `handoff` event; the widget then shows a card with WhatsApp (when the number is set in Edit site), Call and Email. A server-side phrase check (`src/lib/chat/handoff.ts`) triggers the same event for explicit requests in English and common romanized Hindi, Telugu, Odia, Tamil, Kannada, Bengali and Malayalam, even if the model forgets the marker.
- The WhatsApp and email text carries the guest's last question so they do not repeat themselves. No name, ID or contact details are added.
- Admin, Conversations, "Unanswered and handoffs" lists conversations with a handoff and the questions the bot could not answer (`unknown`), which is the to-do list for the Knowledge page. Thumbs up and down on replies are stored per message and shown in the transcript.
