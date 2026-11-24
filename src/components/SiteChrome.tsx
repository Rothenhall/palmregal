import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { IconSprite } from '@/components/Icons';
import { Motion } from '@/components/Motion';
import { BookingDialog } from '@/components/BookingDialog';
import type { Edit, SiteContent } from '@/content/types';
import { ChatLauncher } from '@/components/ChatLauncher';
import { Preloader } from '@/components/Preloader';
import { contentPhotoGroups } from '@/lib/preload';
import '@/components/mobile-fixes.css';

/* The loading screen, header, the page, footer, the booking picker and motion. `f` is the editor's click-to-edit
   hook: absent on the public site (the editor's preview shows no loading screen). */
export function SiteChrome({ content, f, children }: { content: SiteContent; f?: Edit; children: React.ReactNode }) {
  return (
    <>
      {!f && <Preloader groups={contentPhotoGroups(content)} name={content.general.name} tagline={content.general.tagline} />}
      <a className="skip" href="#main">Skip to content</a>
      <IconSprite />
      <Header content={content} f={f} />
      <main id="main">{children}</main>
      <Footer content={content} f={f} />
      {!f && <ChatLauncher />}
      <BookingDialog bookingUrl={content.general.bookingUrl} />
      <Motion />
    </>
  );
}
