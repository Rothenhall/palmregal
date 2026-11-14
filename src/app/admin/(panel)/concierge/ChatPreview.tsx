import { MessageCircle, Send } from 'lucide-react';

/** A small mock of what guests see: the greeting bubble beside the chat button, and the first message. */
export function ChatPreview({ name, greeting, teaserOn, teaserText }: { name: string; greeting: string; teaserOn: boolean; teaserText: string }) {
  return (
    <aside className="adm-preview" aria-label="Preview of the chat as guests see it">
      <p className="adm-preview-label">Preview</p>
      <div className="adm-pv-site" aria-hidden="true">
        <i /><i /><i />
        <div className="adm-pv-corner">
          {teaserOn ? <div className="adm-pv-bubble">{teaserText || 'Your greeting bubble'}</div> : <div className="adm-pv-off">Greeting bubble is off</div>}
          <span className="adm-pv-launcher"><MessageCircle size={20} /></span>
        </div>
      </div>
      <div className="adm-pv-chat" aria-hidden="true">
        <div className="adm-pv-chat-head"><span className="adm-pv-av"><MessageCircle size={14} /></span><b>{name || 'Assistant'}</b></div>
        <div className="adm-pv-chat-body"><p>{greeting || 'Your greeting appears here.'}</p></div>
        <div className="adm-pv-chat-input"><span>Ask about suites, facilities…</span><Send size={14} /></div>
      </div>
    </aside>
  );
}
