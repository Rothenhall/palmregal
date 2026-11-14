import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { IconSprite, Icon } from '@/components/Icons';
import { Motion } from '@/components/Motion';
import { BookingDialog } from '@/components/BookingDialog';
import type { Edit, SiteContent } from '@/content/types';
import { waHref } from '@/lib/book';
import { ChatLauncher } from '@/components/ChatLauncher';

/* Header, the page, footer, the booking picker and motion. `f` is the editor's click-to-edit hook: absent on the public site. */
export function SiteChrome({ content, f, children }: { content: SiteContent; f?: Edit; children: React.ReactNode }) {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <IconSprite />
      <Header content={content} f={f} />
      <main id="main">{children}</main>
      <Footer content={content} f={f} />
      <a className="wa" href={waHref(content.general)} aria-label="Chat with Palm Regal on WhatsApp"><span className="t">Chat with us</span><span className="b"><Icon id="i-wa" /></span></a>
      {!f && <ChatLauncher />}
      <BookingDialog bookingUrl={content.general.bookingUrl} />
      <Motion />
    </>
  );
}
