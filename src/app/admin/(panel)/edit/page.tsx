export const metadata = { title: 'Edit site' };

export default function Page() {
  return (
    <>
      <header className="adm-head"><h1>Edit site</h1></header>
      <div className="adm-card adm-edit">
        <p className="adm-edit-lead">Change the words and photos on your website, right on the page.</p>
        <ol className="adm-steps">
          <li><b>Click anything</b> on the page: a heading, a paragraph, a button or a photo.</li>
          <li><b>Change it</b> in the panel that opens on the left. You see the page update as you type.</li>
          <li><b>Press Save</b> when you are happy. Your changes go live on the website in about two minutes.</li>
        </ol>
        <p className="adm-edit-note">You can change words, photos, prices, links and lists such as suites and questions. The design, colours and animation stay as they are.</p>
        <p className="adm-edit-note">To use a new photo, click a picture and upload it from your phone or computer. It is made web-ready for you, and new photos appear on the website about two minutes after saving.</p>
        <a className="adm-btn adm-edit-open" href="/admin/editor/#/~/admin/preview/">Open the editor</a>
      </div>
    </>
  );
}
