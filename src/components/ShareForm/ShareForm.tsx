import React from 'react';
import styles from './ShareForm.module.scss';

export default function ShareForm({ shareId }: { shareId: string }) {
  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.target.setSelectionRange(0, e.target.value.length);
  }

  const basepath =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3001'
      : 'https://na.today';

  return (
    <div className={styles.shareForm}>
      <input
        className={styles.url}
        type="text"
        value={`${basepath}/r/${shareId}`}
        onFocus={handleFocus}
      />
      <div>
        שאלון ששותף יישמר בענן מבלי שעבר הצפנה. עם זאת, רק לאנשים שקבלו את הלינק
        תהיה גישה אליו.
      </div>
    </div>
  );
}
