/* "Reasons to stay in": the 13 facilities in four groups, as full-screen stacking cards that run
   edge to edge, words on one half and the photograph filling the other. Each card sticks;
   the next slides over it while the one before recedes (the shared [data-stack] rule in Motion). */
import Link from 'next/link';
import { facilities, facilityGroups } from '@/content/site';
import { Icon } from './Icons';

const TONES = ['teal', 'dusk', 'paper', 'canopy'];
const NUM = ['I', 'II', 'III', 'IV'];

export function DelightsStack() {
  return (
    <div className="dstack-wrap">
      <div className="dstack" data-stack>
        {facilityGroups.map((g, gi) => {
          const list = facilities.filter(f => f.group === g.id);
          const pics = list.filter(f => f.img && !f.standIn).slice(0, 2);
          return (
            <article className={'dcard dcard--' + TONES[gi]} key={g.id}>
              <div className="dcard-body">
                <span className="dcard-no">{NUM[gi]}</span>
                <h3>{g.title} <em>{g.em}</em></h3>
                <p className="dcard-lede">{g.text}</p>
                <ul>
                  {list.map(f => <li key={f.name}><b>{f.name}{f.tag && <i> {f.tag}</i>}</b><span>{f.text}</span></li>)}
                </ul>
              </div>
              <div className="dcard-media">
                {pics[0] && <div className="dcard-main"><img src={pics[0].img} alt={pics[0].name} loading="lazy" /></div>}
                {pics[1] && <div className="dcard-small"><img src={pics[1].img} alt={pics[1].name} loading="lazy" /></div>}
              </div>
            </article>
          );
        })}
      </div>
      <div className="wrap"><Link className="btn btn--line dstack-all" href="/facilities/">See all {facilities.length} facilities <Icon id="i-arrow" /></Link></div>
    </div>
  );
}
